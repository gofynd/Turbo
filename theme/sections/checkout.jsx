import React, { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation, useFPI } from "fdk-core/utils";

import SinglePageShipment from "@gofynd/theme-template/page-layouts/single-checkout/shipment/single-page-shipment";
import SingleAddress from "@gofynd/theme-template/page-layouts/single-checkout/address/single-address";
import CheckoutPayment from "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment";
import PriceBreakup from "@gofynd/theme-template/components/price-breakup/price-breakup";
import Stepper from "@gofynd/theme-template/components/stepper/stepper";
import Coupon from "@gofynd/theme-template/page-layouts/cart/Components/coupon/coupon";
import Comment from "@gofynd/theme-template/page-layouts/cart/Components/comment/comment";
import ZeroPayButton from "@gofynd/theme-template/page-layouts/single-checkout/payment/zero-pay-btn/zero-pay-btn";
import FyButton from "@gofynd/theme-template/components/core/fy-button/fy-button";
import "@gofynd/theme-template/pages/checkout/checkout.css";

import styles from "../styles/sections/checkout.less";
import { CHECKOUT_LANDING, PAYMENT_OPTIONS, FETCH_SHIPMENTS } from "../queries/checkoutQuery";
import { useGoogleMapConfig, useDeliverPromise } from "../helper/hooks";
import useAddress from "../page-layouts/single-checkout/address/useAddress";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import useCart from "../page-layouts/cart/useCart";
import useCartCoupon from "../page-layouts/cart/useCartCoupon";
import useCartComment from "../page-layouts/cart/useCartComment";
import Loader from "../components/loader/loader";
import TrustBadges from "../components/trust-badges-block/trust-badges";
import { currencyFormat, formatLocale } from "../helper/utils";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const { shipments } = useGlobalStore(fpi.getters.SHIPMENTS) || {};
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { buybox, fulfillment_option } = useGlobalStore(
    fpi.getters.APP_FEATURES
  );
  const breakupValues = bagData?.breakup_values?.display || [];
  
  // Calculate total price from breakupValues
  const totalPrice = useMemo(() => {
    if (!breakupValues || breakupValues.length === 0) return 0;
    // Use "total" key which represents the final payable amount after all discounts
    const total = breakupValues.find((val) => val.key === "total");
    return total?.value ?? 0;
  }, [breakupValues]);
  
  const [showShipment, setShowShipment] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isApiLoading, setIsApiLoading] = useState(true);
  const { onPriceDetailsClick, cartData } = useCart(fpi);
  const steps = [
    { label: t("resource.checkout.address") },
    { label: t("resource.checkout.summary") },
    { label: t("resource.checkout.payment") },
  ];

  const { getFormattedPromise } = useDeliverPromise({ fpi });

  const { isCheckoutMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const buy_now = searchParams.get("buy_now") || false;
  const address_id = searchParams.get("address_id");
  const error = searchParams.get("error");
  const transactionFailed = searchParams.get("failed");
  const payment_mode = searchParams.get("payment_mode");
  const aggregator_name = searchParams.get("aggregator_name");

  const cartComment = useCartComment({ fpi, cartData: bagData });
  const { ...payment } = usePayment(fpi);
  const { getTotalValue, isCreditNoteApplied, fetchCreditNoteBalance } =
    payment;
  const { currentStep = null } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  const [cancelQrPayment, setCancelQrPayment] = useState(null);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [mopPayload, setMopPayload] = useState("");
  const urlCartId = searchParams.get("id");
  // For buy_now flows, prioritize URL cart ID (extension APIs may create new carts)
  const cart_id =
    buy_now === "true" && urlCartId
      ? urlCartId
      : cartData?.id || bagData?.id || urlCartId;
  const { isLoading, setIsLoading, isPaymentLoading = false } = payment;
  const { app_features } = useGlobalStore(fpi.getters.CONFIGURATION) || {};
  const { order = {} } = app_features || {};
  const { user_id = "" } = useGlobalStore(fpi.getters.USER_DATA) || {};

  const hasAddressFromQuery = useRef(false);
  const isHandlingBrowserBack = useRef(false);
  const currentStepIdxRef = useRef(0);
  const checkoutAmountRef = useRef(0);
  const previousStepIdx = useRef(0);
  const navigateRef = useRef(navigate);
  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData]
  );

  // Keep refs in sync with state
  useEffect(() => {
    currentStepIdxRef.current = currentStepIdx;
  }, [currentStepIdx]);

  useEffect(() => {
    checkoutAmountRef.current = checkoutAmount;
  }, [checkoutAmount]);

  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    fpi.custom.setValue("currentStep", currentStepIdx);
  }, [currentStepIdx]);

  useEffect(() => {
    if (currentStep !== null && currentStep !== currentStepIdx) {
      setCurrentStepIdx(currentStep);
      setShowShipment(currentStep === 1);
      setShowPayment(currentStep === 2);
    }
  }, [currentStep]);

  // Handle browser back button navigation
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") {
      return;
    }

    let timeoutId = null;

    const handlePopState = (event) => {
      // Only handle if we're not already handling a browser back navigation
      if (isHandlingBrowserBack.current) {
        return;
      }

      const currentStep = currentStepIdxRef.current;

      // If we're on step 0, check if we're navigating to another checkout URL
      // If so, navigate away to cart page instead
      if (currentStep === 0) {
        // Check if the current URL is still a checkout URL
        // If it is, it means we're just changing parameters, not leaving checkout
        // In that case, navigate to cart page
        try {
          const currentPath = window.location.pathname;
          const isStillOnCheckout = currentPath.includes("/checkout");

          if (isStillOnCheckout && navigateRef.current) {
            // Still on checkout page (just different params) - navigate to cart
            // Use React Router navigate with replace to avoid full page reload
            navigateRef.current("/cart/bag", { replace: true });
          }
        } catch (error) {
          console.error(
            "Error handling browser back navigation on step 0:",
            error
          );
        }
        return;
      }

      // If we're on step 1 or 2, navigate to previous step
      const previousStep = currentStep - 1;
      if (previousStep >= 0) {
        isHandlingBrowserBack.current = true;

        try {
          switch (previousStep) {
            case 0:
              setCurrentStepIdx(0);
              setShowShipment(false);
              setShowPayment(false);
              previousStepIdx.current = 0;
              break;

            case 1:
              setCurrentStepIdx(1);
              setShowShipment(true);
              setShowPayment(false);
              previousStepIdx.current = 1;
              break;

            case 2:
              setCurrentStepIdx(2);
              setShowShipment(false);
              setShowPayment(true);
              previousStepIdx.current = 2;
              break;

            default:
              break;
          }

          // Reset flag after state updates
          timeoutId = setTimeout(() => {
            isHandlingBrowserBack.current = false;
            timeoutId = null;
          }, 100);
        } catch (error) {
          console.error("Error handling browser back navigation:", error);
          isHandlingBrowserBack.current = false;
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const priceFormatCurrencySymbol = (symbol, price) => {
    const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);

    const formattedValue = hasAlphabeticCurrency
      ? `${symbol} ${price}`
      : `${symbol}${price}`;

    return formattedValue;
  };

  useEffect(() => {
    // Update URL cart ID only for non-buy_now flows
    const currentCartId = searchParams.get("id");
    const isBuyNowFlow = buy_now === "true";

    if (
      cartData?.id &&
      cartData.id !== currentCartId &&
      cartData.id !== "None" &&
      !isBuyNowFlow
    ) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("id", cartData?.id);
      setSearchParams(newParams, { replace: true });
    }
  }, [cartData?.id, searchParams, setSearchParams, buy_now]);

  async function showPaymentOptions(amount) {
    try {
      setIsLoading(true);
      // setShowShipment(false);
      // showPaymentHandler(true);
      const finalAmount = checkoutAmount || amount;
      // Use cartData?.id as fallback when cart_id from URL is null
      const resolvedCartId = cart_id || cartData?.id;
      if (!resolvedCartId) {
        console.error("Cart ID not available for payment options");
        return;
      }
      const paymentPayload = {
        pincode: localStorage?.getItem("pincode") || "",
        cartId: resolvedCartId,
        checkoutMode: "self",
        amount: finalAmount ? finalAmount * 100 : 0,
      };
      const res = await fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
    } catch (error) {
      console.error("Error fetching payment options:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const cartCoupon = useCartCoupon({
    fpi,
    cartData: bagData,
    showPaymentOptions,
    setShowShipment,
    setShowPayment,
    setIsLoading,
    currentStepIdx,
    setCheckoutAmount,
    mopPayload,
  });

  const { availableCouponList, successCoupon, ...restCouponProps } = cartCoupon;
  const { isCouponValid, setIsCouponValid, inValidCouponData } = cartCoupon;

  useEffect(() => {
    setIsApiLoading(true);
    const urlCartId = searchParams.get("id");
    const payload = {
      buyNow: buy_now === "true",
      includeAllItems: true,
      includeBreakup: true,
      id: urlCartId || undefined,
    };
    const fetchCheckoutData = async () => {
      try {
        const res = await fpi.executeGQL(CHECKOUT_LANDING, payload);
        const breakupValues = res?.data?.cart?.breakup_values?.display;
        const amount =
          breakupValues && breakupValues.length > 0
            ? breakupValues[breakupValues.length - 1]?.value
            : 0;
        setCheckoutAmount(amount);
        // When payment fails and URL has payment_mode/aggregator_name, 
        // open payment section and close order summary
        // If URL has payment_mode/aggregator_name, it indicates a payment attempt was made
        // If we're back on checkout (not order status), it likely means payment failed
        const hasPaymentParams = payment_mode || aggregator_name;
        const hasError = error || transactionFailed;
        
        if (hasPaymentParams && amount) {
          // Open payment section and close order summary to show payment method/error
          // If URL has payment_mode/aggregator_name, it indicates a payment attempt was made
          // If we're back on checkout (not order status), it likely means payment failed
          showPaymentHandler(true);
          showShipmentHandler(false);
          // Fetch payment options to show payment methods and any errors
          showPaymentOptions(amount);
        } else if (hasError && amount) {
          // If there's an error but no payment params, still open payment section
          showPaymentHandler(true);
          showShipmentHandler(false);
          showPaymentOptions(amount);
        }
      } catch (err) {
        console.error("checkout error", err);
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchCheckoutData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fpi, buy_now]);

  useEffect(() => {
    if (user_id && checkoutAmount === 0) {
      fetchCreditNoteBalance("creditnote", checkoutAmount);
    }
  }, [user_id, checkoutAmount]);

  function showPaymentHandler(flag) {
    setShowPayment(flag);
    if (flag) {
      setCurrentStepIdx(2);
    }
  }

  const showShipmentHandler = (flag) => {
    setShowShipment(flag);
    if (flag) {
      setCurrentStepIdx(1);
    }
  };
  useEffect(() => {
    if (!showPayment && !showShipment) {
      setCurrentStepIdx(0);
    }
  }, [showShipment, showPayment]);

  // Ensure payment section stays open when payment params are present (payment failure scenario)
  // This prevents other useEffects from opening shipment and causing visual jerk
  useEffect(() => {
    const hasPaymentParams = payment_mode || aggregator_name;
    if (hasPaymentParams && showPayment && showShipment) {
      // If payment section should be open but shipment is also open, close shipment
      showShipmentHandler(false);
    }
  }, [showPayment, showShipment, payment_mode, aggregator_name]);

  useEffect(() => {}, [user_id]);

  // Push history states when moving forward through steps programmatically
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") {
      return;
    }

    // Don't push history if we're handling browser back navigation
    if (isHandlingBrowserBack.current) {
      return;
    }

    try {
      // Push history state when moving to step 1 (summary/shipment)
      if (showShipment && currentStepIdx === 1 && previousStepIdx.current < 1) {
        window.history.pushState({ step: 1 }, "", window.location.href);
        previousStepIdx.current = 1;
      }

      // Push history state when moving to step 2 (payment)
      if (showPayment && currentStepIdx === 2 && previousStepIdx.current < 2) {
        window.history.pushState({ step: 2 }, "", window.location.href);
        previousStepIdx.current = 2;
      }

      // Update previous step ref when on step 0
      // Also replace history state to ensure browser back works correctly
      if (!showShipment && !showPayment && currentStepIdx === 0) {
        previousStepIdx.current = 0;
        // Replace current history state to ensure browser back works correctly
        // Use empty object instead of null to avoid React Router issues
        const currentState = window.history.state;
        if (currentState && currentState.step !== undefined) {
          // Only replace if current state has a step property
          // This ensures browser back can navigate to cart page
          window.history.replaceState({}, "", window.location.href);
        }
      }
    } catch (error) {
      console.error("Error managing history state:", error);
    }
  }, [showShipment, showPayment, currentStepIdx]);

  // Initialize history state if we start on a step > 0
  // Also ensure step 0 has clean history state for browser back to work
  useEffect(() => {
    // Safety check for SSR
    if (typeof window === "undefined") {
      return;
    }

    try {
      if (
        currentStepIdx > 0 &&
        previousStepIdx.current === 0 &&
        !isHandlingBrowserBack.current
      ) {
        window.history.replaceState(
          { step: currentStepIdx },
          "",
          window.location.href
        );
        previousStepIdx.current = currentStepIdx;
      } else if (currentStepIdx === 0) {
        // Ensure step 0 has clean history state for browser back to work
        const currentState = window.history.state;
        if (currentState && currentState.step !== undefined) {
          window.history.replaceState({}, "", window.location.href);
        }
        previousStepIdx.current = 0;
      }
    } catch (error) {
      console.error("Error initializing history state:", error);
    }
  }, [currentStepIdx]);

  const { isShipmentLoading, isCartValid, ...address } = useAddress(
    showShipmentHandler,
    showPaymentHandler,
    fpi
  );

  const { onFailedGetCartShipmentDetails } = address;

  useEffect(() => {
    if (!address_id || hasAddressFromQuery.current) return;
    const hasPaymentParams = payment_mode || aggregator_name;
    
    if (hasPaymentParams) {
      // When payment params are present, fetch shipments without opening shipment section
      // This ensures shipments are loaded for order summary while keeping payment section open
      hasAddressFromQuery.current = true;
      const fetchShipmentsForPaymentFailure = async () => {
        try {
          await fpi.executeGQL(FETCH_SHIPMENTS, {
            addressId: address_id,
            id: cart_id,
            buyNow: buy_now === "true",
          });
        } catch (error) {
          console.error("Error fetching shipments:", error);
        }
      };
      fetchShipmentsForPaymentFailure();
      return;
    }
    
    if (showShipment) {
      // Check if shipments have actually loaded before marking as processed
      // If shipments haven't loaded yet, we should still try to fetch them
      const hasShipments = shipments && Array.isArray(shipments) && shipments.length > 0;
      if (hasShipments) {
        hasAddressFromQuery.current = true;
        return;
      }
      // Don't return - continue to call selectAddress to fetch shipments
    }

    if (!address?.selectAddress) {
      return;
    }

    hasAddressFromQuery.current = true;
    try {
      // When payment params are present, don't open shipment accordion
      address.selectAddress(address_id, null, !hasPaymentParams);
    } catch (error) {
      console.error("Error selecting address:", error);
      hasAddressFromQuery.current = false;
    }
    // Removed 'shipments' from dependencies to prevent infinite loop
    // When selectAddress is called, it fetches shipments, which would trigger this effect again
  }, [address_id, showShipment, address, payment_mode, aggregator_name, cart_id, buy_now, fpi]);

  const addressId = useMemo(() => {
    if (!address) {
      return undefined;
    }
    
    // First, try to get default address (matches useAddress hook logic)
    // getDefaultAddress already filters for is_default_address: true
    if (address.getDefaultAddress && Array.isArray(address.getDefaultAddress) && address.getDefaultAddress.length > 0) {
      const defaultAddressId = address.getDefaultAddress[0]?.id;
      if (defaultAddressId) {
        return defaultAddressId;
      }
    }
    
    // If no default address, fall back to first address from other addresses
    // This handles guest users or cases where no default address is set
    if (address.getOtherAddress && Array.isArray(address.getOtherAddress) && address.getOtherAddress.length > 0) {
      return address.getOtherAddress[0]?.id;
    }
    
    // If no other addresses, try allAddresses as last resort
    // This ensures we always try to select an address if available
    if (address.allAddresses && Array.isArray(address.allAddresses) && address.allAddresses.length > 0) {
      return address.allAddresses[0]?.id;
    }
    
    return undefined;
  }, [address?.getDefaultAddress, address?.getOtherAddress, address?.allAddresses]);

  const redirectPaymentOptions = () => {
    setIsLoading(true);
    setShowShipment(false);
    showPaymentHandler(true);
  };

  // Only set default address in URL if there's no address_id in URL params
  // This prevents overriding user's address selection
  useEffect(() => {
    const currentAddressId = searchParams.get("address_id");
    if (addressId && !currentAddressId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("address_id", addressId);
      // Use replace: true to avoid creating history entries
      // This prevents browser back from navigating through URL parameter changes
      setSearchParams(newParams, { replace: true });
      
      // Reset the flag so that selectAddress can be called when address_id is set
      // This ensures shipments are fetched when address is auto-selected
      hasAddressFromQuery.current = false;
    }
  }, [addressId, searchParams, setSearchParams]);

  // Ensure shipments are fetched when address_id exists but shipments haven't loaded
  // This is a fallback to ensure shipments load even if the initial address selection didn't trigger
  useEffect(() => {
    // Skip if already processing or if first effect already handled it
    if (hasAddressFromQuery.current) return;
    
    const currentAddressId = searchParams.get("address_id");
    const hasShipments = shipments && Array.isArray(shipments) && shipments.length > 0;
    const hasPaymentParams = payment_mode || aggregator_name;

    // If we have an address_id but no shipments and address.selectAddress is available
    // and we're not already loading, trigger shipment fetch
    if (
      currentAddressId &&
      !hasShipments &&
      !isShipmentLoading &&
      address?.selectAddress
    ) {
      // Now try to fetch shipments
      // When payment params are present, don't open shipment accordion
      hasAddressFromQuery.current = true;
      try {
        address.selectAddress(currentAddressId, null, !hasPaymentParams);
      } catch (error) {
        console.error("Error calling selectAddress to fetch shipments:", error);
        hasAddressFromQuery.current = false;
      }
    }
    // Removed 'shipments' from dependencies to prevent infinite loop
    // Only check shipments inside the effect, don't depend on it
  }, [address_id, isShipmentLoading, address, searchParams, payment_mode, aggregator_name]);

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      if (payment?.storeCreditApplied?.isFullyApplied) {
        const { merchant_code, code, aggregator_name } =
          payment?.partialPaymentOption?.list[0];

        const paymentModePayload = {
          id: cart_id,
          address_id,
          payment_mode: code,
          aggregator_name,
          payment_identifier: code,
          merchant_code,
        };
        await payment?.selectPaymentMode(paymentModePayload);
        await payment?.proceedToPay("CREDITNOTE");
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleStepClick = async (stepIndex, step) => {
    if (stepIndex >= currentStepIdx) {
      return;
    }

    // When clicking on a step, we're going backward, so we don't push history
    // History is pushed when moving forward programmatically

    try {
      switch (stepIndex) {
        case 0: {
          setCurrentStepIdx(0);
          setShowShipment(false);
          setShowPayment(false);
          const newParams = new URLSearchParams(searchParams);
          newParams.delete("address_id");
          // Use replace: true to avoid creating history entries
          // This prevents browser back from navigating through URL parameter changes
          setSearchParams(newParams, { replace: true });
          previousStepIdx.current = 0;
          break;
        }

        case 1:
          setCurrentStepIdx(1);
          setShowShipment(true);
          setShowPayment(false);
          previousStepIdx.current = 1;
          break;

        case 2:
          setCurrentStepIdx(2);
          setShowShipment(false);
          setShowPayment(true);
          if (checkoutAmount) {
            await showPaymentOptions(checkoutAmount);
          }
          previousStepIdx.current = 2;
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error handling step click:", error);
    }
  };

  const loader = <Loader customClassName={styles.customizedLoader} />;

  return (
    <div className={`${styles.mainContainer} fontBody`}>
      {blocks?.map((block, index) => {
        const key = `${block.type}_${index}`;

        switch (block.type) {
          case "stepper":
            return (
              <div key={key} className={styles["view-mobile"]}>
                <Stepper
                  steps={steps}
                  currentStepIdx={currentStepIdx}
                  onStepClick={handleStepClick}
                />
              </div>
            );

          case "delivery_header":
            return (
              <SingleAddress
                address={address}
                showShipment={showShipment}
                showPayment={showPayment}
                setShowShipment={setShowShipment}
                setShowPayment={setShowPayment}
                mapApiKey={mapApiKey}
                showGoogleMap={isCheckoutMap}
                isGuestUser={!isLoggedIn}
                isApiLoading={isApiLoading}
                getTotalValue={payment?.getTotalValue}
                showPaymentOptions={showPaymentOptions}
                acceptOrder={order?.enabled}
                isCreditNoteApplied={isCreditNoteApplied}
              ></SingleAddress>
            );

          case "order_summary":
            return (
              <div>
                <SinglePageShipment
                  customClassName={styles.customStylesShipment}
                  shipments={shipments}
                  isShipmentLoading={isShipmentLoading}
                  showPaymentOptions={showPaymentOptions}
                  showShipment={showShipment}
                  showPayment={showPayment}
                  setShowShipment={setShowShipment}
                  setShowPayment={setShowPayment}
                  buybox={buybox}
                  payment={payment}
                  availableFOCount={fulfillment_option?.count || 1}
                  totalValue={currencyFormat(
                    totalPrice,
                    payment?.getCurrencySymbol || bagData?.currency?.symbol || "₹",
                    formatLocale(locale, countryCode, true)
                  )}
                  onPriceDetailsClick={onPriceDetailsClick}
                  isCartValid={isCartValid}
                  redirectPaymentOptions={redirectPaymentOptions}
                  getDeliveryPromise={(promise) =>
                    getFormattedPromise(promise?.iso)
                  }
                  loader={loader}
                ></SinglePageShipment>
              </div>
            );

          case "payment_method":
            return (
              <CheckoutPayment
                payment={payment}
                showPayment={showPayment}
                loader={loader}
                onPriceDetailsClick={onPriceDetailsClick}
                breakUpValues={breakupValues}
                showPaymentOptions={showPaymentOptions}
                setCancelQrPayment={setCancelQrPayment}
                onFailedGetCartShipmentDetails={onFailedGetCartShipmentDetails}
                isCouponApplied={successCoupon?.is_applied}
                redirectPaymentOptions={redirectPaymentOptions}
                setMopPayload={setMopPayload}
                isCouponValid={isCouponValid}
                setIsCouponValid={setIsCouponValid}
                inValidCouponData={inValidCouponData}
              ></CheckoutPayment>
            );

          case "coupons":
            return (
              <Coupon
                successCoupon={successCoupon}
                availableCouponList={availableCouponList}
                {...restCouponProps}
                currencySymbol={currencySymbol}
                handleRemoveQr={cancelQrPayment}
                isCreditNoteApplied={isCreditNoteApplied}
              />
            );

          case "comment":
            return <Comment {...cartComment} />;

          case "price_breakup":
            return (
              <>
                <PriceBreakup
                  customClassName={styles.customStyles}
                  breakUpValues={breakupValues}
                  cartItemCount={bagData?.items?.length}
                  currencySymbol={currencySymbol}
                  isLoading={isApiLoading}
                />
              </>
            );

          case "place_order":
            return (
              <>
                <ZeroPayButton
                  payment={payment}
                  showPayment={showPayment}
                  loader={loader}
                  onPriceDetailsClick={onPriceDetailsClick}
                  isCreditNoteApplied={isCreditNoteApplied}
                />
                {getTotalValue?.() === 0 &&
                  isCreditNoteApplied &&
                  showPayment && (
                    <FyButton
                      onClick={handlePlaceOrder}
                      className={styles.placeOrderBtn}
                      fullWidth
                    >
                      {!isPaymentLoading ? "PLACE ORDER" : loader}
                    </FyButton>
                  )}
              </>
            );
          case "trust_badges":
            return (
              <>
                <TrustBadges />
              </>
            );

          default:
            return <div key={key}>Invalid block</div>;
        }
      })}
    </div>
  );
}

export const settings = {
  label: "Checkout",
  props: [],
  blocks: [
    {
      type: "stepper",
      name: "Stepper",
      props: [
        {
          type: "header",
          value: "Applicable for only mobile & tablet views",
        },
      ],
    },
    {
      type: "delivery_header",
      name: "Delivery Header",
      props: [],
    },
    {
      type: "order_summary",
      name: "Order Summary",
      props: [],
    },
    {
      type: "payment_method",
      name: "Payment Method",
      props: [],
    },
    {
      type: "coupons",
      name: "Coupons",
      props: [],
    },
    {
      type: "comment",
      name: "Comment",
      props: [],
    },
    {
      type: "price_breakup",
      name: "Price Breakup",
      props: [],
    },
    {
      type: "place_order",
      name: "Place Order Button",
      props: [],
    },
    {
      type: "trust_badges",
      name: "Trust Badges",
      props: [],
    },
  ],
};

export default Component;
