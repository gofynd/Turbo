import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  GET_REFUND_DETAILS,
  GET_ACTVE_REFUND_MODE,
  VERIFY_IFSC_CODE,
  ADD_BENEFICIARY_DETAILS,
  VERIFY_OTP_FOR_WALLET,
  VERIFY_OTP_FOR_BANK,
  ADD_REFUND_BANK_DETAILS,
} from "../../queries/refundQuery";

import { useSnackbar } from "../../helper/hooks";

const useRefundDetails = (fpi) => {
  const location = useLocation();
  const { showSnackbar } = useSnackbar();
  const [refundDetails, setRefundDetails] = useState({});
  const [activeRefundMode, setActiveRefundMode] = useState({});
  const [ifscDetails, setIfscDetails] = useState({});
  const [beneficiaryDetails, setBeneficiaryDetails] = useState({});

  function getRefundDetails(orderID) {
    try {
      const values = {
        orderId: orderID || "",
      };
      fpi.executeGQL(GET_REFUND_DETAILS, values).then((res) => {
        if (res?.data?.refund) {
          const data = res?.data?.refund;
          setRefundDetails(data);
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  function getActiveRefundMode(orderID) {
    try {
      const values = {
        orderId: orderID || "",
      };
      fpi.executeGQL(GET_ACTVE_REFUND_MODE, values).then((res) => {
        if (res?.data?.refund) {
          const data = res?.data?.refund;
          setActiveRefundMode(data);
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  function verifyIfscCode(ifscCode) {
    try {
      const values = {
        ifscCode: ifscCode || "",
      };

      return fpi.executeGQL(VERIFY_IFSC_CODE, values).then((res) => {
        let data = {};

        if (res?.errors?.[0]) {
          data = res?.errors?.[0];
        } else if (res?.data?.payment) {
          data = res?.data?.payment;
          setIfscDetails(data);
        }

        return data;
      });
    } catch (error) {
      if (error?.errors && error.errors.length) {
        showSnackbar(error.errors[0].message, "error");
        return;
      }
    }
  }

  function addBeneficiaryDetails(details) {
    try {
      const values = {
        addBeneficiaryDetailsRequestInput: details,
      };
      return fpi.executeGQL(ADD_BENEFICIARY_DETAILS, values).then((res) => {
        if (res?.data?.addBeneficiaryDetails) {
          const data = res?.data?.addBeneficiaryDetails;
          setBeneficiaryDetails(data);
          return data;
        }

        return res;
      });
    } catch (error) {
      console.log({ error });
    }
  }

  function addRefundBankAccountUsingOTP(details) {
    try {
      const values = {
        addBeneficiaryDetailsOTPRequestInput: details,
      };
      return fpi.executeGQL(ADD_REFUND_BANK_DETAILS, values).then((res) => {
      if (res.errors && res.errors.length > 0) {
        const errorDetails = res.errors[0]?.details || {};
        const errorMessage = 
          errorDetails.description || 
          res.errors[0]?.message || 
          "An unexpected error occurred";
        
        showSnackbar(errorMessage, "error");
        return { 
          success: false, 
          msg: errorMessage 
        };
      }

        if (res?.data?.addRefundBankAccountUsingOTP?.success) {
          const data = { success: true };
          setBeneficiaryDetails(data);
          return data;
        }
        return res;
      });
    } catch (error) {
      if (error?.errors && error.errors.length) {
        showSnackbar(error.errors[0].message, "error");
        return;
      }
    }
  }

  function verifyOtpForWallet(details) {
    try {
      const values = {
        WalletOtpRequestInput: details,
      };
      return fpi.executeGQL(VERIFY_OTP_FOR_WALLET, values).then((res) => {
        if (res?.data?.verifyOtpAndAddBeneficiaryForWallet) {
          const data = res?.data?.verifyOtpAndAddBeneficiaryForWallet;
          return data;
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  function verifyOtpForBank(details) {
    try {
      const values = {
        addBeneficiaryViaOtpVerificationRequestInput: details,
      };
      return fpi.executeGQL(VERIFY_OTP_FOR_BANK, values).then((res) => {
        if (res?.data?.verifyOtpAndAddBeneficiaryForBank) {
          const data = res?.data?.verifyOtpAndAddBeneficiaryForBank;
          return data;
        }
      });
    } catch (error) {
      console.log({ error });
    }
  }

  return {
    refundDetails,
    activeRefundMode,
    ifscDetails,
    beneficiaryDetails,
    getRefundDetails,
    getActiveRefundMode,
    verifyIfscCode,
    addBeneficiaryDetails,
    addRefundBankAccountUsingOTP,
    verifyOtpForWallet,
    verifyOtpForBank,
  };
};

export default useRefundDetails;
