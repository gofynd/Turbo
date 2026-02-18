import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { set, useForm } from "react-hook-form";
import EmptyState from "../components/empty-state/empty-state";
import { GET_SHIPMENT_CUSTOMER_DETAILS } from "../queries/shipmentQuery";
import {
  ADD_BENEFICIARY_UPI,
  GET_REFUND_DETAILS,
  SEND_OTP_FOR_REFUND_BANK_DETAILS,
  VERIFY_OTP_FOR_REFUND_BANK_DETAILS,
  GETREFUNDBENEFICIARIESUSINGOTPSESSION,
} from "../queries/refundQuery";
import Button from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import Input from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import BankForm from "../components/refund/bank-form";
import BankVerifiedIcon from "../assets/images/bankVerified.svg";
import NoPageFooud from "../assets/images/no-page-found.svg";
import RadioIcon from "../assets/images/radio";
import useRefundDetails from "../page-layouts/orders/useRefundDetails";
import useRefundManagement from "../page-layouts/refund-management/useRefundManagement";
import BankIcon from "../assets/images/upi-icon.svg";
import CheckmarkFilledIcon from "../assets/images/checkmark-filled.svg";
import { Skeleton } from "../components/core/skeletons";
import { useSnackbar, useViewport } from "../helper/hooks";
import styles from "../styles/refund.less";
import useHeader from "../components/header/useHeader";

