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

  // Separate error states for each date picker
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

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
      const selectedOption = filters?.statuses?.find((opt) => opt.is_selected);
      if (selectedOption) {
        return selectedOption.value !== null &&
          selectedOption.value !== undefined
          ? Number(selectedOption.value)
          : DEFAULT_STATUS_FILTER;
      }
      const status = queryParams.get("status");
      return status ? Number(status) : DEFAULT_STATUS_FILTER;
    },
    [filters?.statuses]
  );

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
      typeof label === "string" ? label?.trim()?.toLowerCase() : "";

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

  // Helper to clear all date errors
  const clearDateErrors = useCallback(() => {
    setStartDateError("");
    setEndDateError("");
  }, []);

  // Validate custom date range with separate errors per field
  const validateCustomDates = useCallback(() => {
    if (selectedDateFilter !== "custom") {
      clearDateErrors();
      return true;
    }

    const startDateTrimmed = customStartDate?.trim() || "";
    const endDateTrimmed = customEndDate?.trim() || "";

    // If start has a value but end is empty → error on end only
    if (startDateTrimmed && !endDateTrimmed) {
      setStartDateError("");
      setEndDateError("Please select an end date");
      return false;
    }

    // If end has a value but start is empty → error on start only
    if (!startDateTrimmed && endDateTrimmed) {
      setStartDateError("Please select a start date");
      setEndDateError("");
      return false;
    }

    // Both empty
    if (!startDateTrimmed && !endDateTrimmed) {
      setStartDateError("Please select a start date");
      setEndDateError("Please select an end date");
      return false;
    }

    const start = dayjs(startDateTrimmed, "MM-DD-YYYY");
    const end = dayjs(endDateTrimmed, "MM-DD-YYYY");
    const today = dayjs();

    if (!start.isValid()) {
      setStartDateError("Please enter a valid date in MM-DD-YYYY format");
      setEndDateError("");
      return false;
    }

    if (!end.isValid()) {
      setStartDateError("");
      setEndDateError("Please enter a valid date in MM-DD-YYYY format");
      return false;
    }

    if (start.isAfter(today, "day")) {
      setStartDateError("Start date cannot be in the future");
      setEndDateError("");
      return false;
    }

    if (end.isAfter(today, "day")) {
      setStartDateError("");
      setEndDateError("End date cannot be in the future");
      return false;
    }

    if (start.isAfter(end) || start.isSame(end, "day")) {
      setStartDateError("");
      setEndDateError("End date must be later than start date");
      return false;
    }

    clearDateErrors();
    return true;
  }, [selectedDateFilter, customStartDate, customEndDate, clearDateErrors]);

  // Convert ISO string to MM-DD-YYYY format
  const convertISOToMMDDYYYY = (isoString) => {
    if (!isoString) return "";
    const datePart = isoString.split("T")[0];
    if (!datePart) {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return "";
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }
    const parts = datePart.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${month}-${day}-${year}`;
  };

  // Format date value for FyDatePicker
  const formatDateValue = (value) => {
    if (!value) return "";
    if (typeof value === "string" && value.includes("T")) {
      return convertISOToMMDDYYYY(value);
    }
    if (typeof value === "string" && value.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return value;
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      const year = value.getFullYear();
      return `${month}-${day}-${year}`;
    }
    return "";
  };

  // Get minimum date for end date picker
  const getEndDateMinDate = useMemo(() => {
    if (!customStartDate) return undefined;
    const start = dayjs(customStartDate, "MM-DD-YYYY");
    if (!start.isValid()) return undefined;
    const nextDay = start.add(1, "day");
    return nextDay.format("MM-DD-YYYY");
  }, [customStartDate]);

  // Get maximum date for start date picker
  const getStartDateMaxInactiveDate = useMemo(() => {
    const today = dayjs();
    const todayStr = today.format("MM-DD-YYYY");

    if (!customEndDate) return todayStr;

    const end = dayjs(customEndDate, "MM-DD-YYYY");
    if (!end.isValid()) return todayStr;

    const endStr = end.format("MM-DD-YYYY");

    if (today.isBefore(endStr, "day") || today.isSame(endStr, "day")) {
      return todayStr;
    }
    return endStr;
  }, [customEndDate]);

  // Validate dates when they change — only when both are present
  useEffect(() => {
    if (selectedDateFilter === "custom") {
      if (customStartDate && customEndDate) {
        const start = dayjs(customStartDate, "MM-DD-YYYY");
        const end = dayjs(customEndDate, "MM-DD-YYYY");
        if (start.isValid() && end.isValid()) {
          validateCustomDates();
        } else {
          clearDateErrors();
        }
      } else {
        clearDateErrors();
      }
    }
  }, [customStartDate, customEndDate, selectedDateFilter]);

  // Update state when URL changes or modal opens
  useEffect(() => {
    if (isOpen) {
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

  const dateFilterOptions = useMemo(() => {
    return DATE_FILTERS.map((option) => ({
      ...option,
      is_selected:
        selectedDateFilter !== null &&
        selectedDateFilter !== undefined &&
        String(option.value) === String(selectedDateFilter),
    }));
  }, [selectedDateFilter]);

  const statusFilterOptions = useMemo(() => {
    if (!filters?.statuses || filters.statuses.length === 0) {
      return [];
    }

    return filters.statuses.map((option) => {
      let is_selected = false;

      if (selectedStatusFilter === null || selectedStatusFilter === undefined) {
        is_selected =
          isAllStatusOption(option) ||
          option.value === null ||
          option.value === undefined ||
          option.value === "" ||
          Number(option.value) === 0;
      } else {
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
      clearDateErrors();
    }
  };

  const handleStatusFilterChange = (value) => {
    setSelectedStatusFilter(value);
  };

  const handleApply = () => {
    if (selectedDateFilter === "custom" && !validateCustomDates()) {
      return;
    }

    const queryParams = new URLSearchParams();

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
      queryParams.set(
        "selected_date_filter",
        DEFAULT_DATE_FILTER_VALUE.toString()
      );
    }

    if (selectedStatusFilter !== null && selectedStatusFilter !== undefined) {
      queryParams.set("status", selectedStatusFilter.toString());
    }

    queryParams.set("page_no", "1");

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
    clearDateErrors();

    const queryString = queryParams.toString();
    navigate("/profile/orders" + (queryString ? `?${queryString}` : ""));

    onClose();
  };

  const handleClose = () => {
    const dateSelection = resolveDateSelectionFromParams(searchParams);
    setSelectedDateFilter(dateSelection.selectedDateFilter);
    setCustomStartDate(dateSelection.customStartDate);
    setCustomEndDate(dateSelection.customEndDate);
    setSelectedStatusFilter(resolveStatusSelectionFromParams(searchParams));
    clearDateErrors();
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
                  {/* Start Date Picker */}
                  <div className={styles.dateInputWrapper}>
                    <FyDatePicker
                      preselectedDate={formatDateValue(customStartDate)}
                      onChange={(date) => {
                        const formatted = formatDateValue(date);
                        setCustomStartDate(formatted || "");
                        // Clear only the start date error when user picks a date
                        setStartDateError("");
                        // Clear end date if it becomes invalid relative to new start
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
                            setEndDateError("");
                          }
                        }
                      }}
                      placeholderText="MM-DD-YYYY"
                      dateFormat="MM-DD-YYYY"
                      inputLabel="Start date"
                      isLabelFloating
                      error={!!startDateError}
                      errorMessage={startDateError}
                      minInactiveDate={getStartDateMaxInactiveDate}
                      readOnly
                      enableMonthYearSelection
                    />
                  </div>

                  {/* End Date Picker — error shown only if start date has a value */}
                  <div className={styles.dateInputWrapper}>
                    <FyDatePicker
                      preselectedDate={formatDateValue(customEndDate)}
                      onChange={(date) => {
                        const formatted = formatDateValue(date);
                        setCustomEndDate(formatted || "");
                        // Clear only the end date error when user picks a date
                        setEndDateError("");
                      }}
                      placeholderText="MM-DD-YYYY"
                      dateFormat="MM-DD-YYYY"
                      inputLabel="End date"
                      isLabelFloating
                      error={!!customStartDate && !!endDateError}
                      errorMessage={customStartDate ? endDateError : ""}
                      maxInactiveDate={getEndDateMinDate}
                      minInactiveDate={dayjs().format("MM-DD-YYYY")}
                      readOnly
                      enableMonthYearSelection
                    />
                  </div>

                  <button
                    className={styles.clearSection}
                    onClick={() => {
                      setCustomStartDate("");
                      setCustomEndDate("");
                      clearDateErrors();
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
            disabled={!!startDateError || !!endDateError}
          >
            {t("resource.facets.apply") || "Apply"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default OrderFilterModal;
