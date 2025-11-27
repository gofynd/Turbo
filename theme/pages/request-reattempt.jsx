import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
/* useNavigte is imported from react-router-dom because ,functionality to go to previous page was not there in useNavigate hook of fdk-core/utils */
import { useNavigate } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import styles from "../styles/request-reattempt.less";
import MessageCard from "../components/message-card/MessageCard";
import FileCopyIcon from "../assets/images/file-copy.svg";
import FyDatePicker from "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker";
import "@gofynd/theme-template/components/date-picker/fy-date-picker/fy-date-picker.css";
import PersonOutLineIcon from "../assets/images/person-outline.svg";
import PhoneIcon from "../assets/images/phone.svg";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import FyndLogo from "../assets/images/horizontal-logo-black.png";
import VerifyOtp from "../components/verify-otp/VerifyOtp";
import CheckGreenIcon from "../assets/images/check-green-64px.svg";
import CloseIcon from "../assets/images/close.svg";
import EmailIcon from "../assets/images/light-email.svg";
import FyInput from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import { Controller, useForm } from "react-hook-form";
import { useAddressFormSchema, useSnackbar } from "../helper/hooks";
import { AddressFormInputs } from "@gofynd/theme-template/components/address-form/address-form";
import useInternational from "../components/header/useInternational";
import { DELIVERY_REQUEST_REATTEMPT } from "../queries/shipmentQuery";
import {
  SEND_OTP_FOR_REATTEMPT_SHIPMENT,
  VERIFY_OTP_FOR_REATTEMPT_SHIPMENT,
} from "../queries/reattemptQuery.js";
import { convertUTCDateToLocalDate, detectMobileWidth } from "../helper/utils";
import EmptyState from "../components/empty-state/empty-state";
import Loader from "../components/loader/loader";

const DeliveryAddressCard = ({ addresItem, shipmentDetails }) => {
  const formatAddressForDisplay = (address) => {
    if (!address) return null;

    return address
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line)
      .map((line, idx) => <div key={idx}>{line}</div>);
  };

  const { delivery_address } = shipmentDetails || {};

  return (
    <div className={styles.deliveryAddressCard}>
      <div className={styles.userCont}>
        <div className={styles.deliveryAddressTitleCont}>Delivery Address</div>
        <div className={styles.consumerCont}>
          <div className={styles.consumerIcon}>
            <PersonOutLineIcon />
          </div>
          <div className={styles.consumerName}>{addresItem?.name}</div>
        </div>
        <div className={styles.addressCont}>
          <div className={styles.consumerAddress}>
            {formatAddressForDisplay(delivery_address?.display_address)}
          </div>
        </div>
      </div>
      <div className={styles.contactCont}>
        <div className={styles.contactPhoneTitle}>Contact Phone</div>
        <div className={styles.contactnumberCont}>
          <div className={styles.phoneIcon}>
            <PhoneIcon />
          </div>
          <div className={styles.contactNumber}>
            {addresItem?.phoneCode}
            {addresItem?.phone}
          </div>
        </div>
      </div>
      {addresItem?.email && (
        <div className={styles.emailCont}>
          <div className={styles.contactEmailTitle}>Email ID</div>
          <div className={styles.contactEmailCont}>
            <div className={styles.emailIcon}>
              <EmailIcon />
            </div>
            <div className={styles.contactEmail}>{addresItem?.email}</div>
          </div>
        </div>
      )}
      {shipmentDetails?.shipment_status?.value ===
        "delivery_reattempt_requested" &&
        shipmentDetails?.ndr_details?.customer_remarks && (
          <div className={styles.additionalCommCont}>
            <div className={styles.additioanlCommTitle}>
              Additional Comments
            </div>
            <div className={styles.additionalCommTextCont}>
              {shipmentDetails?.ndr_details?.customer_remarks}
            </div>
          </div>
        )}
    </div>
  );
};

