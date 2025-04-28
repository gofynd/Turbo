import { useState, useEffect } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";

import {
  PAYMENT_AGG,
  SELECT_PAYMENT_MODE,
  VALID_UPI,
} from "../../../queries/checkoutQuery";
import { numberWithCommas } from "../../../helper/utils";
import {
  RESEND_OR_CANCEL_PAYMENT,
  CHECK_AND_UPDATE_PAYMENT_STATUS,
  CARD_DETAILS,
} from "../../../queries/paymentQuery";
import Loader from "../../../components/loader/loader";

import { CART_DETAILS, VALIDATE_COUPON } from "../../../queries/cartQuery";
import { useSnackbar } from "../../../helper/hooks";

const usePayment = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const paymentOption = useGlobalStore(fpi?.getters?.PAYMENT_OPTIONS);
  const paymentConfig = useGlobalStore(fpi?.getters?.AGGREGATORS_CONFIG);
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS);
  const loggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const [selectedTab, setSelectedTab] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isQrCodeLoading, setIsQrCodeLoading] = useState(false);
  const [isUPIError, setUPIError] = useState(false);
  const [showUpiRedirectionModal, setShowUpiRedirectionModal] = useState(false);

  const [searchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  const address_id = searchParams.get("address_id");
  const disbaleCheckout = useGlobalStore(fpi?.getters?.SHIPMENTS);
  const [errorMessage, setErrorMessage] = useState("");
  const { showSnackbar } = useSnackbar();

  const handleIsQrCodeLoading = (value) => {
    setIsQrCodeLoading(value);
  };

  const PAYMENT_OPTIONS_SVG = {
    CARD: "card-payment",
    WL: "wallet",
    UPI: "upi",
    NB: "nb",
    CARDLESS_EMI: "emi",
    PL: "pay-later",
    COD: "cod",
  };
  const PAYMENT_OPTIONS_ICON = {
    CARD: require("../../../assets/images/card-payment-icon.png"),
    WL: require("../../../assets/images/wallet-icon.png"),
    UPI: require("../../../assets/images/upi-icon.png"),
    NB: require("../../../assets/images/nb-icon.png"),
    CARDLESS_EMI: require("../../../assets/images/emi-icon.png"),
    PL: require("../../../assets/images/pay-later-icon.png"),
  };

  const selectPaymentMode = async (payload) => {
    await fpi.executeGQL(SELECT_PAYMENT_MODE, {
      id: cart_id,
      buyNow,
      updateCartPaymentRequestInput: payload,
    });

    const cartPayload = {
      buyNow,
      includeAllItems: true,
      includeBreakup: true,
      includeCodCharges: true,
    };
    await fpi?.executeGQL?.(CART_DETAILS, cartPayload);
  };

  useEffect(() => {
    fpi.executeGQL(PAYMENT_AGG);
  }, [fpi]);

  const getCurrencySymbol = (() => bagData?.currency?.symbol || "₹")();

  function getQueryParams() {
    const queryParams = {};
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
    return queryParams;
  }

  const selectedTabData = paymentOption?.payment_option?.find(
    (optn) => optn.name === selectedTab
  );

  const selectedUPIData = paymentOption?.payment_option?.filter(
    (optn) => optn.name === "UPI"
  )[0]?.list[0];
  const selectedQrData = paymentOption?.payment_option?.filter(
    (optn) => optn.name === "QR"
  )[0]?.list[0];

  const selectedNewCardData = paymentOption?.payment_option?.find(
    (optn) => optn.name === "CARD"
  );

  const getUPIIntentApps = async () => {
    const upiIntentPayload = {
      payment: { ...selectedUPIData },
      paymentflow: paymentOption?.aggregator_details?.find(
        (item) => item.aggregator_key === selectedUPIData?.aggregator_name
      ),
      aggregator_name: selectedUPIData?.aggregator_name,
      queryParams: getQueryParams(),
    };
    try {
      const res = await fpi.payment.getSupportedUpiIntentApps(upiIntentPayload);
      return res.payload;
    } catch (err) {
      console.log(err);
    }
  };

  const validateCardDetails = async (parentEl, element, callback) => {
    const cardPayload = {
      payment: { ...selectedNewCardData },
      paymentflow: paymentOption?.aggregator_details?.find(
        (item) => item.aggregator_key === selectedNewCardData?.aggregator_name
      ),
      inputType: "number",
      aggregator_name: selectedNewCardData?.aggregator_name,
      options: {
        parentEl,
        element,
      },
      callback,
    };
    try {
      await fpi.payment.validateCardDetails(cardPayload);
    } catch (err) {
      console.log(err);
    }
  };

  const cardDetails = async (cardNumber) => {
    const res = await fpi.executeGQL(CARD_DETAILS, {
      cardInfo: cardNumber,
      aggregator: selectedNewCardData.aggregator_name,
    });
    return res;
  };

  const validateCoupon = async (payload) => {
    const res = await fpi.executeGQL(VALIDATE_COUPON, payload);
    return res;
  };

  function addParamsToLocation(params) {
    // Get the current URL
    const currentUrl = window?.location?.href;
    // Remove the query parameters
    const urlWithoutQueryParams = currentUrl.split("?")[0];
    window?.history.pushState(
      {},
      null,
      `${urlWithoutQueryParams}?${Object.keys(params)
        .map(
          (key) =>
            `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`
        )
        .join("&")}`
    );
  }

  function orderBy(collection, iterates, orders) {
    if (!Array.isArray(collection) || collection.length === 0) {
      return [];
    }
    return [...collection].sort((a, b) => {
      for (let i = 0; i < iterates.length; i += 1) {
        const iteratee = iterates[i];
        const order = orders && orders[i] === "desc" ? -1 : 1;

        const aValue =
          typeof iteratee === "function" ? iteratee(a) : a?.[iteratee];
        const bValue =
          typeof iteratee === "function" ? iteratee(b) : b?.[iteratee];

        if (aValue < bValue) {
          return -1 * order;
        }
        if (aValue > bValue) {
          return 1 * order;
        }
      }

      return 0;
    });
  }

  const proceedToPay = async (mode, paymentPayload = {}) => {
    const {
      selectedCard,
      selectedCardCvv,
      selectedCardData,
      isCardSecure,
      selectedCardless,
      selectedPayLater,
      selectedWallet,
      selectedNB,
      vpa,
      selectedOtherPayment,
      selectedUpiIntentApp,
      upiSaveForLaterChecked,
    } = paymentPayload;

    const hasValidPayment = [
      selectedCardless,
      selectedPayLater,
      selectedWallet,
      selectedNB,
      vpa,
      selectedOtherPayment,
      selectedUpiIntentApp,
      upiSaveForLaterChecked,
      selectedCard,
      selectedCardData,
    ].some((method) => method && Object.keys(method).length > 0);
    if (!hasValidPayment && mode !== "QR" && mode !== "COD") {
      showSnackbar(t("resource.common.select_payment_option"), "error");
      return;
    }

    if (disbaleCheckout?.message) {
      return;
    }
    // Implement the logic to proceed with the payment
    if (mode === "newCARD") {
      // if (!isCardSecure) {
      //     openRbiGuidelineDialog = true;
      //     return;
      // }
      setIsLoading(true);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedNewCardData?.aggregator_name,
        payment_mode: "CARD",
      });
      const payload = {
        payment_mode: "CARD",
        id: cart_id,
        address_id,
      };
      const { id, is_redirection, ...options } = payload;
      const res = await fpi.payment.checkoutPayment({
        ...options,
        aggregator_name: selectedNewCardData.aggregator_name,
        payment: {
          ...selectedNewCardData,
          ...selectedCardData,
          is_card_secure: isCardSecure,
        },
        address_id,
        billing_address_id: address_id,
        paymentflow: paymentOption?.aggregator_details?.find(
          (item) => item.aggregator_key === selectedNewCardData?.aggregator_name
        ),
        buy_now: buyNow,
      });
      if (res?.meta?.requestStatus === "rejected") {
        setIsLoading(false);
        return res?.payload;
      }
    } else if (mode === "CARD") {
      if (
        !selectedCard.compliant_with_tokenisation_guidelines
        //  &&!isSavedCardSecure
      ) {
        // openRbiGuidelineDialog = true;
        // return;
      }
      const payload = {
        payment_mode: "CARD",
        id: cart_id,
        address_id,
      };

      setIsLoading(true);
      // const confirmedPayment = fpi.payment.confirmPayment(payload);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedCard?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCard.card_id,
        card_reference: selectedCard.card_reference,
      });
      const { id, is_redirection, ...options } = payload;
      const res = await fpi.payment.checkoutPayment({
        ...options,
        aggregator_name: selectedCard.aggregator_name,
        payment_identifier: selectedCard.card_id,
        payment: {
          ...selectedCard,
          card_security_code: selectedCardCvv,
          is_card_secure: selectedCard.compliant_with_tokenisation_guidelines,

          // : isSavedCardSecure,
        },
        address_id,
        billing_address_id: address_id,
        paymentflow: paymentOption?.aggregator_details?.find(
          (item) => item.aggregator_key === selectedCard?.aggregator_name
        ),
        buy_now: buyNow,
      });
      if (res?.meta?.requestStatus === "rejected") {
        setIsLoading(false);
        return res?.payload;
      }
    } else if (mode === "WL") {
      const payload = {
        payment_mode: "WL",
        id: cart_id,
        address_id,
      };
      setIsLoading(true);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedWallet?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedWallet.code,
        merchant_code: selectedWallet.merchant_code,
      });
      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          aggregator_name: selectedWallet?.aggregator_name,
          payment_identifier: selectedWallet.code,
          merchant_code: selectedWallet.merchant_code,
          payment: selectedWallet,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedWallet?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    } else if (mode === "UPI") {
      const payload = {
        aggregator_name: selectedUPIData?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedUPIData.code,
        merchant_code: selectedUPIData.merchant_code,
        id: cart_id,
      };
      try {
        if (selectedUpiIntentApp && selectedUpiIntentApp !== "any") {
          setShowUpiRedirectionModal(true);
        }

        // Uncomment and use this block if VALID_UPI validation is required
        if (vpa) {
          const res = await fpi.executeGQL(VALID_UPI, {
            validateVPARequestInput: {
              upi_vpa: vpa,
              aggregator: selectedUPIData?.aggregator_name,
            },
          });
          if (
            // !res?.data?.validateVPA?.success &&
            !res?.data?.validateVPA?.data?.is_valid
          ) {
            setUPIError(true);
            setIsLoading(false);
            return { isUPIError: true };
          }
        }
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedUPIData?.aggregator_name,
          payment_mode: mode,
          payment_identifier: vpa,
          merchant_code: selectedUPIData.merchant_code,
        });
        const { id, is_redirection, ...options } = payload;
        const finalres = await fpi.payment.checkoutPayment({
          ...options,
          upi_app: selectedUpiIntentApp,
          payment_identifier: vpa,
          payment_extra_identifiers: {
            consent: upiSaveForLaterChecked,
          },
          payment: {
            ...selectedUPIData,
            upi: vpa,
          },
          address_id,
          billing_address_id: address_id,
          aggregator_name: selectedUPIData.aggregator_name,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedUPIData?.aggregator_name
          ),
          buy_now: buyNow,
        });
        if (finalres?.meta?.requestStatus === "rejected") {
          setShowUpiRedirectionModal(false);
          setIsLoading(false);
          return finalres?.payload;
        }
        setIsLoading(false);
        return {
          ...finalres,
          aggregator_name: selectedUPIData?.aggregator_name,
        };
      } catch (error) {
        console.error("Error during UPI payment process:", error);
      }
    } else if (mode === "QR") {
      const payload = {
        payment_mode: "QR",
        id: cart_id,
        address_id,
      };
      setIsQrCodeLoading(true);
      try {
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedQrData?.aggregator_name,
          payment_mode: mode,
          payment_identifier: selectedQrData.code,
          merchant_code: selectedQrData.merchant_code,
        });
        const { id, is_redirection, ...options } = payload;
        const res = await fpi.payment.checkoutPayment({
          ...options,
          aggregator_name: selectedQrData.aggregator_name,
          payment_identifier: selectedQrData.code,
          merchant_code: selectedQrData.merchant_code,
          payment_mode: mode,
          payment: {
            ...selectedQrData,
          },
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedQrData?.aggregator_name
          ),
          buy_now: buyNow,
        });
        if (res?.meta?.requestStatus === "rejected") {
          return res?.payload;
        }
        return res;
      } catch (err) {
        setIsQrCodeLoading(false);
      }
    } else if (mode === "NB") {
      const payload = {
        payment_mode: "NB",
        id: cart_id,
        address_id,
      };
      setIsLoading(true);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedNB?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedNB.code,
        merchant_code: selectedNB.merchant_code,
      });
      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          aggregator_name: selectedNB?.aggregator_name,
          payment_identifier: selectedNB.code,
          merchant_code: selectedNB.merchant_code,
          queryParams: getQueryParams(),
          payment: selectedNB,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === options?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    } else if (mode === "COD") {
      const payload = {
        payment_mode: "COD",
        id: cart_id,
        address_id,
      };
      setIsLoading(true);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedTabData?.aggregator_name,
        payment_mode: mode,
        payment_identifier: `${selectedTabData?.payment_mode_id}`,
      });
      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          aggregator_name: selectedTabData?.aggregator_name,
          queryParams: getQueryParams(),
          payment: selectedTabData,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedTabData?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    } else if (mode === "PL") {
      const payload = {
        payment_mode: "PL",
        id: cart_id,
        address_id,
      };
      setIsLoading(true);
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedPayLater?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedPayLater.code,
        merchant_code: selectedPayLater.merchant_code,
      });
      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          aggregator_name: selectedPayLater?.aggregator_name,
          payment_identifier: selectedPayLater.code,
          merchant_code: selectedPayLater.merchant_code,
          queryParams: getQueryParams(),
          payment: selectedPayLater,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedPayLater?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    } else if (mode === "CARDLESS_EMI") {
      const payload = {
        payment_mode: "CARDLESS_EMI",
        id: cart_id,
        address_id,
      };
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedCardless?.aggregator_name,
        payment_mode: mode,
        payment_identifier: selectedCardless.code,
        merchant_code: selectedCardless.merchant_code,
      });
      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          queryParams: getQueryParams(),
          ...options,
          aggregator_name: selectedCardless?.aggregator_name,
          payment_identifier: selectedCardless.code,
          merchant_code: selectedCardless.merchant_code,
          payment: selectedCardless,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) => item.aggregator_key === selectedCardless?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    } else if (mode === "Other") {
      setIsLoading(true);
      const payload = {
        aggregator_name: selectedOtherPayment.aggregator_name,
        payment_mode: selectedOtherPayment.code,
        payment_identifier: selectedOtherPayment.code,
        merchant_code: selectedOtherPayment.merchant_code,
        id: cart_id,
      };
      addParamsToLocation({
        ...getQueryParams(),
        aggregator_name: selectedOtherPayment?.aggregator_name,
        payment_mode: selectedOtherPayment.code,
        payment_identifier: selectedOtherPayment.code,
        merchant_code: selectedOtherPayment.merchant_code,
      });

      const { id, is_redirection, ...options } = payload;
      fpi.payment
        .checkoutPayment({
          ...options,
          aggregator_name: selectedOtherPayment?.aggregator_name,
          payment_identifier: selectedOtherPayment.code,
          merchant_code: selectedOtherPayment.code,
          payment: selectedOtherPayment,
          address_id,
          billing_address_id: address_id,
          paymentflow: paymentOption?.aggregator_details?.find(
            (item) =>
              item.aggregator_key === selectedOtherPayment?.aggregator_name
          ),
          buy_now: buyNow,
        })
        .then((res) => {
          if (res?.error?.message) {
            console.log(
              res,
              "response while calling fpi.payment.checkoutPayment"
            );
            setIsLoading(false);
            setErrorMessage(res?.payload?.message);
          }
        });
    }
  };

  const checkAndUpdatePaymentStatus = async (payload) => {
    return fpi.executeGQL(CHECK_AND_UPDATE_PAYMENT_STATUS, {
      paymentStatusUpdateRequestInput: payload,
    });
  };

  const cancelPayment = async (payload) => {
    return fpi.executeGQL(RESEND_OR_CANCEL_PAYMENT, {
      resendOrCancelPaymentRequestInput: payload,
    });
  };

  const getTotalValue = () => {
    // Implement the logic to calculate the total value

    const totalObj = bagData?.breakup_values?.display?.find(
      (item) => item.key === "total"
    );
    return totalObj?.value;
  };

  const PaymentOptionsList = () => {
    const tempOpt = [];
    let orderedOptions = orderBy(
      paymentOption?.payment_option,
      "display_priority",
      "asc"
    );
    orderedOptions = orderedOptions.filter((opt) => opt.flow === "custom");
    orderedOptions = orderedOptions.filter(
      (opt) => !opt.list?.[0]?.partial_payment_allowed
    );
    orderedOptions = orderedOptions.filter((opt) => opt.name !== "QR");
    orderedOptions?.forEach((optn) => {
      const data = PAYMENT_OPTIONS_SVG[optn.name];
      const subMopIcons = [];
      if (optn?.name === "CARD") {
        optn?.supported_methods?.slice(0, 3)?.forEach((opt) => {
          subMopIcons.push(opt?.logo);
        });
      }

      optn?.list?.slice(0, 3)?.forEach((opt) => {
        if (opt.name !== "UPI") {
          subMopIcons.push(opt?.logo_url?.small);
        }
      });
      const paymentIcon = PAYMENT_OPTIONS_ICON[optn.name];
      tempOpt.push({
        display_name: optn.display_name,
        svg: data ?? "payment-other",
        image_src: paymentIcon ?? null,
        subMopIcons,
        name: optn.name,
      });
    });

    return tempOpt;
  };

  function otherOptions() {
    let optn = paymentOption?.payment_option?.filter((opt) => {
      return (
        opt.name !== "CARD" &&
        opt.name !== "WL" &&
        opt.name !== "UPI" &&
        opt.name !== "NB" &&
        opt.name !== "CARDLESS_EMI" &&
        opt.name !== "PL" &&
        opt.name !== "COD"
      );
    });
    optn = optn?.filter?.((opt) => !opt.list?.[0]?.partial_payment_allowed);
    optn = optn?.filter?.((opt) => opt.flow === "standard");
    return optn?.length > 0 ? optn : [];
  }

  return {
    selectedTab,
    getCurrencySymbol,
    selectedTabData,
    paymentConfig,
    paymentOption,
    isLoading,
    isQrCodeLoading,
    handleIsQrCodeLoading,
    showUpiRedirectionModal,
    loggedIn,
    proceedToPay,
    getTotalValue,
    PaymentOptionsList,
    setSelectedTab,
    getUPIIntentApps,
    cardDetails,
    checkAndUpdatePaymentStatus,
    cancelPayment,
    isUPIError,
    setUPIError,
    Loader,
    otherOptions,
    validateCoupon,
    selectPaymentMode,
    validateCardDetails,
    setShowUpiRedirectionModal,
    errorMessage,
    setErrorMessage,
    setIsLoading,
  };
};

export default usePayment;
