import React, { useRef, useState ,useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { useGlobalStore, useGlobalTranslation ,useNavigate } from "fdk-core/utils";
import styles from "../styles/order-list.less";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";
import OrdersHeader from "@gofynd/theme-template/components/order-header/order-header";
import "@gofynd/theme-template/components/order-header/order-header.css";
import OrderShipment from "@gofynd/theme-template/components/order-shipment/order-shipment";
import "@gofynd/theme-template/components/order-shipment/order-shipment.css";
import Loader from "../components/loader/loader";
import ProfileRoot from "../components/profile/profile-root";
import EmptyState from "../components/empty-state/empty-state";
import { isLoggedIn } from "../helper/auth-guard";
import ReattemptShipmentModal from "@gofynd/theme-template/pages/profile/components/reattempt-shipment-modal/reattempt-shipment-modal";
import "@gofynd/theme-template/pages/profile/components/reattempt-shipment-modal/reattempt-shipment-modal.css";
import {
  DELIVERY_REQUEST_REATTEMPT,
  GET_SHIPMENT_DETAILS,
  UPDATE_SHIPMENT_STATUS,
} from "../queries/shipmentQuery";
import useInternational from "../components/header/useInternational";
import { ORDER_LISTING } from "../queries/ordersQuery";
import { useAddressFormSchema, useSnackbar } from "../helper/hooks";
import { usePolling } from "../helper/hooks/usePolling";
import { detectMobileWidth } from "../helper/utils";import { getGroupedShipmentBags } from "../helper/utils";
import { useThemeConfig } from "../helper/hooks";

function OrdersList({ fpi }) {
  const { globalConfig } = useThemeConfig({ fpi });
  const { t } = useGlobalTranslation("translation");
  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);
  const { showSnackbar } = useSnackbar();
  const { fetchCountrieDetails, currentCountry } = useInternational({ fpi });
  const {
    isLoading: isOrdersLoading,
    orders,
    handelBuyAgain,
  } = useOrdersListing(fpi);
  const [ordersList, setOrdersList] = useState([]);
  const [countryInfo, setCountryInfo] = useState({});
  const [shouldPoll, setShouldPoll] = useState(false);
  const shouldPollRef = useRef(false);
  const [selectedShipmentIdDetails, setSelectedShipmentIdDetails] = useState(
    {}
  );
  const [reattemptStatus, setReattemptStatus] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    shipmentId: "",
  });

  const [isMobile, setIsMobile] = useState(true);
  const navigate = useNavigate();
  const shipmentIdRef = useRef();
  shipmentIdRef.current = selectedShipmentIdDetails?.shipment_id;
  useEffect(() => {
    setIsMobile(detectMobileWidth());
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
      selectedShipmentIdDetails?.ndr_details?.non_editable_address_fields?.map((item) =>
        item === "pincode" ? "area_code" : item
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
        .filter(Boolean); // Remove null entries (i.e., empty groups)
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
    // const addEmailValidation = (schema) => {
    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    //   return schema?.map((group) => ({
    //     ...group,
    //     fields: group.fields.map((field) => {
    //       if (field.key === "email") {
    //         return {
    //           ...field,
    //           validation: {
    //             ...field.validation,
    //             validate: (value) => {
    //               if (!value) return true; // Allow empty values since it's not required
    //               if (!emailRegex.test(value)) {
    //                 return "Please enter a valid email address";
    //               }
    //               return true;
    //             },
    //           },
    //         };
    //       }
    //       return field;
    //     }),
    //   }));
    // };
     const filteredSchema = removeNameAndEmailFields(formSchema);
    const mappedSchema = makeFieldsNonMandatory(filteredSchema);
    const finalSchema = makeSelectedKeysReadOnly(mappedSchema);
    // const finalSchema = addEmailValidation(finalSchema1);


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

  // Fetch shipment details when a shipmentId is selected
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
  
  const fetchOrders = useCallback(async () => {
    try {
      let values = {
        pageNo: 1,
        pageSize: 50,
      };

      const res = await fpi.executeGQL(ORDER_LISTING, values);
      const fetchedOrders = res?.data?.orders || {};
      setOrdersList({ ...fetchedOrders });
    } catch (error) {}
  }, []);

  // Condition function to determine if polling should continue
  const shouldContinuePolling = useCallback(() => {
    // Continue polling if task is not complete
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
  }, [shouldPoll, selectedShipmentIdDetails]);

  const intervals = useMemo(() => [1, 2, 3], []);
  const { isPolling, attempts, startPolling, stopPolling } = usePolling({
    apiFn: fetchOrders,
    intervals,
    conditionFn: shouldContinuePolling,
    maxTries: 3, // Stop after 3 attempts,
  });

  function cleanOptionalEmptyFields(address, schema) {
    const updatedAddress = { ...address };

    schema?.forEach((group) => {
      group?.fields?.forEach((field) => {
        const key = field.key;
        const isRequired = field.required;

        if (!isRequired && updatedAddress.hasOwnProperty(key)) {
          if (updatedAddress[key] === "") {
            updatedAddress[key]= "";
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
        setShouldPoll(() => true);
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
            }, index * 1000); // 300ms delay between messages
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

  // Extract all fields from fields.address
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
          selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window?.end_date
            ? selectedShipmentIdDetails?.ndr_details?.allowed_delivery_window?.end_date
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

  return (
    <ProfileRoot fpi={fpi}>
      {isOrdersLoading ? (
        <Loader />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          className="basePageContainer margin0auto"
        >
          <>
            <OrdersHeader
              filters={ordersList?.filters}
              title={t("resource.order.list.my_orders")}
              subtitle={getOrdersCount()}
              customClassName={styles.header}
              flag={true}
            ></OrdersHeader>
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
                    selectedShipmentIdDetails?.ndr_details
                      ?.allowed_delivery_window?.start_date
                  )
                )}
                minInactiveDate={convertISOToDDMMYYYY(
                  selectedShipmentIdDetails?.ndr_details
                    ?.allowed_delivery_window?.end_date
                )}
                excludeDates={excludeDates}
                defaultPincode={selectedShipmentId?.delivery_address?.pincode}
                mobileAddressObject={mobileAddressObject}
              />
            )}

            {ordersList?.items?.length === 0 ? (
              <div className={`${styles.error}`}>
                <EmptyState
                  title={t("resource.common.empty_state")}
                ></EmptyState>
              </div>
            ) : (
              <div className={`${styles.myOrders}`}>
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
                  ></OrderShipment>
                ))}
              </div>
            )}
          </>
        </motion.div>
      )}
    </ProfileRoot>
  );
}

OrdersList.authGuard = isLoggedIn;
export const sections = JSON.stringify([]);

export default OrdersList;
