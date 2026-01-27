import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useLocation } from "react-router-dom";
import { useGlobalStore, useFPI, useNavigate } from "fdk-core/utils";
import { useGlobalTranslation } from "fdk-core/utils";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";
import OrdersHeader from "../components/orders/order-header";
import OrderShipment from "../components/orders/order-shipment";
import Loader from "../components/loader/loader";
import EmptyState from "../components/empty-state/empty-state";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import Pagination from "../components/orders/pagination";
import ReattemptShipmentModal from "@gofynd/theme-template/pages/profile/components/reattempt-shipment-modal/reattempt-shipment-modal";
import "@gofynd/theme-template/pages/profile/components/reattempt-shipment-modal/reattempt-shipment-modal.css";
import {
  DELIVERY_REQUEST_REATTEMPT,
  GET_SHIPMENT_DETAILS,
} from "../queries/shipmentQuery";
import useInternational from "../components/header/useInternational";
import { ORDER_LISTING } from "../queries/ordersQuery";
import { useAddressFormSchema, useSnackbar } from "../helper/hooks";
import { usePolling } from "../helper/hooks/usePolling";
import { detectMobileWidth, getGroupedShipmentBags } from "../helper/utils";
import styles from "../styles/canvas-profile.less";

export function Component({ props, blocks, preset, globalConfig }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);
  const { showSnackbar } = useSnackbar();
  const { fetchCountrieDetails, currentCountry } = useInternational({ fpi });
  const {
    isLoading: isOrdersLoading,
    orders,
    handelBuyAgain,
  } = useOrdersListing(fpi);

  const [ordersList, setOrdersList] = useState({});
  const [countryInfo, setCountryInfo] = useState({});
  const shouldPollRef = useRef(false);
  const [selectedShipmentIdDetails, setSelectedShipmentIdDetails] = useState(
    {}
  );
  const [reattemptStatus, setReattemptStatus] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    shipmentId: "",
  });

  const [isMobile, setIsMobile] = useState(() => detectMobileWidth() ?? false);
  const navigate = useNavigate();
  const location = useLocation();
  const shipmentIdRef = useRef();
  shipmentIdRef.current = selectedShipmentIdDetails?.shipment_id;

  // Destructure props with defaults
  const { title = "My Orders", show_empty_state = true } = Object.fromEntries(
    Object.entries(props || {}).map(([key, obj]) => [key, obj?.value])
  );

  useEffect(() => {
    const detectedMobile = detectMobileWidth();
    setIsMobile(detectedMobile);
  }, []);

  useEffect(() => {
    setOrdersList((prevOrders) => ({ ...orders }));
  }, [orders]);

  useEffect(() => {
    const countryCode =
      selectedShipmentIdDetails?.delivery_address?.country_iso_code;
    if (!countryCode) return;

    const handleCountryChange = async () => {
      try {
        const response = await fetchCountrieDetails({
          countryIsoCode: countryCode,
        });

        if (response?.data?.country) {
          const countryInfo = response.data.country;
          setCountryInfo(countryInfo);
        }
      } catch (error) {}
    };

    handleCountryChange();
  }, [selectedShipmentIdDetails?.delivery_address?.country_iso_code]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode: countryInfo?.phone_code,
    countryIso: countryInfo?.iso2 || countryInfo?.iso3,
    addressTemplate: countryInfo?.fields?.address_template?.checkout_form,
    addressFields: countryInfo?.fields?.address,
    addressItem: selectedShipmentIdDetails?.delivery_address,
  });

  const mobileAddressObject = countryInfo?.fields?.address?.find(
    (item) => item?.slug === "phone"
  );

  function modifyFormSchema(formSchema) {
    const nonEditableAddressFields =
      selectedShipmentIdDetails?.ndr_details?.non_editable_address_fields?.map(
        (item) => (item === "pincode" ? "area_code" : item)
      );

    const requiredFieldsFromCountry = countryInfo?.fields?.address
      ?.filter((field) => field.required === true)
      ?.map((field) => field.slug)
      ?.map((item) => (item === "pincode" ? "area_code" : item));
    const removeNameAndEmailFields = (schema) => {
      return schema
        ?.map((group) => {
          const filteredFields = group?.fields?.filter(
            (field) => field.key !== "name"
          );
          return filteredFields.length > 0
            ? { ...group, fields: filteredFields }
            : null;
        })
        .filter(Boolean);
    };
    const makeFieldsNonMandatory = (schema) => {
      return schema?.map((group) => ({
        ...group,
        fields: group.fields.map((field) => {
          if (nonEditableAddressFields?.includes(field.key)) {
            return {
              ...field,
              required: false,
            };
          }

          if (requiredFieldsFromCountry?.includes(field.key)) {
            return { ...field, required: true };
          }

          return {
            ...field,
            ...(field.key === "phone" ? { showAsOptional: false } : {}),
          };
        }),
      }));
    };
    const makeSelectedKeysReadOnly = (schema) => {
      return schema?.map((group) => ({
        ...group,
        fields: group.fields.map((field) => {
          if (nonEditableAddressFields?.includes(field.key)) {
            return { ...field, readOnly: true, disabled: true };
          }
          return field;
        }),
      }));
    };
    const filteredSchema = removeNameAndEmailFields(formSchema);
    const mappedSchema = makeFieldsNonMandatory(filteredSchema);
    const finalSchema = makeSelectedKeysReadOnly(mappedSchema);

    return finalSchema;
  }

  const modifiedAddressSchema = modifyFormSchema(formSchema);

  async function getShipmenDetails(selectedShipmentId) {
    try {
      const res = await fpi.executeGQL(GET_SHIPMENT_DETAILS, {
        shipmentId: selectedShipmentId,
      });
      const details = res?.data?.shipment?.detail;
      setSelectedShipmentIdDetails(details);
    } catch (error) {}
  }

  useEffect(() => {
    if (modalState?.shipmentId) {
      getShipmenDetails(modalState.shipmentId);
      setSelectedShipmentId(modalState.shipmentId);
    }
  }, [modalState?.shipmentId]);

  const [selectedShipmentId, setSelectedShipmentId] = useState(null);

  const getOrdersCount = () => {
    const itemTotal = ordersList?.page?.item_total;

    if (itemTotal) {
      return `(${itemTotal} ${
        itemTotal === 1
          ? t("resource.order.list.orders_count_singular_suffix")
          : t("resource.order.list.orders_count_suffix")
      })`;
    } else {
      return "";
    }
  };

  const handleModalChange = ({ isOpen, shipmentId = null }) => {
    setModalState({ isOpen, shipmentId });
  };

  // Store current location.search in a ref to use in fetchOrders
  // This prevents fetchOrders from being recreated on every location.search change
  const locationSearchRef = useRef(location.search);
  useEffect(() => {
    locationSearchRef.current = location.search;
  }, [location.search]);

  const fetchOrders = useCallback(async () => {
    // Only update ordersList if polling is active
    // This prevents fetchOrders from interfering with useOrdersListing on page navigation
    if (!shouldPollRef.current) {
      return;
    }

    try {
      const queryParams = new URLSearchParams(locationSearchRef.current);
      const DEFAULT_DATE_FILTER = 90;
      const DEFAULT_PAGE_SIZE = 20;

      // Get page number from URL or default to 1
      const pageNo = queryParams.get("page_no")
        ? Number(queryParams.get("page_no"))
        : 1;

      let values = {
        pageNo,
        pageSize: DEFAULT_PAGE_SIZE || 20, // Ensure pageSize is always 20
      };

      // Safeguard: Ensure pageSize is never undefined or invalid
      if (!values.pageSize || values.pageSize !== 20) {
        values.pageSize = 20;
      }

      // Apply date filter - always pass date range to API
      const selected_date_filter = queryParams.get("selected_date_filter");
      const custom_start = queryParams.get("custom_start_date");
      const custom_end = queryParams.get("custom_end_date");

      if (selected_date_filter === "custom" && custom_start && custom_end) {
        // Use custom date range
        values.fromDate = custom_start;
        const endDate = new Date(custom_end);
        endDate.setDate(endDate.getDate() + 1);
        values.toDate = `${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}-${endDate.getFullYear()}`;
      } else {
        // Use preset date filter or default
        const dateFilterValue = selected_date_filter
          ? Number(selected_date_filter)
          : DEFAULT_DATE_FILTER;

        let fromDate, toDate;

        // Handle "Today" (0 days) - start from today 00:00:00, end at end of today
        if (dateFilterValue === 0) {
          fromDate = new Date();
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date();
          toDate.setHours(23, 59, 59, 999);
          toDate.setDate(toDate.getDate() + 1); // Add 1 day for end date
        } else {
          fromDate = new Date();
          fromDate.setDate(fromDate.getDate() - dateFilterValue);
          toDate = new Date();
          toDate.setDate(toDate.getDate() + 1);
        }

        values.fromDate = `${String(fromDate.getMonth() + 1).padStart(2, "0")}-${String(fromDate.getDate()).padStart(2, "0")}-${fromDate.getFullYear()}`;
        values.toDate = `${String(toDate.getMonth() + 1).padStart(2, "0")}-${String(toDate.getDate()).padStart(2, "0")}-${toDate.getFullYear()}`;
      }

      // Apply status filter if present
      const status = queryParams.get("status");
      if (status) {
        values.status = Number(status);
      }

      const res = await fpi.executeGQL(ORDER_LISTING, values);
      const fetchedOrders = res?.data?.orders || {};
      // Only update ordersList if polling is still active
      if (shouldPollRef.current) {
        setOrdersList({ ...fetchedOrders });
      }
    } catch (error) {}
  }, [fpi]);

  const shouldContinuePolling = useCallback(() => {
    if (shouldPollRef.current) {
      const targetedOrder = ordersList?.items?.find(
        (order) => order.order_id === selectedShipmentIdDetails?.order_id
      );
      const targetedShipment = targetedOrder?.shipments?.find(
        (shipment) =>
          shipment?.shipment_id === selectedShipmentIdDetails?.shipment_id
      );

      if (
        targetedShipment?.shipment_status?.value !==
        "delivery_attempt_requested"
      ) {
        shouldPollRef.current = false;
      }
      return (
        targetedShipment?.shipment_status?.value !==
        "delivery_attempt_requested"
      );
    } else {
      return false;
    }
  }, [selectedShipmentIdDetails]);

  const intervals = useMemo(() => [1, 2, 3], []);
  const { isPolling, attempts, startPolling, stopPolling } = usePolling({
    apiFn: fetchOrders,
    intervals,
    conditionFn: shouldContinuePolling,
    maxTries: 3,
  });

  function cleanOptionalEmptyFields(address, schema) {
    const updatedAddress = { ...address };

    schema?.forEach((group) => {
      group?.fields?.forEach((field) => {
        const key = field.key;
        const isRequired = field.required;

        if (!isRequired && updatedAddress.hasOwnProperty(key)) {
          if (updatedAddress[key] === "") {
            updatedAddress[key] = "";
          }
        }
      });
    });

    return updatedAddress;
  }

  const handleReattemptSubmit = async (formData) => {
    const createdPayload = createPayload(formData);
    try {
      const res = await fpi.executeGQL(
        DELIVERY_REQUEST_REATTEMPT,
        createdPayload
      );
      const successMessage = res?.data?.submitDeliveryReattemptRequest?.message;
      if (successMessage) {
        showSnackbar(successMessage, "success");
        shouldPollRef.current = true;
        startPolling();
        if (isMobile) {
          navigate?.(`/profile/orders/shipment/${shipmentIdRef?.current}`);
        }
        handleModalChange({ isOpen: false });
      } else if (res?.errors?.length) {
        const detailedErrors = res.errors[0]?.details?.errors;

        if (Array.isArray(detailedErrors)) {
          detailedErrors.forEach((err, index) => {
            const msg = err?.message || "Something went wrong";
            setTimeout(() => {
              showSnackbar(msg, "error");
            }, index * 1000);
          });
        } else {
          const fallbackMsg = res.errors[0]?.message || "Something went wrong";
          showSnackbar(fallbackMsg, "error");
        }
      }
    } catch (error) {
      showSnackbar(
        t("resource.common.delivery_attempt_failed") || "Submission failed",
        "error"
      );
    }
  };

  const extractAddressFields = (countryData) => {
    if (!countryData?.fields?.address) {
      return [];
    }
    return countryData.fields.address;
  };

  const createPayload = (formData) => {
    const {
      scheduleDate,
      area_code,
      additionalComments,
      phone: { mobile },
      ...restData
    } = formData;

    const deliveryAddress = {
      ...restData,
      phone: mobile,
    };
    const modifiedDeliveryAddress = cleanOptionalEmptyFields(
      deliveryAddress,
      formSchema
    );

    const addressFields = extractAddressFields(countryInfo);
    const fieldSlugs = addressFields.map((field) => field.slug);
    const finalDeliveryAddress = fieldSlugs?.reduce((acc, field) => {
      if (field in modifiedDeliveryAddress) {
        acc[field] = modifiedDeliveryAddress[field];
      }
      return acc;
    }, {});

    return {
      shipmentId: selectedShipmentIdDetails?.shipment_id,
      deliveryReattemptRequestInput: {
        delivery_address: finalDeliveryAddress,
        delivery_reschedule_date:
          scheduleDate >
          selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window
            ?.end_date
            ? selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window
                ?.end_date
            : scheduleDate,
        remark: additionalComments,
      },
    };
  };

  function convertISOToDDMMYYYY(isoString) {
    if (!isoString) return "";

    const date = new Date(isoString);
    if (isNaN(date)) return "";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  const getMaxInactiveDate = (receivedUTCFromShipment) => {
    if (!receivedUTCFromShipment) return "";

    const shipmentDateUTC = new Date(receivedUTCFromShipment);
    const currentDateUTC = new Date();

    if (isNaN(shipmentDateUTC.getTime())) return currentDateUTC.toISOString();

    const maxDate =
      shipmentDateUTC > currentDateUTC ? shipmentDateUTC : currentDateUTC;

    return maxDate.toISOString();
  };

  const excludeDates =
    selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window?.excluded_dates?.map(
      (item) => convertISOToDDMMYYYY(item)
    );

  const statusFilter = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("status");
  }, [location.search]);

  const isReturnsView = statusFilter === "4";
  const ordersHeaderTitle = isReturnsView
    ? t("resource.order.list.my_returns")
    : t("resource.order.list.my_orders");
  const sectionTitle = isReturnsView
    ? ordersHeaderTitle
    : title || ordersHeaderTitle;

  const breadcrumbItems = useMemo(
    () => [
      { label: t("resource.common.breadcrumb.home"), link: "/" },
      { label: t("resource.profile.profile"), link: "/profile/details" },
      { label: ordersHeaderTitle },
    ],
    [t, ordersHeaderTitle]
  );

  return (
    <div className={styles.canvasSection}>
      <Breadcrumb breadcrumb={breadcrumbItems} />
      <OrdersHeader
        filters={ordersList?.filters}
        title={ordersHeaderTitle}
        subtitle={getOrdersCount()}
        flag={false}
      />

      {modalState.isOpen && (
        <ReattemptShipmentModal
          handleModalChange={handleModalChange}
          isOpen={modalState.isOpen}
          shipmentId={modalState.shipmentId}
          shipmentDetails={selectedShipmentIdDetails}
          onSubmit={handleReattemptSubmit}
          addressFormSchema={modifiedAddressSchema}
          addressItem={selectedShipmentIdDetails?.delivery_address}
          maxInactiveDate={convertISOToDDMMYYYY(
            getMaxInactiveDate(
              selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window
                ?.start_date
            )
          )}
          minInactiveDate={convertISOToDDMMYYYY(
            selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window
              ?.end_date
          )}
          excludeDates={excludeDates}
          defaultPincode={selectedShipmentId?.delivery_address?.pincode}
          mobileAddressObject={mobileAddressObject}
        />
      )}

      <div className={styles.ordersBody}>
        {isOrdersLoading && (
          <div className={styles.ordersLoader}>
            <Loader />
          </div>
        )}

        {!isOrdersLoading &&
          (ordersList?.items?.length === 0 ? (
            show_empty_state ? (
              <div className={styles.emptyState}>
                <EmptyState title={t("resource.common.empty_state")} />
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No orders found</p>
              </div>
            )
          ) : (
            <>
              <div className={styles.ordersList}>
                {ordersList?.items?.map((item, index) => (
                  <OrderShipment
                    key={index}
                    orderInfo={item}
                    getGroupedShipmentBags={getGroupedShipmentBags}
                    globalConfig={globalConfig}
                    onBuyAgainClick={handelBuyAgain}
                    isBuyAgainEligible={true}
                    availableFOCount={fulfillment_option?.count || 1}
                    handleModalChange={handleModalChange}
                  />
                ))}
              </div>
              <Pagination
                current={ordersList?.page?.current || 1}
                hasPrevious={(ordersList?.page?.current || 1) > 1}
                hasNext={ordersList?.page?.has_next || false}
                totalPages={Math.ceil(
                  (ordersList?.page?.item_total || 0) /
                    (ordersList?.page?.size || 20)
                )}
              />
            </>
          ))}
      </div>
    </div>
  );
}

export const settings = {
  label: "Profile Orders",
  props: [
    {
      type: "text",
      id: "title",
      label: "Section Title",
      default: "My Orders",
    },
    {
      type: "checkbox",
      id: "show_empty_state",
      label: "Show Empty State",
      default: true,
    },
  ],
};

export default Component;