const Item = ({ quantity, item }) => {
  return (
    <div className={styles.itemContainer}>
      <div className={styles.imageCont}>
        <img src={item?.image?.[0]} alt={item.name} />
      </div>
      <div className={styles.itemInfoContainer}>
        <div className={styles.itemTitle}>{item.name}</div>
        <div className={styles.itemQuantity}>Qty: {quantity}</div>
      </div>
    </div>
  );
};

const RequestReattempt = ({ fpi }) => {
  const navigate = useNavigate();
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const { t } = useGlobalTranslation("translation");
  const page = useGlobalStore(fpi.getters.PAGE) || {};
  const THEME = useGlobalStore(fpi.getters.THEME);
  const isUserLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { fetchCountrieDetails, currentCountry } = useInternational({
    fpi,
  });
  const mode = THEME?.config?.list.find(
    (f) => f.name === THEME?.config?.current
  );
  const globalConfig = mode?.global_config?.custom?.props;
  const { sections = [] } = page || {};
  const {
    isLoading: isShipmentLoading,
    shipmentDetails,
    reasonsList,
    getBagReasons,
    updateShipment,
    refetchShipmentDetails,
  } = useShipmentDetails(fpi);
  const successRescheduleDate = useRef("");
  const [countryInfo, setCountryInfo] = useState({});
  const [editState, setEditState] = useState(false);
  const [showItemsList, setShowItemList] = useState(false);
  const [reattemptDone, setReattemptDone] = useState(false);
  const [showOTPpopup, setShowOTPpopup] = useState(false);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const sendOtpResponse = useRef(null);
  const [addressItem, setAddressItem] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [otpResponseError, setOtpResponseError] = useState("");
  const coolDownSecondsRef = useRef(55);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const { showSnackbar } = useSnackbar();

  const scheduleDate = "";
  const additionalComments = "";
  const deliveryAddress = shipmentDetails?.delivery_address || {};
  const defaultPincode = deliveryAddress?.pincode;

  const inputsAddresItem = useMemo(() => {
    return {
      ...deliveryAddress,
      phone: {
        countryCode: deliveryAddress?.country_phone_code?.replace("+", ""),
        mobile: deliveryAddress?.phone,
        isValidNumber: true,
      },
      area_code:
        deliveryAddress?.area_code ||
        deliveryAddress?.pincode ||
        defaultPincode ||
        "",
    };
  }, [deliveryAddress]);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      scheduleDate,
      additionalComments,
      ...inputsAddresItem,
    },
  });

  const formMethods = { setValue, getValues, setError, trigger, reset };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(detectMobileWidth());
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (shipmentDetails?.delivery_address) {
      const prevValues = getValues();

      const updatedValues = {
        scheduleDate: prevValues.scheduleDate,
        additionalComments: prevValues.additionalComments,
        ...inputsAddresItem,
      };

      formMethods.reset(updatedValues);
    }
  }, [
    shipmentDetails?.delivery_address?.display_address,
    reset,
    inputsAddresItem,
  ]);

  useEffect(() => {
    setUserLoggedIn(isUserLoggedIn);
    if (isUserLoggedIn) {
      setEditState(true);
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    const countryCode = shipmentDetails?.delivery_address?.country_iso_code;
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

    setAddressItem(shipmentDetails?.delivery_address);
  }, [shipmentDetails?.delivery_address?.country_iso_code]);

  const { formSchema, defaultAddressItem } = useAddressFormSchema({
    fpi,
    countryCode: countryInfo?.phone_code,
    countryIso: countryInfo?.iso2 || countryInfo?.iso3,
    addressTemplate: countryInfo?.fields?.address_template?.checkout_form,
    addressFields: countryInfo?.fields?.address,
    addressItem: shipmentDetails?.delivery_address,
  });

  function modifyFormSchema(formSchema) {
    const nonEditableAddressFields =
      shipmentDetails?.ndr_details?.non_editable_address_fields?.map((item) =>
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
  const handleResend = async () => {
    setIsResendDisabled(true);

    if (!userLoggedIn) {
      await sentOtpForReattemptShipment({
        shipmentId: shipmentDetails?.shipment_id,
        orderId: shipmentDetails?.order_id,
        eventType: "customer_ndr",
      });
    } else {
      setEditState(true);
    }
  };

  const handleResendDisable = () => {
    setIsResendDisabled(false);
    setOtpResponseError("");
  };

  const handleEditButtonClick = async () => {
    setShowOTPpopup(true);
    if (!userLoggedIn) {
      await sentOtpForReattemptShipment({
        shipmentId: shipmentDetails?.shipment_id,
        orderId: shipmentDetails?.order_id,
        eventType: "customer_ndr",
      });
    } else {
      setEditState(true);
    }
  };

  const sentOtpForReattemptShipment = async (payload) => {
    try {
      const res = await fpi.executeGQL(
        SEND_OTP_FOR_REATTEMPT_SHIPMENT,
        payload
      );
      sendOtpResponse.current = await res?.data?.sendShipmentOtpToCustomer;
      coolDownSecondsRef.current = sendOtpResponse.current?.resend_timer;
    } catch (error) {}
  };

  const handleOTPsubmit = async (otpCode) => {
    const payload = {
      orderId: shipmentDetails?.order_id,
      shipmentId: shipmentDetails?.shipment_id,
      verifyOtpInput: {
        otp_code: otpCode,
        request_id: sendOtpResponse?.current?.request_id,
      },
    };
    try {
      const res = await fpi.executeGQL(
        VERIFY_OTP_FOR_REATTEMPT_SHIPMENT,
        payload
      );
      if (
        res?.errors?.length ||
        !res?.data?.verifyOtpForRefundBankDetails?.success
      ) {
        const errorMessage = "Entered OTP is invalid. Please retry.";
        setOtpResponseError(errorMessage);

        return;
      }

      setEditState(true);
      setShowOTPpopup(false);
      if (res?.data?.verifyOtpForRefundBankDetails?.success) {
        setUserLoggedIn(true);
        await refetchShipmentDetails();
      }
    } catch (error) {
      showSnackbar("Something went wrong while verifying OTP", "error");
    }
  };

  const handleCopy = () => {
    if (shipmentDetails?.shipment_id) {
      navigator.clipboard
        .writeText(shipmentDetails.shipment_id)
        .then(() => {
          showSnackbar("Shipment ID copied", "success");
        })
        .catch(() => {
          showSnackbar("Failed to copy Shipment ID", "error");
        });
    }
  };

  const removeErrorMessage = () => {
    setOtpResponseError("");
  };

  const handleFormChange = useCallback((formData) => {}, []);

  const handleAddAddress = (addressData) => {};

  const handleUpdateAddress = (addressData) => {};

  const handleDateChange = (utcDateString) => {
    const selectedDate =
      utcDateString >
      shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date
        ? shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date
        : utcDateString;
  };

  const handleReattemptSubmit = async (formData) => {
    const createdPayload = createPayload(formData);
    try {
      const res = await fpi.executeGQL(
        DELIVERY_REQUEST_REATTEMPT,
        createdPayload
      );
      const successMessage = res?.data?.submitDeliveryReattemptRequest?.message;
      if (successMessage) {
        setReattemptDone(true);
      } else if (res?.errors?.length) {
        const detailedErrors = res.errors[0]?.details?.errors;

        if (Array.isArray(detailedErrors)) {
          detailedErrors.forEach((err, index) => {
            const msg = err?.message || t("resource.common.error_message");
            setTimeout(() => {
              showSnackbar(msg, "error");
            }, index * 1000);
          });
        } else {
          const fallbackMsg =
            res.errors[0]?.message || t("resource.common.error_message");
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

  const createPayload = (formData) => {
    const {
      scheduleDate,
      area_code,
      additionalComments,
      phone: { mobile },
      ...restData
    } = formData;

    successRescheduleDate.current = scheduleDate;
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
      shipmentId: shipmentDetails?.shipment_id,
      deliveryReattemptRequestInput: {
        delivery_address: !userLoggedIn ? {} : finalDeliveryAddress,
        delivery_reschedule_date:
          scheduleDate >
          shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date
            ? shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date
            : scheduleDate,
        remark: additionalComments,
      },
    };
  };

 function convertISOToDDMMYYYY(utcString) {
    if (!utcString) return "";
    // Extract only the date part before 'T'
    const [datePart] = utcString.split("T");
    if (!datePart) return "";
    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) return "";
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
    shipmentDetails?.ndr_details?.allowed_delivery_window?.excluded_dates?.map(
      (item) => convertISOToDDMMYYYY(item)
    );

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

  const convertDDMMYYYYToReadableDate = (dateStr) =>
    new Date(dateStr.split("-").reverse().join("-")).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

  const ndrWindowExhausted = () => {
    const endDateStr =
      shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date;
    if (!endDateStr) return false;

    const endDate = new Date(endDateStr);
    const now = new Date();

    return endDate < now;
  };

  const reattemptEndDate = shipmentDetails?.ndr_details?.allowed_delivery_window
    ?.end_date
    ? convertUTCDateToLocalDate(
        shipmentDetails?.ndr_details?.allowed_delivery_window?.end_date
      )
    : "";

  const handleCancelClick = () => {
    if (userLoggedIn) {
      window.history.length > 2
        ? navigate?.(-1)
        : navigate?.(
            `/profile/orders/shipment/${shipmentDetails?.shipment_id}`
          );
    } else {
      navigate?.("/");
    }
  };

  const ViewItems = () => {
    return (
      <div className={styles.itemsListOverlay}>
        <div className={styles.itemsListContainer}>
          <div className={styles.itemsListTitleCont}>
            <div
              className={styles.itemsListTitle}
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "@OldColorPaletteTextColorPrimary",
              }}
            >
              Items List
            </div>
            <div
              className={styles.closeIcon}
              onClick={() => setShowItemList(false)}
            >
              <CloseIcon />
            </div>
          </div>
          <div className={styles.itemsLists}>
            <div className={styles.scrollableContent}>
              {shipmentDetails?.bags?.map(({ quantity, item, id }) => {
                return <Item quantity={quantity} item={item} key={id} />;
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ShipmentIdAndViewItems = ({ customStyle = {} }) => {
    return (
      <div className={`${styles.shipementIdContainer}`} style={customStyle}>
        <div className={styles.shipmentIdSecContainer}>
          <div className={styles.upperContainer}>
            <span>Shipment ID: {shipmentDetails?.shipment_id}</span>
            <span>
              <FileCopyIcon
                style={{ cursor: "pointer" }}
                title="Copy Shipment ID"
                onClick={handleCopy}
              />
            </span>
          </div>
          <div className={styles.lowerContainer}>
            <div className={styles.totalItems}>
              <span>Total Items:</span>{" "}
              <span>
                {shipmentDetails?.bags?.length} (
                {shipmentDetails?.bags?.reduce((acc, currBag) => {
                  return acc + currBag?.quantity;
                }, 0)}{" "}
                Quantity)
              </span>
            </div>
            <button
              className={styles.viewItems}
              onClick={() => setShowItemList((prevState) => !prevState)}
            >
              VIEW ITEMS
            </button>
          </div>
        </div>
      </div>
    );
  };

  const getSecondaryMessage = () => {
    if (ndrWindowExhausted() && reattemptEndDate) {
      return (
        <span style={{ fontWeight: 400 }}>
          {t("resource.reattempt_shipment.reattempt_window_closed_on")}{" "}
          <span style={{ fontWeight: 500 }}>{reattemptEndDate}</span>
        </span>
      );
    }

    if (!ndrWindowExhausted()) {
      return <></>;
    }

    return <></>;
  };
  return (
    <div className={styles.outerContainer}>
      {showItemsList && <ViewItems />}
      <div className={styles.innerContainer}>
        <div className={styles.header}>
          <div className={styles.logoContainer}>
            <img
              src={CONFIGURATION.application.logo?.secure_url}
              alt={t("resource.reattempt_shipment.name_alt_text")}
            />
          </div>
        </div>
        {isShipmentLoading ? (
          <Loader />
        ) : shipmentDetails && Object.keys(shipmentDetails).length > 0 ? (
          <>
            {shipmentDetails?.shipment_status?.value ==
            "delivery_reattempt_requested" ? (
              <div className={styles.returningUserCont}>
                <MessageCard
                  type={
                    shipmentDetails?.shipment_status?.value ===
                      "delivery_reattempt_requested" && "success"
                  }
                  message={shipmentDetails?.shipment_status?.title || "--"}
                  showReason={false}
                  secondaryMessage={`Your delivery reattempt is scheduled for `}
                  displayDate={`${convertDDMMYYYYToReadableDate(convertISOToDDMMYYYY(shipmentDetails?.ndr_details?.delivery_scheduled_date))}`}
                />
                <ShipmentIdAndViewItems
                  customStyle={{ borderBottom: "1px solid #E0E0E0" }}
                />
                <DeliveryAddressCard
                  addresItem={{
                    name: shipmentDetails?.delivery_address?.name,
                    city: shipmentDetails?.delivery_address?.city,
                    state: shipmentDetails?.delivery_address?.state,
                    country: shipmentDetails?.delivery_address?.country,
                    pincode: shipmentDetails?.delivery_address?.pincode,
                    phoneCode:
                      shipmentDetails?.delivery_address?.country_phone_code,
                    phone: shipmentDetails?.delivery_address?.phone,
                    email: shipmentDetails?.delivery_address?.email,
                  }}
                  shipmentDetails={shipmentDetails}
                />
              </div>
            ) : reattemptDone ? (
              <div className={styles.successMessageContainer}>
                <div className={styles.successIconContainer}>
                  <CheckGreenIcon className={styles.successIcon} />
                </div>
                <div className={styles.successMessageDateCont}>
                  <div className={styles.deliveryStatusMessage}>
                    {t("resource.reattempt_shipment.reattempt_request_success")}
                  </div>
                  <div className={styles.deliveryStatus}>
                    {t(
                      "resource.reattempt_shipment.your_delivery_request_schedule"
                    )}{" "}
                    {formatDate(successRescheduleDate.current)}
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.mainContainer}>
                {shipmentDetails?.shipment_status?.value ===
                  "delivery_attempt_failed" &&
                  shipmentDetails?.ndr_details?.allowed_delivery_window
                    ?.start_date &&
                  shipmentDetails?.ndr_details?.allowed_delivery_window
                    ?.end_date &&
                  shipmentDetails?.ndr_details?.show_ndr_form &&
                  !ndrWindowExhausted() && (
                    <>
                      <MessageCard
                        type={
                          shipmentDetails?.shipment_status?.value ===
                            "delivery_attempt_failed" && "failure"
                        }
                        message={shipmentDetails?.shipment_status?.title}
                        secondaryMessage={`${shipmentDetails?.ndr_details?.failure_reason}`}
                      />
                      <ShipmentIdAndViewItems
                        customStyle={{ borderBottom: "1px solid #E0E0E0" }}
                      />
                    </>
                  )}
                {!ndrWindowExhausted && <ShipmentIdAndViewItems />}
                {showOTPpopup && (
                  <VerifyOtp
                    onClose={() => {
                      setShowOTPpopup(false);
                      setOtpResponseError("");
                      setIsResendDisabled(true);
                    }}
                    onVerify={handleOTPsubmit}
                    phoneNumber={shipmentDetails?.delivery_address?.phone}
                    email={shipmentDetails?.delivery_address?.email}
                    onResend={handleResend}
                    isResendDisabled={isResendDisabled}
                    otpResponseError={otpResponseError}
                    removeErrorMessage={removeErrorMessage}
                    coolDownSecondsRef={coolDownSecondsRef}
                    handleResendDisable={handleResendDisable}
                    showOTPpopup={showOTPpopup}
                  />
                )}

                {shipmentDetails?.ndr_details?.show_ndr_form &&
                shipmentDetails?.shipment_status?.value ==
                  "delivery_attempt_failed" &&
                shipmentDetails?.ndr_details?.allowed_delivery_window
                  ?.start_date &&
                shipmentDetails?.ndr_details?.allowed_delivery_window
                  ?.end_date &&
                !ndrWindowExhausted() ? (
                  <form onSubmit={handleSubmit(handleReattemptSubmit)}>
                    <div className={styles.datePickerContainer}>
                      <div className={styles.datePickerTitle}>
                        {t("resource.profile.choose_reattempt_date")}
                      </div>
                      <div>
                        <Controller
                          name="scheduleDate"
                          control={control}
                          rules={{
                            required: `${t("resource.profile.please_select_reattempt_date")}`,
                            validate: (value) =>
                              value?.trim?.().length > 0 ||
                              `${t("resource.profile.date_cant_be_blank")}`,
                          }}
                          render={({ field, fieldState }) => (
                            <FyDatePicker
                              {...field}
                              value={field.value}
                              ref={field.ref}
                              onChange={(date) => {
                                field.onChange(date);
                                handleDateChange(date);
                              }}
                              maxInactiveDate={convertISOToDDMMYYYY(
                                getMaxInactiveDate(
                                  shipmentDetails?.ndr_details
                                    ?.allowed_delivery_window?.start_date
                                )
                              )}
                              minInactiveDate={convertISOToDDMMYYYY(
                                shipmentDetails?.ndr_details
                                  ?.allowed_delivery_window?.end_date
                              )}
                              required
                              placeholderText="DD-MM-YYYY"
                              dateFormat="DD-MM-YYYY"
                              inputLabel={t("resource.profile.reattempt_on")}
                              excludeDates={excludeDates}
                              isLabelFloating={false}
                              error={!!fieldState.error}
                              errorMessage={fieldState.error?.message}
                            />
                          )}
                        />
                      </div>
                    </div>
                    <div className={styles.deliveryContainer}>
                      <div className={styles.deliveryDetailsTitleCont}>
                        <div className={styles.deliveryDetailsTitle}>
                          {t("resource.reattempt_shipment.delivery_details")}
                        </div>
                        <button
                          type="button"
                          className={`${styles.deliveryEdit} ${editState ? styles.faded : ""}`}
                          onClick={handleEditButtonClick}
                          disabled={editState}
                        >
                          {t("resource.facets.edit_caps")}
                        </button>
                      </div>
                      {editState ? (
                        <div className={styles.deliveryDetailsInputCont}>
                          {modifiedAddressSchema && (
                            <>
                              <AddressFormInputs
                                formSchema={modifiedAddressSchema}
                                control={control}
                                formMethods={formMethods}
                                onChange={handleFormChange}
                                customStyles={{
                                  formContainer: {
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "8px",
                                    marginTop: "0",
                                    marginBottom: "8px",
                                  },
                                }}
                              />
                            </>
                          )}
                        </div>
                      ) : (
                        <DeliveryAddressCard
                          addresItem={{
                            name: shipmentDetails?.delivery_address?.name,
                            city: shipmentDetails?.delivery_address?.city,
                            state: shipmentDetails?.delivery_address?.state,
                            country: shipmentDetails?.delivery_address?.country,
                            pincode: shipmentDetails?.delivery_address?.pincode,
                            phoneCode:
                              shipmentDetails?.delivery_address
                                ?.country_phone_code,
                            phone: shipmentDetails?.delivery_address?.phone,
                          }}
                          shipmentDetails={shipmentDetails}
                        />
                      )}

                      <div className={styles.commentsContainer}>
                        <Controller
                          name="additionalComments"
                          control={control}
                          rules={{
                            maxLength: {
                              value: 250,
                              message: t("resource.profile.max_characters_250"),
                            },
                          }}
                          render={({ field, fieldState }) => {
                            const remaining = 250 - (field.value?.length || 0);

                            return (
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  gap: "4px",
                                }}
                              >
                                <FyInput
                                  {...field}
                                  name="additionalComments"
                                  label={t(
                                    "resource.profile.additional_comments_optional"
                                  )}
                                  placeholder={t(
                                    "resource.profile.enter_remarks"
                                  )}
                                  required={false}
                                  error={!!fieldState.error}
                                  errorMessage={fieldState.error?.message}
                                  maxLength={250}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    // If pasted or typed beyond 250, trim it
                                    if (value.length > 250) {
                                      value = value.slice(0, 250);
                                    }

                                    field.onChange(value);
                                  }}
                                />
                                <div
                                  className={`${styles.addCommentsLimit} ${remaining > 0 ? styles.allowedColor : styles.notAllowedColor}`}
                                >
                                  {remaining}/250
                                </div>
                              </div>
                            );
                          }}
                        />
                      </div>
                      <div className={styles.reattemptButtonCont}>
                        {isMobile && (
                          <div
                            className={styles.cancelButtonCont}
                            onClick={handleCancelClick}
                          >
                            {t("resource.facets.cancel_caps")}
                          </div>
                        )}
                        <button
                          className={styles.reattemptButton}
                          type="submit"
                          disabled={isSubmitting}
                        >
                          {t("resource.facets.request_reattempt_facet")}
                        </button>
                      </div>
                      {!isMobile && (
                        <div
                          className={styles.cancelButtonCont}
                          onClick={handleCancelClick}
                        >
                          {t("resource.facets.cancel_caps")}
                        </div>
                      )}
                    </div>
                  </form>
                ) : ndrWindowExhausted() &&
                  shipmentDetails?.shipment_status?.value ===
                    "delivery_attempt_failed" ? (
                  <>
                    <MessageCard
                      type={
                        shipmentDetails?.shipment_status?.value ===
                          "delivery_attempt_failed" && "failure"
                      }
                      message={shipmentDetails?.shipment_status?.title}
                      secondaryMessage={`${shipmentDetails?.ndr_details?.failure_reason}`}
                    />
                    {reattemptEndDate && (
                      <div className={styles.windowExhaustedTitle}>
                        {t(
                          "resource.reattempt_shipment.reattempt_window_closed_on"
                        )}{" "}
                        <span style={{ fontWeight: 500 }}>
                          {reattemptEndDate}
                        </span>
                      </div>
                    )}
                    <ShipmentIdAndViewItems
                      customStyle={{ paddingBottom: "0px" }}
                    />
                  </>
                ) : (
                  <>
                    <MessageCard
                      type={
                        shipmentDetails?.shipment_status?.value !=
                        "delivery_attempt_failed"
                          ? "info"
                          : "failure"
                      }
                      message={shipmentDetails?.shipment_status?.title}
                      showReason={false}
                      secondaryMessage={getSecondaryMessage()}
                    />
                    <ShipmentIdAndViewItems
                      customStyle={{ paddingBottom: "0px" }}
                    />
                  </>
                )}
                {isMobile && (
                  <div
                    className={`${styles.fyndLogoContainer} ${
                      shipmentDetails?.ndr_details?.show_ndr_form &&
                      shipmentDetails?.shipment_status?.value ==
                        "delivery_attempt_failed" &&
                      !ndrWindowExhausted()
                        ? styles.fyndLogoWithMarginBottom
                        : ""
                    }`}
                  >
                    <div>{t("resource.reattempt_shipment.powered_by")}</div>
                    <div>
                      <img src={FyndLogo} alt="Fynd Logo" />
                    </div>
                  </div>
                )}
              </div>
            )}
            {!isMobile && (
              <div className={styles.fyndLogoContainer}>
                <div>{t("resource.reattempt_shipment.powered_by")}</div>
                <div>
                  <img src={FyndLogo} alt="Fynd Logo" />
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState
            title={t("resource.section.order.empty_state_title")}
            description={t("resource.section.order.empty_state_desc")}
            btnLink="/profile/orders"
            btnTitle={t("resource.section.order.emptybtn_title")}
          ></EmptyState>
        )}
      </div>
    </div>
  );
};

export default RequestReattempt;
