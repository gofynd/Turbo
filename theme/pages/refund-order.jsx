import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useForm } from "react-hook-form";
import EmptyState from "../components/empty-state/empty-state";
import useRefundDetails from "../page-layouts/orders/useRefundDetails";
import { GET_SHIPMENT_CUSTOMER_DETAILS } from "../queries/shipmentQuery";
import {
  GET_REFUND_DETAILS,
  SEND_OTP_FOR_REFUND_BANK_DETAILS,
  VERIFY_OTP_FOR_REFUND_BANK_DETAILS,
} from "../queries/refundQuery";
import styles from "../styles/refund.less";
import Button from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/components/core/fy-button/fy-button.css";
import Input from "@gofynd/theme-template/components/core/fy-input/fy-input";
import "@gofynd/theme-template/components/core/fy-input/fy-input.css";
import BankForm from "../components/refund/bank-form";
import BankVerifiedIcon from "../assets/images/bankVerified.svg";
import RadioIcon from "../assets/images/radio";
import CheckmarkFilledIcon from "../assets/images/checkmark-filled.svg";

import { useSnackbar } from "../helper/hooks";

const TRANSFER_MODE = {
  BANK: "bank",
  VPA: "vpa",
  PAYTM: "paytm",
  "AMAZON PAY": "amazonpay",
};

