import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import { CHECKOUT_LANDING, PAYMENT_OPTIONS } from "../queries/checkoutQuery";
import { useGoogleMapConfig, useDeliverPromise } from "../helper/hooks";
import useAddress from "../page-layouts/single-checkout/address/useAddress";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import useCart from "../page-layouts/cart/useCart";
import useCartCoupon from "../page-layouts/cart/useCartCoupon";
import useCartComment from "../page-layouts/cart/useCartComment";
import Loader from "../components/loader/loader";

export function Component({ props = {}, globalConfig = {}, blocks = [] }) {
  const fpi = useFPI();
  const { t } = useGlobalTranslation("translation");
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const { shipments } = useGlobalStore(fpi.getters.SHIPMENTS) || {};
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { buybox, fulfillment_option } = useGlobalStore(
    fpi.getters.APP_FEATURES
  );
  const breakupValues = bagData?.breakup_values?.display || [];
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
  const buy_now = searchParams.get("buy_now") || false;
  const address_id = searchParams.get("address_id");
  const error = searchParams.get("error");
  const transactionFailed = searchParams.get("failed");

  const cartComment = useCartComment({ fpi, cartData: bagData });
  const { setIsLoading, ...payment } = usePayment(fpi);
  const { getTotalValue } = payment;
  const { currentStep = null } = useGlobalStore(fpi.getters.CUSTOM_VALUE);

  const [cancelQrPayment, setCancelQrPayment] = useState(null);
  const [checkoutAmount, setCheckoutAmount] = useState(0);
  const [mopPayload, setMopPayload] = useState("");
  const cart_id = searchParams.get("id");
  const { isLoading, isPaymentLoading = false } = payment;

  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData]
  );

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

  const priceFormatCurrencySymbol = (symbol, price) => {
    const hasAlphabeticCurrency = /^[A-Za-z]+$/.test(symbol);

    const formattedValue = hasAlphabeticCurrency
      ? `${symbol} ${price}`
      : `${symbol}${price}`;

    return formattedValue;
  };

  useEffect(() => {
    if (cartData?.id) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("id", cartData?.id);
      setSearchParams(newParams);
    }
  }, [cartData?.id]);

  async function showPaymentOptions(amount) {
    try {
      setIsLoading(true);
      // setShowShipment(false);
      // showPaymentHandler(true);
      const finalAmount = checkoutAmount ? checkoutAmount : amount;
      const paymentPayload = {
        pincode: localStorage?.getItem("pincode") || "",
        cartId: cart_id,
        checkoutMode: "self",
        amount: finalAmount ? finalAmount * 100 : 0,
      };
      await fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
    } catch (error) {
      console.log(error, "error");
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
    const payload = {
      buyNow: buy_now === "true",
      includeAllItems: true,
      includeBreakup: true,
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
        if ((error || transactionFailed) && amount) {
          showPaymentOptions(amount);
        }
      } catch (err) {
        console.error("checkout error", err);
      } finally {
        setIsApiLoading(false);
      }
    };

    fetchCheckoutData();
  }, [fpi, buy_now]);
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

  const { isShipmentLoading, isCartValid, ...address } = useAddress(
    showShipmentHandler,
    showPaymentHandler,
    fpi
  );

  const { onFailedGetCartShipmentDetails } = address;

  useEffect(() => {
    if (address_id?.length && address?.allAddresses?.length) {
      address?.selectAddress();
    }
  }, []);

  // To be added with zero payment changes
  //  useEffect(() => {
  //    if (getTotalValue?.() === 0 && currentStepIdx !== 0) {
  //      setShowPayment(false);
  //      setShowShipment(true);
  //    }
  //  }, [getTotalValue?.()]);
  const addressId = useMemo(() => {
    return address?.getDefaultAddress?.find(
      ({ is_default_address }) => is_default_address
    )?.id;
  }, [address.getDefaultAddress]);

  const redirectPaymentOptions = () => {
    setIsLoading(true);
    setShowShipment(false);
    showPaymentHandler(true);
  };

  useEffect(() => {
    if (addressId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("address_id", addressId);
      setSearchParams(newParams);
    }
  }, [addressId]);

  const handlePlaceOrder = async () => {
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
  };

  const loader = <Loader customClassName={styles.customizedLoader} />;

  return (
    <div className={`${styles.mainContainer} fontBody`}>
      {blocks?.map((block, index) => {
        const key = `${block.type}_${index}`;

        switch (block.type) {
          case "stepper":
            return (
              <div className={styles["view-mobile"]}>
                <Stepper steps={steps} currentStepIdx={currentStepIdx} />
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
                  totalValue={priceFormatCurrencySymbol(
                    payment?.getCurrencySymbol,
                    payment?.getTotalValue()
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
                />
                {payment?.storeCreditApplied?.isFullyApplied &&
                  showPayment &&
                  !isLoading && (
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
  ],
};

export default Component;
