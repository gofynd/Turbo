import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import Modal from "../core/modal/modal";
import RadioIcon from "../../assets/images/radio";
import { DATE_FILTERS } from "../../helper/constant";
import { useGlobalTranslation } from "fdk-core/utils";
import { useNavigate } from "fdk-core/utils";
import { translateDynamicLabel } from "../../helper/utils";
import dayjs from "dayjs";
import FyDatePicker from "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker";
import "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker.css";
import styles from "./styles/order-filter-modal.less";

const DEFAULT_DATE_FILTER_VALUE = 90; // "Last 90 days"

function OrderFilterModal({ isOpen, onClose, filters }) {
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const DEFAULT_STATUS_FILTER = null; // All Status

  // Custom date range state
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [dateError, setDateError] = useState("");

  // Tab state - default to "filter" to match the UI
  const [activeTab, setActiveTab] = useState("filter");

  const resolveDateSelectionFromParams = useCallback((queryParams) => {
    const selected_date_filter = queryParams.get("selected_date_filter");
    const custom_start = queryParams.get("custom_start_date");
    const custom_end = queryParams.get("custom_end_date");

    if (custom_start && custom_end) {
      return {
        selectedDateFilter: "custom",
        customStartDate: custom_start,
        customEndDate: custom_end,
      };
    }

    return {
      selectedDateFilter: selected_date_filter
        ? selected_date_filter === "custom"
          ? "custom"
          : Number(selected_date_filter)
        : DEFAULT_DATE_FILTER_VALUE,
      customStartDate: "",
      customEndDate: "",
    };
  }, []);

  const resolveStatusSelectionFromParams = useCallback(
    (queryParams) => {
      // Use API's is_selected to determine initial state
      const selectedOption = filters?.statuses?.find((opt) => opt.is_selected);
      if (selectedOption) {
        return selectedOption.value !== null &&
          selectedOption.value !== undefined
          ? Number(selectedOption.value)
          : DEFAULT_STATUS_FILTER;
      }
      // Fallback to URL param if API doesn't have selection
      const status = queryParams.get("status");
      return status ? Number(status) : DEFAULT_STATUS_FILTER;
    },
    [filters?.statuses]
  );

  // Get initial values from URL params with defaults
  const getInitialDateFilter = () => {
    const queryParams = new URLSearchParams(location.search);
    return resolveDateSelectionFromParams(queryParams).selectedDateFilter;
  };

  const getInitialStatusFilter = () => {
    const queryParams = new URLSearchParams(location.search);
    return resolveStatusSelectionFromParams(queryParams);
  };

  const [selectedDateFilter, setSelectedDateFilter] = useState(
    getInitialDateFilter()
  );
  const [selectedStatusFilter, setSelectedStatusFilter] = useState(
    getInitialStatusFilter()
  );

  const isAllStatusOption = (option) => {
    const label = translateDynamicLabel(option.display, t);
    const normalizedLabel =
      typeof label === "string" ? label.trim().toLowerCase() : "";

    return (
      normalizedLabel === "all" ||
      normalizedLabel === "all status" ||
      normalizedLabel === "all statuses"
    );
  };

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  );

  // Validate custom date range
  const validateCustomDates = useCallback(() => {
    if (selectedDateFilter !== "custom") {
      setDateError("");
      return true;
    }

    // Check if dates are empty or just whitespace
    const startDateTrimmed = customStartDate?.trim() || "";
    const endDateTrimmed = customEndDate?.trim() || "";

    if (!startDateTrimmed || !endDateTrimmed) {
      setDateError("Please select both start and end dates");
      return false;
    }

    const start = dayjs(startDateTrimmed, "MM-DD-YYYY");
    const end = dayjs(endDateTrimmed, "MM-DD-YYYY");
    const today = dayjs();

    if (!start.isValid() || !end.isValid()) {
      setDateError("Please enter valid dates in MM-DD-YYYY format");
      return false;
    }

    if (start.isAfter(end) || start.isSame(end, "day")) {
      setDateError("End date must be higher than start date");
      return false;
    }

    if (end.isAfter(today, "day")) {
      setDateError("End date cannot be in the future");
      return false;
    }

    if (start.isAfter(today, "day")) {
      setDateError("Start date cannot be in the future");
      return false;
    }

    setDateError("");
    return true;
  }, [selectedDateFilter, customStartDate, customEndDate]);

  // Convert ISO string to MM-DD-YYYY format
  const convertISOToMMDDYYYY = (isoString) => {
    if (!isoString) return "";
    // Extract date part from ISO string (YYYY-MM-DD) to avoid timezone issues
    const datePart = isoString.split("T")[0];
    if (!datePart) {
      // Fallback to Date object parsing if format is unexpected
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }
    const parts = datePart.split("-");
    if (parts.length !== 3) return "";
    // Convert from YYYY-MM-DD to MM-DD-YYYY
    const [year, month, day] = parts;
    return `${month}-${day}-${year}`;
  };

  // Format date value for FyDatePicker
  const formatDateValue = (value) => {
    if (!value) return "";
    // If ISO string (from FyDatePicker onChange), convert to MM-DD-YYYY
    if (typeof value === "string" && value.includes("T")) {
      return convertISOToMMDDYYYY(value);
    }
    // If already in MM-DD-YYYY format, return as is
    if (typeof value === "string" && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return value;
    }
    // If Date object, convert to MM-DD-YYYY
    if (value instanceof Date && !isNaN(value.getTime())) {
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      const year = value.getFullYear();
      return `${month}-${day}-${year}`;
    }
    return "";
  };

  // Get minimum date for end date picker - dates before start date are inactive
  // maxInactiveDate makes dates BEFORE it inactive, so this is the minimum selectable date
  const getEndDateMinDate = useMemo(() => {
    if (!customStartDate) return undefined;
    const start = dayjs(customStartDate, "MM-DD-YYYY");
    if (!start.isValid()) return undefined;
    // Return start date + 1 day so start date itself is inactive
    const nextDay = start.add(1, "day");
    return nextDay.format("MM-DD-YYYY");
  }, [customStartDate]);

  // Get maximum date for start date picker - dates after end date are inactive
  // minInactiveDate makes dates AFTER it inactive, so this is the maximum selectable date
  // We need the earlier of today or endDate (if endDate exists)
  const getStartDateMaxInactiveDate = useMemo(() => {
    const today = dayjs();
    const todayStr = today.format("MM-DD-YYYY");

    if (!customEndDate) return todayStr;

    const end = dayjs(customEndDate, "MM-DD-YYYY");
    if (!end.isValid()) return todayStr;

    const endStr = end.format("MM-DD-YYYY");

    // Return the earlier of today or endDate
    if (today.isBefore(endStr, "day") || today.isSame(endStr, "day")) {
      return todayStr;
    }
    return endStr;
  }, [customEndDate]);

  // Validate dates when they change
  useEffect(() => {
    if (selectedDateFilter === "custom") {
      // Only validate if both dates are present and properly formatted
      if (customStartDate && customEndDate) {
        const start = dayjs(customStartDate, "MM-DD-YYYY");
        const end = dayjs(customEndDate, "MM-DD-YYYY");

        // If dates are valid format, run full validation
        if (start.isValid() && end.isValid()) {
          validateCustomDates();
        } else {
          // Clear error if dates are being typed/formatted
          setDateError("");
        }
      } else {
        // Clear error if either date is missing
        setDateError("");
      }
    }
  }, [customStartDate, customEndDate, selectedDateFilter]);

  // Update state when URL changes or modal opens - use API's is_selected
  useEffect(() => {
    if (isOpen) {
      // Reset to filter tab when modal opens
      setActiveTab("filter");

      const dateSelection = resolveDateSelectionFromParams(searchParams);
      setSelectedDateFilter(dateSelection.selectedDateFilter);
      setCustomStartDate(dateSelection.customStartDate);
      setCustomEndDate(dateSelection.customEndDate);
      setSelectedStatusFilter(resolveStatusSelectionFromParams(searchParams));
    }
  }, [
    isOpen,
    resolveDateSelectionFromParams,
    resolveStatusSelectionFromParams,
    searchParams,
  ]);

  // Prepare date filter options with selected state
  const dateFilterOptions = useMemo(() => {
    return DATE_FILTERS.map((option) => ({
      ...option,
      is_selected:
        selectedDateFilter !== null &&
        selectedDateFilter !== undefined &&
        String(option.value) === String(selectedDateFilter),
    }));
  }, [selectedDateFilter]);

  // Prepare status filter options - use API data as-is, update selection based on local state
  const statusFilterOptions = useMemo(() => {
    if (!filters?.statuses || filters.statuses.length === 0) {
      return [];
    }

    // Use status options exactly as they come from API
    // Only update is_selected based on user's current selection in modal
    return filters.statuses.map((option) => {
      // Determine if this option matches the user's current selection
      let is_selected = false;

      if (selectedStatusFilter === null || selectedStatusFilter === undefined) {
        // "All" is selected - match options by value or label
        is_selected =
          isAllStatusOption(option) ||
          option.value === null ||
          option.value === undefined ||
          option.value === "" ||
          Number(option.value) === 0;
      } else {
        // Specific status is selected - match by value
        is_selected =
          option.value !== null &&
          option.value !== undefined &&
          Number(option.value) === selectedStatusFilter;
      }

      return {
        ...option,
        is_selected,
      };
    });
  }, [filters?.statuses, selectedStatusFilter, t]);

  const handleDateFilterChange = (value) => {
    setSelectedDateFilter(value);
    if (value !== "custom") {
      setCustomStartDate("");
      setCustomEndDate("");
      setDateError("");
    }
  };

  const handleStatusFilterChange = (value) => {
    setSelectedStatusFilter(value);
  };

  const handleApply = () => {
    // Validate custom dates if custom is selected
    if (selectedDateFilter === "custom" && !validateCustomDates()) {
      return;
    }

    const queryParams = new URLSearchParams();

    // Set date filter - always pass date range to API
    if (selectedDateFilter === "custom") {
      queryParams.set("selected_date_filter", "custom");
      queryParams.set("custom_start_date", customStartDate);
      queryParams.set("custom_end_date", customEndDate);
    } else if (
      selectedDateFilter !== null &&
      selectedDateFilter !== undefined
    ) {
      queryParams.set("selected_date_filter", selectedDateFilter.toString());
    } else {
      // Default to 90 days if nothing selected
      queryParams.set(
        "selected_date_filter",
        DEFAULT_DATE_FILTER_VALUE.toString()
      );
    }

    // Set status filter only if one is selected
    if (selectedStatusFilter !== null && selectedStatusFilter !== undefined) {
      queryParams.set("status", selectedStatusFilter.toString());
    }

    // Reset pagination to page 1 on filter change
    queryParams.set("page_no", "1");

    // Navigate with updated params
    const queryString = queryParams.toString();
    navigate("/profile/orders" + (queryString ? `?${queryString}` : ""));

    onClose();
  };

  const handleClearAll = () => {
    const queryParams = new URLSearchParams();

    queryParams.set(
      "selected_date_filter",
      DEFAULT_DATE_FILTER_VALUE.toString()
    );
    queryParams.set("page_no", "1");

    setSelectedDateFilter(DEFAULT_DATE_FILTER_VALUE);
    setSelectedStatusFilter(DEFAULT_STATUS_FILTER);
    setCustomStartDate("");
    setCustomEndDate("");
    setDateError("");

    const queryString = queryParams.toString();
    navigate("/profile/orders" + (queryString ? `?${queryString}` : ""));

    onClose();
  };

  const handleClose = () => {
    // Reset to current URL values on close without applying
    const dateSelection = resolveDateSelectionFromParams(searchParams);
    setSelectedDateFilter(dateSelection.selectedDateFilter);
    setCustomStartDate(dateSelection.customStartDate);
    setCustomEndDate(dateSelection.customEndDate);
    setSelectedStatusFilter(resolveStatusSelectionFromParams(searchParams));
    setDateError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} closeDialog={handleClose} modalType={"order-filter"}>
      <div className={styles.filterModal}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div className={styles.tabsWrapper}>
            <button
              className={`${styles.headerTab} ${
                activeTab === "order-status" ? styles.activeHeaderTab : ""
              }`}
              onClick={() => setActiveTab("order-status")}
              type="button"
            >
              {t("resource.order.order_status") || "Order Status"}
            </button>
            <button
              className={`${styles.headerTab} ${
                activeTab === "filter" ? styles.activeHeaderTab : ""
              }`}
              onClick={() => setActiveTab("filter")}
              type="button"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Filter Content */}
        <div className={styles.modalContent}>
          {/* Order Status Tab */}
          {activeTab === "order-status" && (
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>
                {t("resource.order.order_status") || "Order Status"}
              </h3>
              <div className={styles.filterOptions}>
                {statusFilterOptions.map((option, index) => {
                  const label = translateDynamicLabel(option.display, t);
                  const displayLabel =
                    typeof label === "string" &&
                    label.toLowerCase() === "all status"
                      ? "All"
                      : label;

                  return (
                    <div
                      key={index}
                      className={styles.filterOption}
                      onClick={() =>
                        handleStatusFilterChange(
                          option.value !== null ? Number(option.value) : null
                        )
                      }
                    >
                      <RadioIcon checked={option.is_selected} />
                      <span className={styles.filterOptionLabel}>
                        {displayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Tab - Order Date */}
          {activeTab === "filter" && (
            <div className={styles.filterSection}>
              <h3 className={styles.filterSectionTitle}>
                {t("resource.order.order_date") || "Order date"}
              </h3>
              <div className={styles.filterOptions}>
                {dateFilterOptions.map((option, index) => (
                  <div
                    key={index}
                    className={styles.filterOption}
                    onClick={() => handleDateFilterChange(option.value)}
                  >
                    <RadioIcon checked={option.is_selected} />
                    <span className={styles.filterOptionLabel}>
                      {translateDynamicLabel(option.display, t)}
                    </span>
                  </div>
                ))}
              </div>
              {/* Custom Date Range Inputs */}
              {selectedDateFilter === "custom" && (
                <div className={styles.customDateRange}>
                  <div className={styles.dateInputWrapper}>
                    <FyDatePicker
                      preselectedDate={formatDateValue(customStartDate)}
                      onChange={(date) => {
                        const formatted = formatDateValue(date);
                        setCustomStartDate(formatted || "");
                        setDateError("");
                        // Clear end date if it's now invalid
                        if (customEndDate && formatted) {
                          const end = dayjs(customEndDate, "MM-DD-YYYY");
                          const start = dayjs(formatted, "MM-DD-YYYY");
                          if (
                            end.isValid() &&
                            start.isValid() &&
                            (end.isBefore(start, "day") ||
                              end.isSame(start, "day"))
                          ) {
                            setCustomEndDate("");
                          }
                        }
                      }}
                      placeholderText="MM-DD-YYYY"
                      dateFormat="MM-DD-YYYY"
                      inputLabel="Start date"
                      isLabelFloating
                      error={!!dateError}
                      errorMessage={dateError}
                      minInactiveDate={getStartDateMaxInactiveDate}
                      readOnly
                      enableMonthYearSelection
                    />
                  </div>
                  <div className={styles.dateInputWrapper}>
                    <FyDatePicker
                      preselectedDate={formatDateValue(customEndDate)}
                      onChange={(date) => {
                        const formatted = formatDateValue(date);
                        setCustomEndDate(formatted || "");
                        setDateError("");
                      }}
                      placeholderText="MM-DD-YYYY"
                      dateFormat="MM-DD-YYYY"
                      inputLabel="End date"
                      isLabelFloating
                      error={!!dateError}
                      errorMessage={dateError}
                      maxInactiveDate={getEndDateMinDate}
                      minInactiveDate={dayjs().format("MM-DD-YYYY")}
                      readOnly
                      enableMonthYearSelection
                    />
                  </div>
                  {dateError && (
                    <div className={styles.dateError}>{dateError}</div>
                  )}
                  <button
                    className={styles.clearSection}
                    onClick={() => {
                      setCustomStartDate("");
                      setCustomEndDate("");
                      setDateError("");
                      setSelectedDateFilter(DEFAULT_DATE_FILTER_VALUE);
                    }}
                    type="button"
                  >
                    {"Clear section"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer with Apply Button */}
        <div className={styles.modalFooter}>
          <button
            className={styles.clearAllButton}
            onClick={handleClearAll}
            type="button"
          >
            {"Clear all"}
          </button>
          <button
            className={styles.applyButton}
            onClick={handleApply}
            type="button"
            disabled={!!dateError}
          >
            {t("resource.facets.apply") || "Apply"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OrderFilterModal;
