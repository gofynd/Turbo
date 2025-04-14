import React, { useState, useEffect, useMemo } from "react";
import { useGlobalStore } from "fdk-core/utils";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./styles/add-payment.less";
import Modal from "../core/modal/modal";
import useRefundDetails from "../../page-layouts/orders/useRefundDetails";
import PaymentList from "./payment-list";
import OtpForm from "../refund/otp-form";
import BankForm from "../refund/bank-form";
import UpiForm from "../refund/upi-form";
import WalletForm from "../refund/wallet-form";
import { useSnackbar } from "../../helper/hooks";
import CrossIcon from "../../assets/images/cross-black.svg";

function AddPayment({ shipment, fpi, getBeneficiaryDetails }) {
  const [showAddPayments, setShowAddPayments] = useState(false);
  const [showError, setShowError] = useState(false);
  const [loadSpinner, setLoadSpinner] = useState(false);
  const [showSendOtpText, setShowSendOtpText] = useState(false);
  const [showBack, setShowBack] = useState(false);
  const [verifiedPayment, setVerifiedPayment] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentsList, setPaymentsList] = useState(null);
  const [otpPayload, setOtpPayload] = useState(null);
  const [pageState, setPageState] = useState(1);
  const [bankitem, setBankitem] = useState({});
  const { showSnackbar } = useSnackbar();
  const userData = useGlobalStore(fpi.getters.USER_DATA);
  const userInfo = useMemo(() => userData?.user || userData, [userData]);

  const {
    activeRefundMode,
    beneficiaryDetails,
    getActiveRefundMode,
    addBeneficiaryDetails,
    verifyOtpForBank,
  } = useRefundDetails(fpi);
  const TRANSFER_MODE = {
    BANK: "bank",
    VPA: "vpa",
    PAYTM: "paytm",
    "AMAZON PAY": "amazonpay",
  };
  useEffect(() => {
    if (shipment?.order_id) {
      getActiveRefundMode(shipment?.order_id);
    }
    return () => {};
  }, [shipment?.order_id]);

  useEffect(() => {
      if (typeof document !== "undefined" && document.body) {
        if (showAddPayments) {
          document.body.classList.add("remove-scroll");
        } else {
          document.body.classList.remove("remove-scroll");
        }
      }
      return () => {
        document.body.classList.remove("remove-scroll");
      };
    }, [showAddPayments]);


  const onClose = () => {
    setPageState(1);
    setShowAddPayments(false);
    setSelectedPayment(null);
  };
  const getModalTitle = () => {
    if (!selectedPayment) {
      return "Add Refund Account";
    }

    const paymentLabel = selectedPayment
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");

    return `Add ${paymentLabel}`;
  };
  const getoption = (event) => {
    setPageState(2);
    setSelectedPayment(event);
    setShowBack(true);
  };
  const verifyPayment = (formdata) => {
    const data = {
      otp: formdata?.otp || "",
      ...otpPayload,
    };
    verifyOtpForBank(data)
      .then((data) => {
        onClose();
        showSnackbar("New payment added successfully", "success");
        setVerifiedPayment(true);
      })
      .catch((err) => {
        const errMsg = err.response || "Something went wrong";
        showSnackbar(errMsg, "error");
      })
      .finally(() => {});
  };
  const addVPA = (formdata) => {
    const data = {
      vpa: formdata.upi,
      email: "",
      mobile: "",
      address: "",
      transfer_mode: TRANSFER_MODE.VPA,
      account_holder: `${userInfo?.first_name} ${userInfo?.last_name}`,
    };
    addPayment(data);
  };
  const addWalletAccount = (formdata, request_details) => {
    let mode = "";
    if (selectedPayment === "PAYTM") mode = TRANSFER_MODE.PAYTM;
    if (selectedPayment === "AMAZON PAY") mode = TRANSFER_MODE["AMAZON PAY"];
    const data = {
      wallet: formdata.phone || "",
      otp: Number(formdata.otp) || "",
      email: "",
      mobile: "",
      address: "",
      request_id: request_details,
      transfer_mode: mode,
      account_holder: `${userInfo?.first_name} ${userInfo?.last_name}`,
    };
    addPayment(data);
  };
  const addBankAccount = (formdata, bank_details) => {
    const data = {
      details: {
        ifsc_code: formdata.ifscCode || "",
        account_no: formdata.accountNo || "",
        account_holder: formdata.accounHolder || "",
        bank_name: bank_details?.verifyIFSCCode?.bank_name || "",
        branch_name: bank_details?.verifyIFSCCode?.branch_name || "",
        email: "",
        mobile: "",
        address: "",
      },
      delights: false,
      order_id: shipment.order_id,
      transfer_mode: TRANSFER_MODE.BANK,
      shipment_id: shipment.shipment_id,
    };
    addPayment(data);
  };
  const addPayment = (data) => {
    setLoadSpinner(true);
    data.delights = false;
    addBeneficiaryDetails(data)
      .then((data) => {
        if (data.success) {
          setLoadSpinner(false);
          if (data.is_verified_flag) {
            setVerifiedPayment(true);
            setPageState(1);
            onClose();
            showSnackbar("New payment added successfully", "success");
            getBeneficiaryDetails();
            return;
          }
          setVerifiedPayment(false);
          setOtpPayload({
            hash_key: data.data.hash_key,
            request_id: data.data.request_id,
          });
          setPageState(3);
        } else {
          const errMsg = data?.errors?.[0]?.message || "Something went wrong";
          showSnackbar(errMsg, "error");
          setLoadSpinner(false);
        }
      })
      .catch((err) => {
        const errMsg = err.response || "Something went wrong";
        showSnackbar(errMsg, "error");
        setLoadSpinner(false);
      })
      .finally(() => {
        setLoadSpinner(false);
      });
  };
  return (
    <div>
      <div
        className={`${styles.addPayment}`}
        onClick={() => setShowAddPayments(true)}
      >
        <p
          className={`${styles.paymentTitle} ${styles.boldxs} ${styles.uktLinks}`}
        >
          Add Refund Account
        </p>
      </div>
      {showAddPayments && (
        <OutsideClickHandler onOutsideClick={() => setShowAddPayments(false)}>
          <Modal isOpen={showAddPayments}>
            <div className={`${styles.modalContainer}`}>
              <div className={`${styles.modalHeader}`}>
                <div className={`${styles.header}`}>{getModalTitle()}</div>
                <div onClick={onClose} className={`${styles.closeCross}`}>
                  <CrossIcon />
                </div>
              </div>
              <div className={`${styles.body}`}>
                {!showError && (
                  <div className={`${styles.paymentModal}`}>
                    {!selectedPayment && pageState === 1 && (
                      <PaymentList
                        payments={
                          activeRefundMode?.active_refund_transfer_modes?.data
                        }
                        selectpayment={getoption}
                      ></PaymentList>
                    )}
                    {!verifiedPayment && pageState === 3 && (
                      <OtpForm
                        loadSpinner={loadSpinner}
                        verifyPayment={verifyPayment}
                      ></OtpForm>
                    )}
                    {selectedPayment === "BANK" && pageState === 2 && (
                      <BankForm
                        fpi={fpi}
                        loadSpinner={loadSpinner}
                        addBankAccount={addBankAccount}
                        footerClassName={styles.bankFormFooter}
                      ></BankForm>
                    )}
                    {selectedPayment === "UPI" && pageState === 2 && (
                      <UpiForm
                        loadSpinner={loadSpinner}
                        addVPA={addVPA}
                      ></UpiForm>
                    )}
                    {((selectedPayment === "PAYTM" && pageState === 2) ||
                      (selectedPayment === "AMAZON PAY" &&
                        pageState === 2)) && (
                      <WalletForm
                        fpi={fpi}
                        loadSpinner={loadSpinner}
                        addWalletAccount={addWalletAccount}
                      ></WalletForm>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Modal>
        </OutsideClickHandler>
      )}
    </div>
  );
}

export default AddPayment;