function Refund({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { supportInfo } = useHeader(fpi);
  const isMobile = useViewport(0, 768);
  const { showSnackbar } = useSnackbar();
  const { orderId, shipmentId } = useParams();
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [shipmentDetails, setShipmentDetails] = useState({});
  const [hasShipmentError, setHasShipmentError] = useState(false);

  const [customerPhone, setCustomerPhone] = useState(null);
  const [isAdditionalLoading, setIsAdditionalLoading] = useState(false);
  const [exisitingBankRefundOptions, setExisingBankRefundOptions] = useState(
    []
  );

  const [otpSessionUpiBeneficiaries, setOtpSessionUpiBeneficiaries] = useState(
    []
  );
  const [otpSessionBankBeneficiaries, setOtpSessionBankBeneficiaries] =
    useState([]);

  const [shouldCheckRefundModes, setShouldCheckRefundModes] = useState(false);

  const [refundAmount, setRefundAmount] = useState(null);
  const [showBeneficiaryPage, setShowBeneficiaryAdditionPage] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const sendOtpResponse = useRef(null);
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [isBeneficiaryAdded, setIsBeneficiaryAdded] = useState(false);
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

  const [selectedOption, setSelectedOption] = useState("");
  const [upiId, setUpiId] = useState("");
  const [isValidUpi, setIsValidUpi] = useState(false);
  const [isBankFormValid, setIsBankFormValid] = useState(false);
  const [isOtpSend, setIsOtpSend] = useState(false);
  const [currencySymbol, setCurrencySymbol] = useState("");
  const [isAmountLoading, setIsAmountLoading] = useState(true);
  const { verifyIfscCode, addRefundBankAccountUsingOTP } =
    useRefundDetails(fpi);
  const [otpResendTime, setOtpResendTime] = useState(0);
  const resendTimerRef = useRef(null);
  const upiFormRef = useRef(null);

  const [isRefundOptionsResolved, setIsRefundOptionsResolved] = useState(false);
  const [isRefundOptionsEmpty, setIsRefundOptionsEmpty] = useState(false);
  const { refundOptions, isRefundModesResolved, isRefundModesLoading } =
    useRefundManagement(fpi, { enabled: shouldCheckRefundModes });

  const { email, phone } = supportInfo?.contact ?? {};
  const { email: emailArray = [], active: emailActive = false } = email ?? {};
  const { phone: phoneArray = [], active: phoneActive = false } = phone ?? {};

  const emailAddress =
    emailActive && emailArray.length > 0 ? emailArray[0]?.value : null;

  const phoneNumber =
    phoneActive && phoneArray.length > 0
      ? `${phoneArray[0]?.code ? `+${phoneArray[0].code}-` : ""}${phoneArray[0]?.number}`
      : null;

  const clearTimer = () => {
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }
  };

  const timer = (remaining) => {
    let remainingTime = remaining;
    resendTimerRef.current = setInterval(() => {
      remainingTime -= 1;
      if (remainingTime <= 0) {
        clearTimer();
      }
      setOtpResendTime(remainingTime);
    }, 1000);
  };

  const fetchAdditionalData = (payload) => {
    setIsAdditionalLoading(true);
    fpi
      .executeGQL(SEND_OTP_FOR_REFUND_BANK_DETAILS, payload)
      .then(({ data, errors }) => {
        if (errors && errors?.length) {
          showSnackbar(errors[0].message, "error");
          return;
        }
        setOtpResendTime(data.sendOtpForRefundBankDetails.resend_timer);
        timer(data.sendOtpForRefundBankDetails.resend_timer);
        sendOtpResponse.current = data.sendOtpForRefundBankDetails;
        setIsOtpSend(true);
      })
      .catch((error) => {
        if (error?.errors && error?.errors?.length) {
          showSnackbar(error?.errors?.[0]?.message, "error");
        }
      })
      .finally(() => {
        setIsAdditionalLoading(false);
      });
  };

  const fetchRefundBeneficiariesUsingOtpSession = async () => {
    try {
      const variables = {
        orderId,
        shipmentId,
        filterBy: "shipment",
      };

      const { data, errors } = await fpi.executeGQL(
        GETREFUNDBENEFICIARIESUSINGOTPSESSION,
        variables
      );

      const resp = data?.getRefundBeneficiariesUsingOTPSession;
      console.log(resp, "respresprespresp");

      const upiList = resp?.upi || [];
      const bankList = resp?.bank || [];

      setOtpSessionUpiBeneficiaries(upiList);
      setOtpSessionBankBeneficiaries(bankList);
      setExisingBankRefundOptions(bankList || []);

      // If UPI beneficiary exists, treat as success
      if (upiList.length > 0) {
        const primaryUpi = upiList[0];
        setIsBeneficiaryAdded(true);
        setBeneficiaryDetails({
          upi: primaryUpi.vpa_address,
          account_holder: primaryUpi.customer_name,
          logo: primaryUpi.logo,
          beneficiary_id: primaryUpi.id,
        });
        return;
      }

      // If Bank beneficiary exists, treat as success
      if (bankList.length > 0) {
        const primaryBank = bankList[0];
        setIsBeneficiaryAdded(true);
        setBeneficiaryDetails({
          account_no: primaryBank.account_no,
          account_holder: primaryBank.account_holder,
          logo: primaryBank.logo,
          beneficiary_id: primaryBank.id,
        });
        return;
      }

      // No beneficiaries for this OTP session → show add-beneficiary page
      setShowBeneficiaryAdditionPage(true);
    } catch (err) {
      // Optional: add error handling if needed
    }
  };

  const handleOtpResend = () => {
    fetchAdditionalData({
      orderId,
      shipmentId,
    });
  };

  async function getRefundDetails(orderID) {
    try {
      const values = {
        orderId: orderID || "",
      };
      fpi.executeGQL(GET_REFUND_DETAILS, values).then((res) => {
        if (
          !res?.data?.refund?.user_beneficiaries_detail?.beneficiaries ||
          res?.data?.refund?.user_beneficiaries_detail?.beneficiaries
            ?.length === 0
        ) {
          setShowBeneficiaryAdditionPage(true);
        }
        if (res?.data?.refund) {
          const data =
            res?.data?.refund?.user_beneficiaries_detail?.beneficiaries;
          setExisingBankRefundOptions(data);
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  const handleOtpSubmit = async ({ otp }) => {
    const payload = {
      orderId,
      shipmentId,
      verifyOtpInput: {
        otp_code: otp,
        request_id: sendOtpResponse?.current?.request_id,
      },
    };

    try {
      const { data, errors } = await fpi.executeGQL(
        VERIFY_OTP_FOR_REFUND_BANK_DETAILS,
        payload
      );

      if (errors && errors?.length) {
        showSnackbar(errors[0].message, "error");
        return;
      }

      const success = !!data?.verifyOtpForRefundBankDetails?.success;

      if (!success) {
        showSnackbar(
          t("resource.refund_order.invalid_otp") || "Invalid OTP",
          "error"
        );
        return;
      }

      setIsValidOtp(true);
      setShouldCheckRefundModes(true);

    } catch (error) {
      if (error?.errors && error.errors.length) {
        showSnackbar(error.errors[0].message, "error");
      }
    }
  };

  const handleBankFormSubmit = async (
    { ifscCode, accountNo, accounHolder },
    { verify_IFSC_code },
    { selectedBankCheck = false }
  ) => {
    // Section to map if the user is selecting from saved Banks
    if (selectedBank && selectedBankCheck) {
      (ifscCode = selectedBank.ifsc_code),
        (accountNo = selectedBank.account_no),
        (accounHolder = selectedBank.account_holder),
        await verifyIfscCode(selectedBank.ifsc_code).then((data) => {
          (verify_IFSC_code.bank_name = data.verify_IFSC_code.bank_name),
            (verify_IFSC_code.branch_name = data.verify_IFSC_code.branch_name);
        });
    }
    const beneficiaryDetailsPayload = {
      details: {
        ifsc_code: ifscCode || "",
        account_no: accountNo || "",
        account_holder: accounHolder || "",
        // bank_name: verify_IFSC_code?.bank_name || "",
        // branch_name: verify_IFSC_code?.branch_name || "",
      },
      order_id: orderId,
      shipment_id: shipmentId,
    };
    addRefundBankAccountUsingOTP(beneficiaryDetailsPayload)
      .then((data) => {
        const isSuccess = data?.success;
        if (isSuccess) {
          setIsBeneficiaryAdded(isSuccess);
          setBeneficiaryDetails(data);
        }
        // handling validations with different errors
        if (!isSuccess) {
          if (data?.msg) {
            // showSnackbar(data?.msg, "error");
            return;
          }
        }
      })
      .catch((error) => {
        if (error?.errors && error.errors.length) {
          showSnackbar(error.errors[0].message, "error");
          return;
        }
      })
      .finally(() => {});
  };

  useEffect(() => {
    if (!shipmentId || !orderId) return;

    setIsLoading(true);
    setIsAmountLoading(true);
    setHasShipmentError(false);
    const values = {
      shipmentId: shipmentId || "",
      orderId: orderId || "",
    };

    fpi
      .executeGQL(GET_SHIPMENT_CUSTOMER_DETAILS, values)
      .then(({ data, errors }) => {
        if (errors && errors.length) {
          console.error("Shipment GQL errors: ", errors);
          setHasShipmentError(true);
          return;
        }

        const shipment = data?.shipment;
        if (!shipment) {
          setHasShipmentError(true);
          return;
        }

        setShipmentDetails(shipment.detail || {});

        const customerPhone = shipment.customer_detail?.phone;
        const refundAmount = shipment.detail?.prices?.refund_amount;
        const currencySymbol = shipment.detail?.prices?.currency_symbol;

        setCustomerPhone(customerPhone);
        setCurrencySymbol(currencySymbol);
        setRefundAmount(refundAmount);
        setIsAmountLoading(false);
      })
      .catch((error) => {
        console.error("GraphQL Error:", error);
        setIsAmountLoading(false);
        setHasShipmentError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsAmountLoading(false);
      });
  }, [shipmentId, orderId]);

  console.log(shipmentDetails, "shipmentDetails");

  useEffect(() => {
    if (refundOptions === undefined) return;

    setIsRefundOptionsResolved(true);
    setIsRefundOptionsEmpty(
      Array.isArray(refundOptions) && refundOptions.length === 0
    );
  }, [refundOptions]);

  const handleSendOtp = () => {
    if (customerPhone) {
      fetchAdditionalData({
        orderId,
        shipmentId,
      });
    }
  };

  console.log(hasShipmentError, "hasShipmentErrorhasShipmentError");
  console.log(
    shipmentDetails?.payment_info?.[0]?.payment_mode,
    " shipmentDetails?.payment_info?.payment_mode"
  );
  const paymentMode = shipmentDetails?.payment_info?.[0]?.payment_mode;

  console.log(hasShipmentError, "hasShipmentError");
  const includesIgnoreCase = (str = "", keyword = "") =>
    str?.toLowerCase().includes(keyword?.toLowerCase());

  const hasBankOrUpi =
    Array.isArray(refundOptions) &&
    refundOptions.some(
      (opt) =>
        includesIgnoreCase(opt?.display_name, "bank") ||
        includesIgnoreCase(opt?.display_name, "upi")
    );

  const shouldShowRefundOptionsError =
    shouldCheckRefundModes &&
    isRefundModesResolved &&
    !isRefundModesLoading &&
    !hasBankOrUpi;

  useEffect(() => {
    if (!shouldCheckRefundModes) return; 
    if (!isRefundModesResolved || isRefundModesLoading) return; 

    if (!hasBankOrUpi) {
      return;
    }

    setExisingBankRefundOptions([]);
    fetchRefundBeneficiariesUsingOtpSession();
  }, [
    shouldCheckRefundModes,
    isRefundModesResolved,
    isRefundModesLoading,
    hasBankOrUpi,
  ]);

  if (!orderId || !shipmentId) {
    return (
      <EmptyState
        title={t("resource.refund_order.invalid_refund_link")}
        showButton={false}
      />
    );
  }

  if (shouldShowRefundOptionsError) {
    return (
      <div className={styles.noPageFoundWrapper}>
        <div className={styles.imgContainer}>
          <NoPageFooud />
        </div>
        <div className={styles.content}>
          <h3>Page Not Found</h3>
          <p>
            {t("resource.refund_order.shipment_ineligible_for_bank_transfer") ||
              "The shipment you’re trying to access isn’t eligible for Bank Transfer."}{" "}
            {t("resource.refund_order.if_you_need_help") ||
              "If you need help, you can reach us at,"}{" "}
            {emailAddress && (
              <>
                <a className={styles.link} href={`mailto:${emailAddress}`}>
                  {emailAddress}
                </a>
              </>
            )}
            {phoneNumber && (
              <>
                {" "}
                {t("resource.refund_order.or_call_us_at") ||
                  "or call us at"}{" "}
                <a className={styles.link} href={`tel:${phoneNumber}`}>
                  {phoneNumber}.
                </a>
              </>
            )}
            {!emailAddress && !phoneNumber && "."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.container} ${isBeneficiaryAdded ? styles.beneficiaryContainer : ""}`}
      >
        {isBeneficiaryAdded ? (
          <BeneficiarySuccess
            refundAmount={refundAmount}
            currencySymbol={currencySymbol}
            orderId={orderId}
            shipmentId={shipmentId}
            beneficiaryDetails={beneficiaryDetails}
          />
        ) : (
          <>
            <div className={styles.refundHeader}>
              <img
                src={CONFIGURATION.application.logo?.secure_url?.replace(
                  "original",
                  "resize-h:32"
                )}
                alt={t("resource.refund_order.name_alt_text")}
              />
            </div>
            <RefundDetails
              orderId={orderId}
              refundAmount={refundAmount}
              currencySymbol={currencySymbol}
              shipmentId={shipmentId}
              isLoading={isAmountLoading}
            />
            {isValidOtp ? (
              showBeneficiaryPage ? (
                <BeneficiaryForm
                  fpi={fpi}
                  onSubmit={handleBankFormSubmit}
                  setShowBeneficiaryAdditionPage={
                    setShowBeneficiaryAdditionPage
                  }
                  exisitingBankRefundOptions={exisitingBankRefundOptions}
                  onSendOtp={handleSendOtp}
                  isOtpSend={isOtpSend}
                  isAdditionalLoading={isAdditionalLoading}
                  selectedOption={selectedOption}
                  setBeneficiaryDetails={setBeneficiaryDetails}
                  setSelectedOption={setSelectedOption}
                  setIsBeneficiaryAdded={setIsBeneficiaryAdded}
                  setUpiId={setUpiId}
                  setIsValidUpi={setIsValidUpi}
                  setIsBankFormValid={setIsBankFormValid}
                  upiFormRef={upiFormRef}
                  refundOptions={refundOptions}
                />
              ) : null
            ) : (
              <OtpValidationForm
                otpResendTime={otpResendTime}
                onSubmit={handleOtpSubmit}
                onResendClick={handleOtpResend}
                customerPhone={customerPhone}
                onSendOtp={handleSendOtp}
                isOtpSend={isOtpSend}
                isAdditionalLoading={isAdditionalLoading}
              />
            )}
          </>
        )}
      </div>
      {isValidOtp && showBeneficiaryPage && !isBeneficiaryAdded && (
        <>
          {isMobile && includesIgnoreCase(selectedOption, "upi") && (
            <div className={styles.mobileStickyButtonWrapper}>
              <button
                className={styles.mobileContinueBtn}
                type="button"
                disabled={!isValidUpi || !upiId?.trim()}
                onClick={() => {
                  if (upiFormRef.current) {
                    upiFormRef.current.requestSubmit();
                  }
                }}
              >
                {t("resource.common.continue")}
              </button>
            </div>
          )}

          {isMobile && includesIgnoreCase(selectedOption, "bank") && (
            <div className={styles.mobileStickyButtonWrapper}>
              <button
                className={styles.mobileContinueBtn}
                type="submit"
                form="bankFormId"
                disabled={!isBankFormValid}
              >
                {t("resource.common.continue")}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BeneficiarySuccess({
  orderId,
  shipmentId,
  beneficiaryDetails,
  refundAmount = 0,
  currencySymbol,
}) {
  const { t } = useGlobalTranslation("translation");
  return (
    <>
      <div className={styles.beneficiaryHeader}>
        <CheckmarkFilledIcon />
        <div className={styles.titleWrapper}>
          <h4>{t("resource.refund_order.beneficiary_added")}</h4>
          <div className={styles.info}>
            <span>
              {" "}
              <span className={styles.refundAmount}>₹{refundAmount}</span>{" "}
              {t("resource.refund_order.credit_time_message")}
            </span>
          </div>
        </div>
      </div>
      <RefundDetails
        orderId={orderId}
        shipmentId={shipmentId}
        beneficiaryDetails={beneficiaryDetails}
        refundAmount={refundAmount}
        currencySymbol={currencySymbol}
      />
    </>
  );
}

function RefundDetails({
  orderId = "ORDER_ID",
  shipmentId = "SHIPMENT_ID",
  refundAmount = 0,
  beneficiaryDetails = null,
  currencySymbol = "",
  isLoading = false,
}) {
  const { t } = useGlobalTranslation("translation");
  const isUpiSuccess = Boolean(beneficiaryDetails?.upi);
  const hasRefundAmount = refundAmount && !isLoading;

  // If beneficiary details exist (success case), show success UI
  if (beneficiaryDetails) {
    return (
      <div className={styles.refundDetails}>
        {isUpiSuccess ? (
          <div className={styles.upiSuccessMsgContainer}>
            <div className={styles.titleContainer}>
              <span>{t("resource.refund_order.beneficiary_details")}</span>
            </div>
            <div className={styles.detailsContainer}>
              <span className={styles.upiTitle}>
                {t("resource.refund_order.upi_vpa")}
              </span>
              <span className={styles.upiId}>{beneficiaryDetails?.upi}</span>
            </div>
          </div>
        ) : (
          <div className={styles.bankSuccessMsgContainer}>
            <div className={styles.titleContainer}>
              <span className={styles.title}>
                {t("resource.refund_order.total_estimated_refund")}
              </span>
              <span className={styles.amount}>₹{refundAmount}</span>
            </div>
            <div className={styles.refundInfoContainer}>
              <div className={styles.refundLogoInfoContainer}>
                <div className={styles.logoContainer}>
                  <BankIcon className={styles.logo} />
                </div>
                <span className={styles.refundBeneficiaryInfo}>
                  <span className={styles.boldText}>₹{refundAmount}</span>{" "}
                  {t("resource.refund_order.will_be_refunded_to_your_bank_no")}{" "}
                  <span className={styles.boldText}>
                    {beneficiaryDetails?.account_no}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.refundDetails}>
      <div className={styles.refundDetailsItem}>
        <span>{t("resource.refund_order.order_id")}</span>
        <span>{orderId}</span>
      </div>
      <div className={styles.refundDetailsItem}>
        <span>{t("resource.refund_order.refund_amount")}</span>
        {hasRefundAmount ? (
          <span>
            {currencySymbol}
            {refundAmount}
          </span>
        ) : (
          <span>
            <Skeleton height={20} width="35px" />
          </span>
        )}
      </div>
    </div>
  );
}

function OtpValidationForm({
  otpResendTime,
  onSubmit,
  onResendClick,
  customerPhone,
  onSendOtp,
  isOtpSend,
  isAdditionalLoading,
}) {
  const {
    handleSubmit,
    register,
    formState: { isValid, errors },
    watch,
    setValue,
  } = useForm();

  const { t } = useGlobalTranslation("translation");
  const [otp, setOtp] = useState(Array(4).fill(""));
  const inputs = useRef([]);
  const handleChange = (e, index) => {
    const { value } = e.target;
    if (value.match(/^\d$/) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      const otpString = newOtp.join("");
      setValue("otp", otpString);
      if (value && index < 3) {
        inputs.current[index + 1]?.focus();
      }
    }
  };
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        inputs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        setValue("otp", newOtp.join(""));
      }
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.match(/^\d{4}$/)) {
      const newOtp = pastedData.split("").slice(0, 4);
      setOtp(newOtp);
      setValue("otp", pastedData);
      inputs.current[3]?.focus();
    }
  };
  const otpValue = watch("otp");
  const isOtpValid =
    otpValue && otpValue.length === 4 && /^[0-9]{4}$/.test(otpValue);
  // Auto focus first input when OTP section becomes visible
  useEffect(() => {
    if (isOtpSend && inputs.current[0]) {
      setTimeout(() => {
        inputs.current[0]?.focus();
      }, 100);
    }
  }, [isOtpSend]);

  return (
    <div className={styles.refundOtp}>
      <div className={styles.refundOtpHead}>
        {isOtpSend
          ? t("resource.common.enter_otp")
          : t("resource.common.complete_verification")}
        <div className={styles.subText}>
          {isOtpSend
            ? ` ${t("resource.refund_order.otp_sent_to_phone")} ${customerPhone || ""} `
            : t("resource.refund_order.click_on_send_otp_to_proceed")}
        </div>
      </div>
      {!isOtpSend ? (
        <form className={styles.refundOtpForm}>
          {customerPhone ? (
            <>
              <div className={styles.refundFormFieldWrapper}>
                <Input
                  type="text"
                  labelVariant="floating"
                  labelClassName={styles.otpInputLabel}
                  showAsterik
                  required
                  inputMode="numeric"
                  disabled={true}
                  value={customerPhone}
                />
              </div>
              <Button
                className={styles.refundOtpSubmitBtn}
                variant="contained"
                size="large"
                color="primary"
                fullWidth={true}
                type="button"
                disabled={isAdditionalLoading || !customerPhone}
                onClick={onSendOtp}
              >
                {isAdditionalLoading
                  ? t("resource.common.sending")
                  : t("resource.profile.send_otp")}
              </Button>
            </>
          ) : (
            <>
              <Skeleton height="48px" width="100%" />
              <Skeleton height="48px" width="100%" />
            </>
          )}
        </form>
      ) : (
        <form
          className={styles.refundOtpFormContainer}
          onSubmit={handleSubmit(onSubmit)}
        >
          <label>{t("resource.common.enter_otp")}</label>
          <div className={styles.otpFieldWrapper}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                value={digit}
                ref={(el) => (inputs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                inputMode="numeric"
                pattern="\d*"
                maxLength={1}
                className={styles.otpInputItem}
                autoComplete="off"
              />
            ))}
          </div>

          <div className={styles.otpTimerBtnContainer}>
            <span
              className={`${styles.formResendTimer} ${
                otpResendTime === 0 ? styles.resendEnabled : ""
              }`}
              disabled={otpResendTime > 0}
              type="button"
              onClick={onResendClick}
              style={{ cursor: otpResendTime > 0 ? "default" : "pointer" }}
            >
              {otpResendTime > 0
                ? t("resource.refund_order.resend_otp_in_seconds", {
                    time: otpResendTime,
                  })
                : t("resource.refund_order.resend_otp")}
            </span>

            {errors.otp && (
              <div className={styles.errorMessage}>{errors.otp.message}</div>
            )}
          </div>
          <Button
            className={styles.refundOtpSubmitBtn}
            variant="contained"
            size="large"
            color="primary"
            fullWidth={true}
            type="submit"
            disabled={!isOtpValid}
          >
            {t("resource.refund_order.verify_caps")}
          </Button>
        </form>
      )}
    </div>
  );
}

function BeneficiaryForm({
  fpi,
  onSubmit,
  setShowBeneficiaryAdditionPage,
  exisitingBankRefundOptions,
  setIsBeneficiaryAdded,
  setBeneficiaryDetails,
  selectedOption,
  setSelectedOption,
  setUpiId,
  setIsValidUpi,
  setIsBankFormValid,
  upiFormRef,
  refundOptions,
}) {
  const { addRefundBankAccountUsingOTP } = useRefundDetails(fpi);
  const bankFormFocusRef = useRef(null);
  const includesIgnoreCase = (str = "", keyword = "") =>
    str?.toLowerCase().includes(keyword?.toLowerCase());

  const renderRefundOptions = refundOptions?.filter((item) => {
    return (
      includesIgnoreCase(item?.display_name, "bank") ||
      includesIgnoreCase(item?.display_name, "upi")
    );
  });

  const upiSuggestionArr = ["okhdfcbank", "okicici", "oksbi"];
  const upiSuggestions =
    refundOptions?.find((item) => item?.beneficiary_type === "upi")
      ?.suggested_list || upiSuggestionArr;

  const [vpa, setVpa] = React.useState("");
  const [showUPIAutoComplete, setUPIAutoComplete] = React.useState(false);
  const [filteredUPISuggestions, setFilteredUPISuggestions] = React.useState(
    []
  );

  const handleOptionChange = (optionName) => {
    setSelectedOption(optionName);
    if (includesIgnoreCase(optionName, "bank")) {
      clearErrors("upiId");
      resetField("upiId", { defaultValue: "" });
      unregister("upiId");
      setIsValidUpi(false);
      setUpiId("");
      setUPIAutoComplete(false);
      setFilteredUPISuggestions([]);
    }
    if (includesIgnoreCase(optionName, "upi")) {
      setIsBankFormValid(false);
    }
  };

  const selectedUpiRef = useRef(null);
  const { orderId, shipmentId } = useParams();

  const { showSnackbar } = useSnackbar();
  const upiInputRef = useRef(null);
  const upiSuggestionsRef = useRef(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    resetField,
    unregister,
    formState: { errors, touchedFields, isValid },
  } = useForm({
    defaultValues: {
      refundOption: "",
      upiId: "",
    },
    mode: "onChange",
    shouldUnregister: true,
    reValidateMode: "onChange",
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const upiId = watch("upiId");
  const { t } = useGlobalTranslation("translation");
  const handleUPIChange = (event, shouldValidate = true) => {
    let value = event.target.value.trim();
    const atCount = (value.match(/@/g) || []).length;
    if (atCount > 1) {
      value = value.slice(0, -1);
    }

    setVpa(value);

    // ✅ Only validate if we actually want to (e.g., onChange but not onFocus)
    setValue("upiId", value, { shouldValidate });

    if (value.includes("@")) {
      const [, suffix = ""] = value.split("@");
      const filtered =
        suffix.trim() === ""
          ? upiSuggestions
          : upiSuggestions.filter((suggestion) =>
              suggestion.toLowerCase().includes(suffix.toLowerCase())
            );
      setFilteredUPISuggestions(filtered);
      setUPIAutoComplete(true);
    } else {
      setFilteredUPISuggestions([]);
      setUPIAutoComplete(false);
    }
  };

  const onClickAutoComplete = (selectedValue) => {
    setVpa(selectedValue);
    setValue("upiId", selectedValue, { shouldValidate: true });
    setFilteredUPISuggestions([]);
    setUPIAutoComplete(false);
    selectedUpiRef.current = null;
  };
  useEffect(() => {
    if (includesIgnoreCase(selectedOption, "bank")) {
      setTimeout(() => {
        bankFormFocusRef.current?.focus();
      }, 50);
    }
  }, [selectedOption]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        upiSuggestionsRef.current &&
        !upiSuggestionsRef.current.contains(event.target) &&
        upiInputRef.current &&
        !upiInputRef.current.contains(event.target)
      ) {
        setUPIAutoComplete(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addUpi = async (formdata) => {
    try {
      const beneficiaryDetails = {
        details: {
          upi: formdata.upiId.trim(),
        },
        order_id: orderId,
        shipment_id: shipmentId,
      };

      const response = await addRefundBankAccountUsingOTP(beneficiaryDetails);
      const isSuccess = response?.success === true && response?.upi;

      if (isSuccess) {
        showSnackbar(
          response?.message || t("resource.checkout.upi_id_added_successfully"),
          "success"
        );

        setShowBeneficiaryAdditionPage(false);
        setIsBeneficiaryAdded(true);
        setBeneficiaryDetails({
          upi: response?.upi,
          account_holder: response?.account_holder,
          logo: response?.logo,
          beneficiary_id: response?.beneficiary_id,
        });
        return;
      } else {
        const errMsg =
          response?.message || t("resource.checkout.failed_to_add_upi_id");
      }
    } catch (err) {
      const errMsg = err?.message || t("resource.common.address.error_message");
      showSnackbar(errMsg, "error");
    }
  };

  useEffect(() => {
    if (includesIgnoreCase(selectedOption, "upi")) {
      setTimeout(() => {
        const upiField = document.querySelector('input[name="upiId"]');
        if (upiField) upiField.focus();
      }, 50);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (includesIgnoreCase(selectedOption, "bank")) {
      setTimeout(() => {
        const ifscInput = document.querySelector('input[name="ifscCode"]');
        if (ifscInput) ifscInput.focus();
      }, 50);
    }
  }, [selectedOption]);

  useEffect(() => {
    if (includesIgnoreCase(selectedOption, "upi")) {
      const trimmed = upiId?.trim();
      const isValidUpiInput = isValid && !!trimmed && ValidateVPA(trimmed);
      setIsValidUpi(isValidUpiInput);
      setUpiId(upiId);
    }
  }, [upiId, isValid, selectedOption]);

  const ValidateVPA = (vpa) => {
    const validPattern = /^\w+@\w+$/;
    return validPattern.test(vpa);
  };

  const renderUpiForm = () => (
    <div ref={upiInputRef}>
      <form
        ref={upiFormRef}
        onSubmit={handleSubmit(addUpi)}
        className={`${styles.addAccountForm} ${styles.getUpiInput}`}
      >
        <Input
          label={t("resource.common.enter_upi_id")}
          labelVariant="floating"
          showAsterik
          required
          id="1"
          maxLength={18}
          type="text"
          {...register("upiId", {
            required: t("resource.common.upi_id_is_required"),
            validate: (value) =>
              !value?.trim()
                ? t("resource.common.upi_id_is_required")
                : ValidateVPA(value.trim())
                  ? true
                  : t("resource.checkout.invalid_upi_id"),
          })}
          onChange={(e) => handleUPIChange(e, true)}
          onFocus={(e) => handleUPIChange(e, false)}
          error={!!errors?.upiId && !!upiId?.trim()}
          onBlur={() => {}}
          errorMessage={errors?.upiId?.message || ""}
        />

        {!isMobile &&
          showUPIAutoComplete &&
          filteredUPISuggestions.length > 0 && (
            <div
              className={styles.upiSuggestionsDesktop}
              ref={upiSuggestionsRef}
            >
              <ul className={styles.upiAutoCompleteWrapper}>
                {filteredUPISuggestions.map((suffix) => (
                  <li
                    key={suffix}
                    className={styles.upiAutoCompleteItem}
                    onClick={() =>
                      onClickAutoComplete(`${vpa.replace(/@.*/, "")}${suffix}`)
                    }
                  >
                    {`${vpa.replace(/@.*/, "")}${suffix}`}{" "}
                  </li>
                ))}
              </ul>
            </div>
          )}
        {isMobile &&
          showUPIAutoComplete &&
          filteredUPISuggestions.length > 0 && (
            <div ref={upiSuggestionsRef}>
              <ul className={styles.upiChipsWrapper}>
                {filteredUPISuggestions.map((suffix) => (
                  <li
                    key={suffix}
                    className={styles.upiChip}
                    onClick={() =>
                      onClickAutoComplete(`${vpa.replace(/@.*/, "")}${suffix}`)
                    }
                  >
                    {`${vpa.replace(/@.*/, "")}${suffix}`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        <div className={styles.footerSectionContinue}>
          {!isMobile && (
            <div className={styles.footerSection}>
              <button type="submit" className={styles.btn} disabled={!isValid}>
                {t("resource.common.continue")}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
  return (
    <div className={styles.beneficiaryForm}>
      <div className={styles.refundOptionContainer}>
        <h5 className={styles.refundTitleText}>
          {t("resource.refund_order.select_refund_option_title")}
        </h5>
        <div className={styles.optionWrapper}>
          {!renderRefundOptions || renderRefundOptions.length === 0 ? (
            <>
              {Array.from({ length: 2 }, (_, i) => (
                <div key={i} className={styles.refundOptionShimmer}>
                  <span className={styles.regularRadio}>
                    <Skeleton width={24} height={24} circle />
                  </span>
                  <span className={styles.refundOptionText}>
                    <Skeleton width={180} height={24} />
                  </span>
                </div>
              ))}
            </>
          ) : (
            renderRefundOptions?.map((option) => (
              <React.Fragment key={option.display_name}>
                <div className={styles.optionContainer}>
                  <label className={styles.optionLabel}>
                    <div className={styles.radioWrapper}>
                      <div
                        className={styles.refundOptionRadio}
                        onClick={() => {
                          handleOptionChange(option.display_name);
                        }}
                      >
                        <span
                          className={`${styles.regularRadio} ${selectedOption === option.display_name ? styles.checked : ""}`}
                        >
                          <RadioIcon
                            width={24}
                            checked={selectedOption === option.display_name}
                          />
                        </span>
                        <span className={styles.refundOptionText}>
                          {option.display_name}
                        </span>
                      </div>
                    </div>
                    {selectedOption === option.display_name && (
                      <p className={styles.msg}>{option.message}</p>
                    )}
                  </label>

                  {selectedOption === option.display_name &&
                    includesIgnoreCase(option.display_name, "bank") && (
                      <div className={styles.bankSectionContainer}>
                        <h4 className={styles.recentlyUseBankTitle}>
                          {t("resource.refund_order.enter_bank_details")}
                        </h4>

                        <BankForm
                          fpi={fpi}
                          addBankAccount={onSubmit}
                          setShowBeneficiaryAdditionPage={
                            setShowBeneficiaryAdditionPage
                          }
                          isMobile={isMobile}
                          customClass={styles.bankFormContainer}
                          exisitingBankRefundOptions={
                            exisitingBankRefundOptions
                          }
                          customBtnClass={
                            isMobile ? styles.hideBankFormBtn : ""
                          }
                          focusRef={bankFormFocusRef}
                          setIsBankFormValid={setIsBankFormValid}
                        />
                      </div>
                    )}

                  {selectedOption === option.display_name &&
                    includesIgnoreCase(option.display_name, "upi") && (
                      <div className={`${styles.upiWrapper}`}>
                        {renderUpiForm()}
                      </div>
                    )}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Refund;
