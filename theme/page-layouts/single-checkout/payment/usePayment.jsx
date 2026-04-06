import { useState, useEffect, useMemo } from "react";
import {
  useGlobalStore,
  useGlobalTranslation,
  useNavigate,
} from "fdk-core/utils";
import { useSearchParams, useParams } from "react-router-dom";
import {
  CREDIT_NOTE_BALANCE,
  PAYMENT_AGG,
  PAYMENT_OPTIONS,
  SELECT_PAYMENT_MODE,
  UPDATE_CART_BREAKUP,
  VALID_UPI,
} from "../../../queries/checkoutQuery";
import { numberWithCommas, isRunningOnClient } from "../../../helper/utils";
import {
  RESEND_OR_CANCEL_PAYMENT,
  CHECK_AND_UPDATE_PAYMENT_STATUS,
  CARD_DETAILS,
} from "../../../queries/paymentQuery";
import Loader from "../../../components/loader/loader";
import {
  LINK_PAYMENT_OPTIONS,
  CREATE_ORDER_PAYMENT_LINK,
  CREATE_PAYMENT_LINK,
} from "../../../queries/paymentLinkQuery";

import { CART_DETAILS, VALIDATE_COUPON } from "../../../queries/cartQuery";
import { fetchCartDetails } from "../../cart/useCart";
import { useSnackbar } from "../../../helper/hooks";
import { REMOVE_COUPON } from "../../../queries/cartQuery";

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
  const [partialPaymentOption, setPartialPaymentOption] = useState(undefined);
  const [breakUpValues, setBreakupValues] = useState([]);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isCreditNoteApplied, setIsCreditNoteApplied] = useState(false);
  const cart = useGlobalStore(fpi.getters.CART) || {};

  const { user_id = "" } = useGlobalStore(fpi.getters.USER_DATA) || {};

  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const cart_id = searchParams.get("id");
  const billing_address_id = searchParams.get("billing_address_id");
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  const address_id = searchParams.get("address_id");

  const disbaleCheckout = useGlobalStore(fpi?.getters?.SHIPMENTS);
  const customValue = useGlobalStore(fpi?.getters?.CUSTOM_VALUE) || {};
  const { shared_cart_staff_data = null } = customValue;
  const { currentStep = null } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  // Restore staff data from sessionStorage on mount if not already in store
  useEffect(() => {
    if (
      isRunningOnClient() &&
      !shared_cart_staff_data &&
      fpi?.custom?.setValue
    ) {
      try {
        const storedData = sessionStorage.getItem("shared_cart_staff_data");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          // Only restore if we have valid data
          if (
            parsedData &&
            (parsedData.ordering_store || parsedData.selected_staff)
          ) {
            fpi.custom.setValue("shared_cart_staff_data", parsedData);
          }
        }
      } catch (error) {
        // Silently fail if sessionStorage is unavailable or data is corrupted
      }
    }
  }, [fpi, shared_cart_staff_data]);

  // Helper function to build staff data payload (only includes if data exists and is valid)
  const getStaffPayload = () => {
    if (!shared_cart_staff_data) {
      return {};
    }

    const payload = {};

    // Only include ordering_store if it's a valid string/number
    if (
      shared_cart_staff_data.ordering_store !== null &&
      shared_cart_staff_data.ordering_store !== undefined &&
      shared_cart_staff_data.ordering_store !== ""
    ) {
      payload.ordering_store = shared_cart_staff_data.ordering_store;
    }

    // Only include staff if selected_staff is valid
    if (
      shared_cart_staff_data.selected_staff !== null &&
      shared_cart_staff_data.selected_staff !== undefined &&
      shared_cart_staff_data.selected_staff !== ""
    ) {
      payload.staff = {
        _id: shared_cart_staff_data?.selected_staff,
        employee_code: shared_cart_staff_data?.employee_code || "",
        first_name: shared_cart_staff_data?.first_name || "",
        last_name: shared_cart_staff_data?.last_name || "",
        user: shared_cart_staff_data?.user || "",
      };
    }

    return payload;
  };

  const [errorMessage, setErrorMessage] = useState("");
  const [linkPaymentOptions, setLinkPaymentOptions] = useState([]);
  const [linkDataOption, setLinkDataOption] = useState([]);
  const [enableLinkPaymentOption, setEnableLinkPaymentOption] = useState(false);
  const [paymentLinkData, setPaymentLinkData] = useState([]);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const [creditUpdating, setCreditUpdating] = useState(false);
  const [callOnce, setCallOnce] = useState(false);
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { isCouponValid = true } = useGlobalStore(fpi.getters.CUSTOM_VALUE);
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
    const response = await fpi.executeGQL(SELECT_PAYMENT_MODE, {
      id: cart_id,
      buyNow,
      updateCartPaymentRequestInput: payload,
      buyNow,
    });
    const [mrpTotal, subTotal, storeCredit, total] =
      response.data.selectPaymentMode.breakup_values.display;
    setBreakupValues([mrpTotal, subTotal, storeCredit, total]);
    if (!isCouponValid) {
      await fpi.executeGQL(REMOVE_COUPON, {
        buyNow: buyNow,
        removeCouponId: bagData?.breakup_values?.coupon?.uid?.toString(),
      });
    }
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

  const getLinkOrderDetails = async () => {
    try {
      setIsApiLoading(true);
      const OrderRes = await fpi.executeGQL(CREATE_PAYMENT_LINK, {
        paymentLinkId: id,
      });
      setPaymentLinkData(OrderRes?.data?.paymentLinkDetail?.payment_link);
    } catch (error) {
      console.log(error, "error in getLinkOrderDetails");
    } finally {
      setIsApiLoading(false);
    }
  };

  const linkPaymentModeOptions = async () => {
    try {
      setIsLoading(true);
      setEnableLinkPaymentOption(true);
      const res = await fpi.executeGQL(LINK_PAYMENT_OPTIONS, {
        paymentLinkId: id,
      });
      setLinkPaymentOptions(
        res?.data?.payment?.payment_mode_routes_payment_link?.payment_options
          ?.payment_option
      );
      setLinkDataOption(
        res?.data?.payment?.payment_mode_routes_payment_link?.payment_options
      );
    } catch (error) {
      console.log(error, "error");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (linkPaymentOptions?.length > 0) {
      setSelectedTab(linkPaymentOptions[0]?.name);
    }
  }, [linkPaymentOptions]);

  const getCurrencySymbol = (() => bagData?.currency?.symbol || "₹")();

  function getQueryParams() {
    const queryParams = {};
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
    return queryParams;
  }

  const getTotalValue = () => {
    // Implement the logic to calculate the total value
    if (enableLinkPaymentOption) {
      return paymentLinkData?.amount;
    }
    const totalObj = bagData?.breakup_values?.display?.find(
      (item) => item.key === "total"
    );
    return totalObj?.value;
  };
  const selectedTabData = enableLinkPaymentOption
    ? linkPaymentOptions?.find((optn) =>
        getTotalValue?.() === 0
          ? optn.name === "PP" || optn.name === "COD"
          : optn.name === selectedTab
      )
    : paymentOption?.payment_option?.find((optn) =>
        getTotalValue?.() === 0
          ? optn.name === "PP" || optn.name === "COD"
          : optn.name === selectedTab
      );

  const selectedUPIData = enableLinkPaymentOption
    ? linkPaymentOptions?.filter((optn) => optn.name === "UPI")[0]?.list[0]
    : paymentOption?.payment_option?.filter((optn) => optn.name === "UPI")[0]
        ?.list[0];
  const selectedQrData = enableLinkPaymentOption
    ? linkPaymentOptions?.filter((optn) => optn.name === "QR")[0]?.list[0]
    : paymentOption?.payment_option?.filter((optn) => optn.name === "QR")[0]
        ?.list[0];

  const selectedNewCardData = enableLinkPaymentOption
    ? linkPaymentOptions?.find((optn) => optn.name === "CARD")
    : paymentOption?.payment_option?.find((optn) => optn.name === "CARD");

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
    fpi.custom.setValue(
      "isCouponValid",
      res?.data?.validateCoupon?.coupon_validity?.valid
    );
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

  const storeCreditApplied = useMemo(() => {
    const isApplied = partialPaymentOption?.list?.some(
      (option) => option?.balance?.is_applied
    );
    const isFullyApplied = isApplied && !getTotalValue();
    const PriceBreakup = bagData?.breakup_values?.display ?? null;
    if (PriceBreakup?.length > 0) {
      const obj = {};
      for (let i = 0; i < PriceBreakup.length; i++) {
        obj[PriceBreakup[i].key] = PriceBreakup[i].value;
      }
      setBreakupValues(obj);
    }
    return {
      isApplied,
      isFullyApplied,
    };
  }, [partialPaymentOption, bagData]);

  const getCurrentModeOfPayment = (payload, currentSelection, vpa) => {
    return {
      mode: payload.payment_mode,
      name: payload.payment_mode,
      payment: "required",
      payment_meta: {
        merchant_code: currentSelection?.merchant_code,
        payment_gateway: currentSelection?.aggregator_name,
        payment_identifier: vpa ? vpa : (currentSelection?.code ?? ""),
      },
    };
  };
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

    const MODES_WITHOUT_PAYMENT_CHECK = [
      "QR",
      "COD",
      "newCARD",
      "CREDITNOTE",
      "PP",
    ];

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

    if (!hasValidPayment && !MODES_WITHOUT_PAYMENT_CHECK.includes(mode)) {
      showSnackbar(t("resource.common.select_payment_option"), "error");
      return;
    }

    if (disbaleCheckout?.message) return;

    const { store_credit, total } = breakUpValues;

    const isStoreCreditApplied =
      Math.abs(store_credit) > 0 &&
      Math.abs(total) > 0 &&
      storeCreditApplied?.isApplied;

    const storeCreditPayment = {
      mode: partialPaymentOption?.name,
      name: partialPaymentOption?.name,
      payment: "blocked",
      payment_identifier: partialPaymentOption?.name,
      payment_meta: {
        merchant_code: partialPaymentOption?.name,
        payment_gateway: partialPaymentOption?.list[0]?.aggregator_name,
        payment_identifier: partialPaymentOption?.name,
      },
      amount: Math.abs(store_credit),
    };

    // --- Helpers ---

    const getPaymentflow = (aggregatorName, options = paymentOption) =>
      options?.aggregator_details?.find(
        (item) => item.aggregator_key === aggregatorName
      );

    const getLinkPaymentflow = (aggregatorName) =>
      linkDataOption?.aggregator_details?.find(
        (item) => item.aggregator_key === aggregatorName
      );

    const buildLinkOrderPayload = (selected, modeOverride = mode) => ({
      createOrderUserRequestInput: {
        currency: "INR",
        payment_link_id: id,
        failure_callback_url: `${window.location.origin}/payment/link`,
        success_callback_url: `${window.location.origin}/order-tracking`,
        payment_methods: {
          meta: {
            merchant_code: selected.merchant_code,
            payment_gateway: selected.aggregator_name,
            payment_identifier: selected.code ?? "",
          },
          mode: modeOverride,
          name: selected.name,
        },
      },
    });

    const createLinkOrder = async (selected, modeOverride) => {
      const res = await fpi.executeGQL(
        CREATE_ORDER_PAYMENT_LINK,
        buildLinkOrderPayload(selected, modeOverride)
      );
      return res?.data?.createOrderHandlerPaymentLink;
    };

    const baseLinkCheckoutPayload = (selected, modeOverride = mode) => ({
      ...linkDataOption,
      merchant_code: selected.merchant_code,
      payment_gateway: selected.aggregator_name,
      aggregator_name: selected.aggregator_name,
      payment_identifier: selected.code ?? "",
      payment_mode: modeOverride,
      name: selected.name,
      queryParams: getQueryParams(),
      ...getStaffPayload(),
      enableLinkPaymentOption,
      paymentflow: getLinkPaymentflow(selected.aggregator_name),
    });

    const baseCheckoutPayload = (selected, modeOverride = mode) => ({
      payment_mode: modeOverride,
      address_id,
      billing_address_id: address_id,
      aggregator_name: selected.aggregator_name,
      payment_identifier: selected.code ?? "",
      merchant_code: selected.merchant_code,
      payment: selected,
      paymentflow: getPaymentflow(selected.aggregator_name),
      ...getStaffPayload(),
      buy_now: buyNow,
    });

    const withStoreCredit = (currentModeOfPayment, extra = {}) =>
      isStoreCreditApplied
        ? {
            payment_methods: [currentModeOfPayment, storeCreditPayment],
            ...extra,
          }
        : {};

    const handleLinkOrStandardCheckout = async (
      selected,
      modeOverride,
      linkDataFn,
      standardFn
    ) => {
      if (enableLinkPaymentOption) {
        const linkOrderInfo = await createLinkOrder(selected, modeOverride);
        return fpi.payment.checkoutPayment({
          ...baseLinkCheckoutPayload(selected, modeOverride),
          success: linkOrderInfo?.success,
          ...linkDataFn(linkOrderInfo),
        });
      }
      return standardFn();
    };

    const handleCheckoutError = (res, fallback) => {
      if (res?.error?.message) setErrorMessage(res?.payload?.message);
      return fallback?.(res);
    };

    // --- Mode handlers ---

    const handlers = {
      CREDITNOTE: async () => {
        setIsPaymentLoading(true);
        const { merchant_code, code, aggregator_name } =
          partialPaymentOption?.list[0] || {};

        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name,
          payment_mode: code ?? "",
          payment_identifier: code ?? "",
          merchant_code,
        });

        if (storeCreditApplied?.isFullyApplied) {
          await fpi.payment.checkoutPayment({
            payment: partialPaymentOption?.list[0],
            id: cart_id,
            buy_now: buyNow,
            address_id,
            billing_address_id: billing_address_id || address_id,
            ...getStaffPayload(),
            payment_mode: code ?? "",
            aggregator_name,
            payment_identifier: code ?? "",
            merchant_code,
          });
        }
      },

      newCARD: async () => {
        try {
          setIsPaymentLoading(true);
          addParamsToLocation({
            ...getQueryParams(),
            aggregator_name: selectedNewCardData.aggregator_name,
            payment_mode: "CARD",
          });

          if (enableLinkPaymentOption) {
            const linkOrderInfo = await createLinkOrder(
              selectedNewCardData,
              "CARD"
            );
            const cardRes = await fpi.payment.checkoutPayment({
              ...baseLinkCheckoutPayload(selectedNewCardData, "CARD"),
              success: linkOrderInfo?.success,
              data: {
                amount: linkOrderInfo?.data?.amount,
                callback_url: linkOrderInfo?.data?.callback_url,
                contact: linkOrderInfo?.data?.contact,
                currency: linkOrderInfo?.data?.currency,
                customer_id: linkOrderInfo?.data?.customer_id,
                email: linkOrderInfo?.data?.email,
                method: linkOrderInfo?.data?.method,
                order_id: linkOrderInfo?.data?.order_id,
                "card[name]": selectedCardData?.name,
                "card[number]": selectedCardData?.card_number,
                "card[cvv]": selectedCardData?.cvv,
                "card[expiry_month]": selectedCardData?.exp_month,
                "card[expiry_year]": selectedCardData?.exp_year,
              },
              payment: {
                ...selectedNewCardData,
                ...selectedCardData,
                is_card_secure: isCardSecure,
              },
            });
            if (cardRes?.meta?.requestStatus === "rejected") {
              setIsPaymentLoading(false);
              return cardRes?.payload;
            }
          } else {
            const payload = { payment_mode: "CARD", id: cart_id, address_id };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedNewCardData
            );
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
              paymentflow: getPaymentflow(selectedNewCardData.aggregator_name),
              buy_now: buyNow,
              ...getStaffPayload(),
              ...(isStoreCreditApplied && {
                payment_methods: [currentModeOfPayment, storeCreditPayment],
              }),
            });
            if (res?.meta?.requestStatus === "rejected") {
              setIsPaymentLoading(false);
              return res?.payload;
            }
            return res?.payload?.data?.checkoutCart;
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsPaymentLoading(false);
        }
      },

      CARD: async () => {
        try {
          setIsPaymentLoading(true);
          addParamsToLocation({
            ...getQueryParams(),
            aggregator_name: selectedCard.aggregator_name,
            payment_mode: mode,
            payment_identifier: selectedCard.card_id,
            card_reference: selectedCard.card_reference,
          });
          const payload = { payment_mode: "CARD", id: cart_id, address_id };
          const { id, is_redirection, ...options } = payload;
          const res = await fpi.payment.checkoutPayment({
            ...options,
            aggregator_name: selectedCard.aggregator_name,
            payment_identifier: selectedCard.card_id,
            payment: {
              ...selectedCard,
              card_security_code: selectedCardCvv,
              is_card_secure:
                selectedCard.compliant_with_tokenisation_guidelines,
            },
            address_id,
            billing_address_id: address_id,
            paymentflow: getPaymentflow(selectedCard.aggregator_name),
            buy_now: buyNow,
            ...getStaffPayload(),
            ...(isStoreCreditApplied && {
              payment_methods: ["store_credits", mode],
              store_credit,
              partialPaymentOption,
            }),
          });
          if (res?.meta?.requestStatus === "rejected") {
            setIsPaymentLoading(false);
            return res?.payload;
          }
        } catch (error) {
          console.log(error);
        } finally {
          setIsPaymentLoading(false);
        }
      },

      WL: async () => {
        setIsPaymentLoading(true);
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedWallet.aggregator_name,
          payment_mode: mode,
          payment_identifier: selectedWallet.code ?? "",
          merchant_code: selectedWallet.merchant_code,
        });

        const linkDataFn = (linkOrderInfo) => ({
          data: {
            ...pickLinkOrderData(linkOrderInfo),
            wallet: selectedWallet.code ?? "",
          },
          success: linkOrderInfo?.success,
        });

        const res = await handleLinkOrStandardCheckout(
          selectedWallet,
          mode,
          linkDataFn,
          async () => {
            const payload = { payment_mode: "WL", id: cart_id, address_id };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedWallet
            );
            return fpi.payment.checkoutPayment({
              ...baseCheckoutPayload(selectedWallet),
              ...options,
              ...withStoreCredit(currentModeOfPayment),
            });
          }
        );
        setIsPaymentLoading(false);
        handleCheckoutError(res);
      },

      UPI: async () => {
        setIsPaymentLoading(true);
        try {
          if (selectedUpiIntentApp && selectedUpiIntentApp !== "any") {
            setShowUpiRedirectionModal(true);
          }

          if (vpa) {
            const res = await fpi.executeGQL(VALID_UPI, {
              validateVPARequestInput: {
                upi_vpa: vpa,
                aggregator: selectedUPIData.aggregator_name,
              },
            });
            if (!res?.data?.validateVPA?.data?.is_valid) {
              setUPIError(true);
              return { isUPIError: true };
            }
          }

          addParamsToLocation({
            ...getQueryParams(),
            aggregator_name: selectedUPIData.aggregator_name,
            payment_mode: mode,
            payment_identifier: vpa,
            merchant_code: selectedUPIData.merchant_code,
          });

          const upiExtras = {
            upi_app: selectedUpiIntentApp,
            payment_identifier: vpa,
            payment_extra_identifiers: { consent: upiSaveForLaterChecked },
            payment: { ...selectedUPIData, upi: vpa },
            address_id,
            billing_address_id: address_id,
            aggregator_name: selectedUPIData.aggregator_name,
            paymentflow: getPaymentflow(selectedUPIData.aggregator_name),
            buy_now: buyNow,
            ...getStaffPayload(),
          };

          let finalres;
          if (enableLinkPaymentOption) {
            const linkOrderInfo = await createLinkOrder(selectedUPIData);
            finalres = await fpi.payment.checkoutPayment({
              ...baseLinkCheckoutPayload(selectedUPIData),
              ...upiExtras,
              success: linkOrderInfo?.success,
              data: { ...pickLinkOrderData(linkOrderInfo), vpa },
            });
          } else {
            const payload = {
              aggregator_name: selectedUPIData.aggregator_name,
              payment_mode: mode,
              payment_identifier: selectedUPIData.code ?? "",
              merchant_code: selectedUPIData.merchant_code,
              id: cart_id,
            };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedUPIData,
              vpa
            );
            finalres = await fpi.payment.checkoutPayment({
              ...options,
              ...upiExtras,
              payment_methods: isStoreCreditApplied
                ? [currentModeOfPayment, storeCreditPayment]
                : [],
            });
          }

          if (finalres?.meta?.requestStatus === "rejected") {
            setShowUpiRedirectionModal(false);
            return finalres?.payload;
          }
          return {
            ...finalres,
            aggregator_name: selectedUPIData.aggregator_name,
          };
        } catch (error) {
          console.error("Error during UPI payment process:", error);
        } finally {
          setIsPaymentLoading(false);
        }
      },

      QR: async () => {
        setIsQrCodeLoading(true);
        try {
          addParamsToLocation({
            ...getQueryParams(),
            aggregator_name: selectedQrData.aggregator_name,
            payment_mode: mode,
            payment_identifier: selectedQrData.code ?? "",
            merchant_code: selectedQrData.merchant_code,
          });

          let res;
          if (enableLinkPaymentOption) {
            const linkOrderInfo = await createLinkOrder(selectedQrData);
            res = await fpi.payment.checkoutPayment({
              ...baseLinkCheckoutPayload(selectedQrData),
              payment: { ...selectedQrData },
              data: linkOrderInfo?.data,
              success: linkOrderInfo?.success,
            });
          } else {
            const payload = { payment_mode: "QR", id: cart_id, address_id };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedQrData
            );
            res = await fpi.payment.checkoutPayment({
              ...baseCheckoutPayload(selectedQrData),
              ...options,
              payment_mode: mode,
              ...withStoreCredit(currentModeOfPayment),
            });
          }

          if (res?.meta?.requestStatus === "rejected") return res?.payload;
          return res;
        } catch (err) {
          setIsQrCodeLoading(false);
        }
      },

      NB: async () => {
        setIsPaymentLoading(true);
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedNB.aggregator_name,
          payment_mode: mode,
          payment_identifier: selectedNB.code ?? "",
          merchant_code: selectedNB.merchant_code,
        });

        const res = await handleLinkOrStandardCheckout(
          selectedNB,
          mode,
          (linkOrderInfo) => ({
            data: {
              ...pickLinkOrderData(linkOrderInfo),
              bank: selectedNB.code ?? "",
            },
            success: linkOrderInfo?.success,
          }),
          async () => {
            const payload = { payment_mode: "NB", id: cart_id, address_id };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedNB
            );
            return fpi.payment.checkoutPayment({
              ...baseCheckoutPayload(selectedNB),
              ...options,
              queryParams: getQueryParams(),
              ...withStoreCredit(currentModeOfPayment),
            });
          }
        );
        setIsPaymentLoading(false);
        handleCheckoutError(res);
      },

      COD: async () => handlers.PP(),
      PP: async () => {
        setIsPaymentLoading(true);
        const payload = { payment_mode: mode, id: cart_id, address_id };
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedTabData?.aggregator_name,
          payment_mode: mode,
          payment_identifier: `${selectedTabData?.payment_mode_id}`,
        });
        const { id, is_redirection, ...options } = payload;
        const basePayload = {
          ...options,
          aggregator_name: selectedTabData?.aggregator_name,
          queryParams: getQueryParams(),
          payment: selectedTabData,
          address_id,
          billing_address_id: address_id,
          paymentflow: getPaymentflow(selectedTabData?.aggregator_name),
          buy_now: buyNow,
          ...getStaffPayload(),
        };
        const res = await fpi.payment.checkoutPayment({
          ...basePayload,
          ...(isStoreCreditApplied && {
            payment_methods: ["store_credits", mode],
            store_credit,
            partialPaymentOption,
          }),
        });
        if (res?.error?.message) {
          setIsPaymentLoading(false);
          setErrorMessage(res?.payload?.message);
        }
      },

      PL: async () => {
        setIsPaymentLoading(true);
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedPayLater.aggregator_name,
          payment_mode: mode,
          payment_identifier: selectedPayLater.code ?? "",
          merchant_code: selectedPayLater.merchant_code,
        });

        const res = await handleLinkOrStandardCheckout(
          selectedPayLater,
          mode,
          (linkOrderInfo) => ({
            data: {
              ...pickLinkOrderData(linkOrderInfo),
              provider: selectedPayLater.code ?? "",
            },
            success: linkOrderInfo?.success,
          }),
          async () => {
            const payload = { payment_mode: "PL", id: cart_id, address_id };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedPayLater
            );
            return fpi.payment.checkoutPayment({
              ...baseCheckoutPayload(selectedPayLater),
              ...options,
              queryParams: getQueryParams(),
              ...withStoreCredit(currentModeOfPayment),
            });
          }
        );
        setIsPaymentLoading(false);
        handleCheckoutError(res);
      },

      CARDLESS_EMI: async () => {
        setIsPaymentLoading(true);
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedCardless.aggregator_name,
          payment_mode: mode,
          payment_identifier: selectedCardless.code ?? "",
          merchant_code: selectedCardless.merchant_code,
        });

        const res = await handleLinkOrStandardCheckout(
          selectedCardless,
          mode,
          (linkOrderInfo) => ({ data: linkOrderInfo?.data }),
          async () => {
            const payload = {
              payment_mode: "CARDLESS_EMI",
              id: cart_id,
              address_id,
            };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedCardless
            );
            return fpi.payment.checkoutPayment({
              ...baseCheckoutPayload(selectedCardless),
              ...options,
              queryParams: getQueryParams(),
              ...withStoreCredit(currentModeOfPayment),
            });
          }
        );
        setIsPaymentLoading(false);
        handleCheckoutError(res);
      },

      Other: async () => {
        setIsPaymentLoading(true);
        addParamsToLocation({
          ...getQueryParams(),
          aggregator_name: selectedOtherPayment.aggregator_name,
          payment_mode: selectedOtherPayment.code ?? "",
          payment_identifier: selectedOtherPayment.code ?? "",
          merchant_code: selectedOtherPayment.merchant_code,
        });

        const res = await handleLinkOrStandardCheckout(
          { ...selectedOtherPayment, name: selectedOtherPayment.code ?? "" },
          selectedOtherPayment.code ?? "",
          (linkOrderInfo) => ({
            payment: selectedOtherPayment,
            data: {
              ...pickLinkOrderData(linkOrderInfo),
              merchant_order_id: linkOrderInfo?.data?.merchant_order_id,
              merchant_transaction_id:
                linkOrderInfo?.data?.merchant_transaction_id || "",
              upi_app: "",
              access_code: linkOrderInfo?.data?.access_code || "",
              base64_html: linkOrderInfo?.data?.base64_html || "",
              enc_message: linkOrderInfo?.data?.enc_message || "",
              merchant_id: linkOrderInfo?.data?.merchant_id || "",
              transaction_token: linkOrderInfo?.data?.transaction_token || "",
            },
            success: linkOrderInfo?.success,
          }),
          async () => {
            const payload = {
              aggregator_name: selectedOtherPayment.aggregator_name,
              payment_mode: selectedOtherPayment.code ?? "",
              payment_identifier: selectedOtherPayment.code ?? "",
              merchant_code: selectedOtherPayment.merchant_code,
              id: cart_id,
            };
            const { id, is_redirection, ...options } = payload;
            const currentModeOfPayment = getCurrentModeOfPayment(
              payload,
              selectedOtherPayment
            );
            return fpi.payment.checkoutPayment({
              ...options,
              merchant_code: selectedOtherPayment.code ?? "",
              payment: selectedOtherPayment,
              address_id,
              billing_address_id: address_id,
              paymentflow: getPaymentflow(selectedOtherPayment.aggregator_name),
              buy_now: buyNow,
              ...getStaffPayload(),
              ...withStoreCredit(currentModeOfPayment),
            });
          }
        );
        handleCheckoutError(res, () => setIsPaymentLoading(false));
      },
    };

    const handler = handlers[mode];
    if (handler) return handler();
  };

  // Helper to extract common link order response fields
  const pickLinkOrderData = (linkOrderInfo) => ({
    amount: linkOrderInfo?.data?.amount,
    callback_url: linkOrderInfo?.data?.callback_url,
    contact: linkOrderInfo?.data?.contact,
    currency: linkOrderInfo?.data?.currency,
    customer_id: linkOrderInfo?.data?.customer_id,
    email: linkOrderInfo?.data?.email,
    method: linkOrderInfo?.data?.method,
    order_id: linkOrderInfo?.data?.order_id,
  });

  const checkAndUpdatePaymentStatus = async (payload) => {
    return fpi.executeGQL(CHECK_AND_UPDATE_PAYMENT_STATUS, {
      paymentStatusUpdateRequestInput: payload,
    });
  };

  const cancelPayment = async (payload) => {
    setIsLoading(false);
    return fpi.executeGQL(RESEND_OR_CANCEL_PAYMENT, {
      resendOrCancelPaymentRequestInput: payload,
    });
  };

  const PaymentOptionsList = () => {
    const tempOpt = [];
    let orderedOptions = enableLinkPaymentOption
      ? linkPaymentOptions
      : orderBy(paymentOption?.payment_option, "display_priority", "asc");

    orderedOptions = orderedOptions.filter((opt) => opt.flow === "custom");
    orderedOptions = orderedOptions.filter(
      (opt) => !opt.list?.[0]?.partial_payment_allowed
    );
    // orderedOptions = orderedOptions.filter((opt) => opt.name !== "QR");
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

  const fetchCreditNoteBalance = async (
    aggregator = "creditnote",
    transactionAmount = null
  ) => {
    try {
      // Get transaction_amount from parameter, bagData, or default to 0
      let transaction_amount = transactionAmount;

      if (transaction_amount === null || transaction_amount === undefined) {
        transaction_amount =
          bagData?.breakup_values?.display?.[
            bagData?.breakup_values?.display?.length - 1
          ]?.value;
      }

      // Ensure transaction_amount is a valid number (default to 0 if still undefined)
      if (
        transaction_amount === null ||
        transaction_amount === undefined ||
        Number.isNaN(transaction_amount)
      ) {
        transaction_amount = 0;
      }

      const payload = {
        customerAndCreditSummary: {
          user_id,
          cart_id,
          transaction_amount,
          aggregator,
        },
      };
      const { data, errors } = await fpi.executeGQL(
        CREDIT_NOTE_BALANCE,
        payload
      );

      if (errors) {
        throw errors;
      }
      setIsCreditNoteApplied(
        data?.validateCustomerAndCreditSummary?.is_applied
      );
      return data?.validateCustomerAndCreditSummary;
    } catch (error) {
      console.error(error);
    }
  };

  function otherOptions() {
    const otherPaymentOptions =
      linkPaymentOptions?.length > 0
        ? linkPaymentOptions
        : paymentOption?.payment_option;
    let optn = otherPaymentOptions?.filter((opt) => {
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

  const updatePartialPayment = async () => {
    try {
      setIsLoading(true);
      let option = paymentOption?.payment_option?.find(
        ({ name }) => name === "CREDITNOTE"
      );

      option = { ...option };

      const list = [];

      if (option?.list?.length > 0) {
        for (let i = 0; i < option?.list?.length; i++) {
          const { partial_payment_allowed, aggregator_name } = option?.list[i];
          if (partial_payment_allowed && !option.list[i].balance) {
            // eslint-disable-next-line no-await-in-loop
            const data = await fetchCreditNoteBalance(aggregator_name);
            list.push({ ...option.list[i], balance: data });
            option.list = list;
          }
        }
        setPartialPaymentOption(option);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStoreCredits = async (store_credit = false) => {
    setIsLoading(true);
    setIsCreditNoteApplied(store_credit);
    setPartialPaymentOption((prev) => ({
      ...prev,
      list: [
        {
          ...prev.list[0],
          balance: {
            ...prev.list[0].balance,
            is_applied: store_credit,
          },
        },
      ],
    }));
    const payload = {
      b: true,
      buyNow,
      id: cart_id,
      updateCartBreakupRequestInput: {
        store_credit,
      },
    };
    try {
      setCreditUpdating(true);
      const { data, errors } = await fpi.executeGQL(
        UPDATE_CART_BREAKUP,
        payload
      );

      if (errors) {
        throw errors;
      }

      await fetchCartDetails(fpi, { buyNow }).then(async ({ data, errors }) => {
        const amount =
          data?.cart?.breakup_values?.display?.find(
            (item) => item.key === "total"
          )?.value * 100 || 0;

        // Use cart_id from URL or fallback to cart ID from response data
        const resolvedCartId = cart_id || data?.cart?.id;
        if (!resolvedCartId) {
          console.error("Cart ID not available for payment options");
          return;
        }
        const paymentPayload = {
          pincode: localStorage?.getItem("pincode") || "",
          cartId: resolvedCartId,
          checkoutMode: "self",
          amount,
        };
        await fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
      });

      return data;
    } catch (error) {
      console.error(error);
    } finally {
      setCreditUpdating(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (paymentOption?.payment_option?.length > 0 && currentStep === 2) {
      setCallOnce((prev) => {
        if (prev === false) {
          updatePartialPayment();
          return true;
        }
      });
    }
  }, [paymentOption, bagData]);

  return {
    selectedTab,
    getCurrencySymbol,
    selectedTabData,
    paymentConfig,
    paymentOption: enableLinkPaymentOption
      ? { payment_option: linkPaymentOptions }
      : paymentOption,
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
    partialPaymentOption,
    updateStoreCredits,
    storeCreditApplied,
    setShowUpiRedirectionModal,
    errorMessage,
    setErrorMessage,
    setIsLoading,
    linkPaymentModeOptions,
    enableLinkPaymentOption,
    paymentLinkData,
    isApiLoading,
    getLinkOrderDetails,
    creditUpdating,
    isPaymentLoading,
    fetchCreditNoteBalance,
    isCreditNoteApplied,
    setIsPaymentLoading,
  };
};

export default usePayment;