function Refund({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { orderId, shipmentId } = useParams();
  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const [isLoading, setIsLoading] = useState(true);
  const [customerPhone, setCustomerPhone] = useState(null);
  const [additionalData, setAdditionalData] = useState(null);
  const [isAdditionalLoading, setIsAdditionalLoading] = useState(false);
  const [exisitingBankRefundOptions, setExisingBankRefundOptions] = useState(
    []
  );
  const [showBeneficiaryPage, setShowBeneficiaryAdditionPage] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const sendOtpResponse = useRef(null);
  const [isValidOtp, setIsValidOtp] = useState(false);
  const [isBeneficiaryAdded, setIsBeneficiaryAdded] = useState(false);
  const [beneficiaryDetails, setBeneficiaryDetails] = useState(null);

  const { verifyIfscCode,addRefundBankAccountUsingOTP} =useRefundDetails(fpi);

  const [otpResendTime, setOtpResendTime] = useState(0);
  const resendTimerRef = useRef(null);
  const { showSnackbar } = useSnackbar();

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
      })
      .catch((error) => {
        if (error?.errors && error?.errors?.length) {
          showSnackbar(error?.errors[0].message, "error");
        }
      })
      .finally(() => {
        setIsAdditionalLoading(false);
      });
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
    fpi
      .executeGQL(VERIFY_OTP_FOR_REFUND_BANK_DETAILS, payload)
      .then(async ({ data, errors }) => {
        if (errors && errors?.length) {
          showSnackbar(errors[0].message, "error");
          return;
        }
        setIsValidOtp(!!data?.verifyOtpForRefundBankDetails?.success);
        // await getRefundDetails(orderId);
        //setting this to empty for now . Use these variables to list the already registered bank details 
        setShowBeneficiaryAdditionPage(true);
        setExisingBankRefundOptions([])
      })
      .catch((error) => { })
      .finally(() => { });
  };

  const handleBankFormSubmit = async (
    { ifscCode, accountNo, accounHolder },
    { verify_IFSC_code },
    { selectedBankCheck = false }
  ) => {
    //Section to map if the user is selecting from saved Banks
    if (selectedBank && selectedBankCheck) {
      (ifscCode = selectedBank.ifsc_code),
        (accountNo = selectedBank.account_no),
        (accounHolder = selectedBank.account_holder),
        await verifyIfscCode(selectedBank.ifsc_code).then((data) => {
          (verify_IFSC_code.bank_name = data.verify_IFSC_code.bank_name),
            (verify_IFSC_code.branch_name = data.verify_IFSC_code.branch_name);
        });
    }
    const beneficiaryDetails = {
      details: {
        ifsc_code: ifscCode || "",
        account_no: accountNo || "",
        account_holder: accounHolder || "",
        bank_name: verify_IFSC_code?.bank_name || "",
        branch_name: verify_IFSC_code?.branch_name || "",
        // email: "",
        // mobile: "",
        // address: "",
      },
      // delights: false,
      order_id: orderId,
      // transfer_mode: TRANSFER_MODE.BANK,
      // shipment_id: shipmentId,
      // request_id: sendOtpResponse.current.request_id,
    };
    addRefundBankAccountUsingOTP(beneficiaryDetails)
      .then((data) => {
        const isSuccess = data?.success;
        if (isSuccess) {
          setIsBeneficiaryAdded(isSuccess);
        }
        // handling validations with different errors
        if(!isSuccess){
          if(data?.msg){
            showSnackbar(data?.msg , "error");          
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
    const values = {
      shipmentId: shipmentId || "",
      orderId: orderId || "",
    };

    fpi
      .executeGQL(GET_SHIPMENT_CUSTOMER_DETAILS, values)
      .then((res) => {
        if (res?.data?.shipment) {
          const customerPhone = res?.data?.shipment?.customer_detail?.phone;
          setCustomerPhone(customerPhone);

          //If phone number exists, fetch additional data
          if (customerPhone) {
            fetchAdditionalData({
              orderId,
              shipmentId,
            });
          }
        }
      })
      .catch((error) => {
        console.error("GraphQL Error:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [shipmentId, orderId]);

  function maskAccountNumber(accNo) {
    if (!accNo) return "";
    const last4 = accNo.slice(-4);
    return "XXXXXXXX" + last4;
  }
  function maskIFSC(ifsc) {
    if (!ifsc) return "";
    const last3 = ifsc.slice(-3);
    return "XXXXXX" + last3;
  }

  if (!orderId || !shipmentId) {
    return <EmptyState title={t("resource.refund_order.invalid_refund_link")} showButton={false} />;
  }
  const handleSelectBank = (bankOption) => {
    setSelectedBank(bankOption);
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.container} ${isBeneficiaryAdded ? styles.beneficiaryContainer : ""}`}
      >
        {isBeneficiaryAdded ? (
          <BeneficiarySuccess
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
            <RefundDetails orderId={orderId} shipmentId={shipmentId} />
            {isValidOtp ? (
              showBeneficiaryPage ? (
                <BeneficiaryForm
                  fpi={fpi}
                  onSubmit={handleBankFormSubmit}
                  setShowBeneficiaryAdditionPage={
                    setShowBeneficiaryAdditionPage
                  }
                  exisitingBankRefundOptions={exisitingBankRefundOptions}
                />
              ) : (
                <div className={styles.outerContainer}>
                  <div className={styles.refundHeadertext}>
                      {t("resource.profile.select_refund_option")}
                  </div>
                  <div className={styles.mainContentSection}>
                    <div className={styles.contentHeader}>
                      {t("resource.refund_order.bank_account_transfer")}
                    </div>
                    <div className={styles.recentlyUsedSection}>
                      <div className={styles.recentlyUsedHeader}>
                        {t("resource.refund_order.recently_used")}
                      </div>
                      <div
                        className={styles.addBankAccount}
                        onClick={() => setShowBeneficiaryAdditionPage(true)}
                      >
                        {t("resource.refund_order.add_bank_account")}
                      </div>
                    </div>
                    <div className={styles.paymentContent}>
                      {exisitingBankRefundOptions?.map((bankOption) => {
                        const isSelected =
                          selectedBank?.beneficiary_id ===
                          bankOption.beneficiary_id;

                        return (
                          <div
                            key={bankOption.id}
                            className={styles.bankOptionItem}
                            onClick={() => handleSelectBank(bankOption)}
                          >
                            {/* Bank Details */}
                            <div className={styles.bankDetails}>
                              <div className={styles.bankdetailsHeader}>
                                <div className={styles.bankName}>
                                  {bankOption.bank_name || t("resource.refund_order.bank_account")}
                                </div>
                                <div className={styles.svgWrapper}>
                                  <BankVerifiedIcon />
                                </div>
                              </div>
                              <div className={styles.accountHolder}>
                                {bankOption.account_holder}
                              </div>
                              <div className={styles.accountNumber}>
                                <span className={styles.accountNoDiv}>
                                  {t("resource.refund_order.account_no")}:
                                </span>
                                <span className={styles.accountNoValue}>
                                  {maskAccountNumber(bankOption.account_no)}
                                </span>
                              </div>
                              <div className={styles.ifscCode}>
                                <span className={styles.ifscDiv}>
                                  {t("resource.common.ifsc_code")}:
                                </span>
                                <span className={styles.ifscCodeValue}>
                                  {maskIFSC(bankOption.ifsc_code)}
                                </span>
                              </div>
                            </div>
                            <div className={styles.walletLeft}>
                              <RadioIcon checked={isSelected} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={styles.submitButtonContent}>
                      {selectedBank && (
                        <button
                          className={`${styles.commonBtn} ${styles.btn} ${styles.modalBtn}`}
                          type="submit"
                          onClick={() => {
                            handleBankFormSubmit(
                              { formData: selectedBank },
                              { verify_IFSC_code: {} },
                              { selectedBankCheck: true }
                            );
                          }}
                        >
                          {t("resource.common.continue")}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            ) : (
              <OtpValidationForm
                otpResendTime={otpResendTime}
                onSubmit={handleOtpSubmit}
                onResendClick={handleOtpResend}
                customerPhone={customerPhone}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function BeneficiarySuccess({ orderId, shipmentId }) {
  return (
    <>
      <div className={styles.beneficiaryHeader}>
        <CheckmarkFilledIcon />
        <div className={styles.titleWrapper}>
          <h4>{t("resource.refund_order.beneficiary_added")}</h4>
          <div className={styles.info}>
            <span>{t("resource.refund_order.credit_time_message")}</span>
          </div>
        </div>
      </div>
      <RefundDetails orderId={orderId} shipmentId={shipmentId} />
      {/* <div className={styles.beneficiaryDetails}>
        <div className={styles.detailItem}>
          <h5 className={styles.beneficiaryDetailsTitle}>
            {t("resource.refund_order.beneficiary_details")}
          </h5>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.itemHeader}>{t("resource.refund_order.account_holders_name")}</span>
          <span className={styles.itemValue}>{beneficiaryDetails?.name}</span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.itemHeader}>{t("resource.refund_order.bank_account_no")}</span>
          <span className={styles.itemValue}>
            {beneficiaryDetails?.accountNumber}
          </span>
        </div>
        <div className={styles.detailItem}>
          <span className={styles.itemHeader}>{t("resource.common.ifsc_code")}</span>
          <span className={styles.itemValue}>
            {beneficiaryDetails?.ifscCode}
          </span>
        </div>
      </div> */}
    </>
  );
}

function RefundDetails({
  orderId = "ORDER_ID",
  shipmentId = "SHIPMENT_ID",
  refundAmount = 0,
}) {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.refundDetails}>
      <div className={styles.refundDetailsItem}>
        <span>{t("resource.refund_order.order_id")}</span>
        <span>{orderId}</span>
      </div>
      <div className={styles.refundDetailsItem}>
        <span>{t("resource.common.shipment_id")}</span>
        <span>{shipmentId}</span>
      </div>
      {/* <div className={styles.refundDetailsItem}>
        <span>Refund Amount</span>
        <span>{refundAmount}</span>
      </div> */}
    </div>
  );
}

function OtpValidationForm({
  otpResendTime,
  onSubmit,
  onResendClick,
  customerPhone,
}) {
  const {
    handleSubmit,
    register,
    formState: { isValid, errors },
  } = useForm();

  return (
    <div className={styles.refundOtp}>
      <div className={styles.refundOtpHead}>
        <h4>{t("resource.common.enter_otp")}</h4>
        <div>
        {t("resource.refund_order.otp_sent_to_phone")} {customerPhone || ""}
        </div>
      </div>
      <form className={styles.refundOtpForm} onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.refundFormFieldWrapper}>
          <Input
            type="text"
            label={t("resource.common.enter_otp")}
            labelVariant="floating"
            labelClassName={styles.otpInputLabel}
            showAsterik
            required
            inputMode="numeric"
            pattern="\d*"
            maxLength={4}
            onInput={(e) => {
              e.target.value = e.target.value
                .replace(/[^0-9]/g, "")
                .slice(0, 4);
            }}
            {...register("otp", {
              required: t("resource.refund_order.otp_is_required"),
              pattern: {
                value: /^[0-9]{4}$/, // Ensures only 4 digits are entered
                message: t("resource.refund_order.otp_must_be_4_digits"),
              },
            })}
            error={!!errors.otp}
            errorMessage={errors?.otp?.message || ""}
          />
          <button
                className={`${styles.formResendTimer} ${
                    otpResendTime === 0 ? styles.resendEnabled : ""
                }`}
                disabled={otpResendTime > 0}
                type="button"
                onClick={onResendClick}
                style={{ cursor: otpResendTime > 0 ? "default" : "pointer" }}
                >
                {otpResendTime > 0
                  ? t("resource.refund_order.resend_otp_in_seconds", { time: otpResendTime })
                  : t("resource.refund_order.resend_otp")}
            </button>
        </div>
        <Button
          className={styles.refundOtpSubmitBtn}
          variant="contained"
          size="large"
          color="primary"
          fullWidth={true}
          type="submit"
          disabled={!isValid}
        >
          {t("resource.refund_order.verify_caps")}
        </Button>
      </form>
    </div>
  );
}

function BeneficiaryForm({ fpi, onSubmit, setShowBeneficiaryAdditionPage, exisitingBankRefundOptions }) {
  const { t } = useGlobalTranslation("translation");
  return (
    <div className={styles.beneficiaryForm}>
      <h4 className={styles.beneficiaryFormTitle}>{t("resource.refund_order.enter_bank_details")}</h4>
      <BankForm fpi={fpi} addBankAccount={onSubmit} setShowBeneficiaryAdditionPage={setShowBeneficiaryAdditionPage} exisitingBankRefundOptions={exisitingBankRefundOptions} />
    </div>
  );
}

export default Refund;
