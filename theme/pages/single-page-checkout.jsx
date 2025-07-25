import React, { useEffect, useState, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useSearchParams } from "react-router-dom";
import CheckoutPage from "@gofynd/theme-template/pages/checkout/checkout";
import "@gofynd/theme-template/pages/checkout/checkout.css";
import { CHECKOUT_LANDING, PAYMENT_OPTIONS } from "../queries/checkoutQuery";
import { useHyperlocalTat, useGoogleMapConfig } from "../helper/hooks";
import useAddress from "../page-layouts/single-checkout/address/useAddress";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import useCart from "../page-layouts/cart/useCart";
import Loader from "../components/loader/loader";
import useCartCoupon from "../page-layouts/cart/useCartCoupon";
import useCartComment from "../page-layouts/cart/useCartComment";

function SingleCheckoutPage({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};
  const { shipments } = useGlobalStore(fpi.getters.SHIPMENTS) || {};
  const isLoggedIn = useGlobalStore(fpi.getters.LOGGED_IN);
  const { buybox } = useGlobalStore(fpi.getters.APP_FEATURES);
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

  const { isHyperlocal, convertUTCToHyperlocalTat } = useHyperlocalTat({ fpi });
  const { isGoogleMap, mapApiKey } = useGoogleMapConfig({ fpi });
  const [searchParams, setSearchParams] = useSearchParams();
  const cart_id = searchParams.get("id");
  const buy_now = searchParams.get("buy_now") || false;
  const address_id = searchParams.get("address_id");
  const cartCoupon = useCartCoupon({ fpi, cartData: bagData });
  const cartComment = useCartComment({ fpi, cartData: bagData });
  const { setIsLoading, ...payment } = usePayment(fpi);
  const { getTotalValue } = payment;

  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData]
  );

  useEffect(() => {
    if (cartData?.id) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("id", cartData?.id);
      setSearchParams(newParams);
    }
  }, [cartData?.id]);

  useEffect(() => {
    setIsLoading(true);
    setIsApiLoading(true);
    const payload = {
      buyNow: buy_now === "true",
      includeAllItems: true,
      includeBreakup: true,
    };
    const fetchCheckoutData = async () => {
      try {
        const res = await fpi.executeGQL(CHECKOUT_LANDING, payload);

        const paymentPayload = {
          pincode: localStorage?.getItem("pincode") || "",
          cartId: cart_id,
          checkoutMode: "self",
          amount:
            (res?.data?.cart?.breakup_values?.display[
              res?.data?.cart?.breakup_values?.display?.length - 1
            ]?.value || 0) * 100,
        };
        await fpi.executeGQL(PAYMENT_OPTIONS, paymentPayload);
      } catch (err) {
        console.error("checkout error", err);
      } finally {
        setIsApiLoading(false);
        setIsLoading(false);
      }
    };

    fetchCheckoutData();
  }, [fpi, buy_now]);

  function showPaymentOptions() {
    setShowShipment(false);
    showPaymentHandler(true);
  }

  function showPaymentHandler(flag) {
    setShowPayment(flag);
    if (flag) {
      setCurrentStepIdx(2);
    }
  }

  function showShipmentHandler(flag) {
    setShowShipment(flag);
    if (flag) {
      setCurrentStepIdx(1);
    }
  }
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

  useEffect(() => {
    if (address_id?.length && address?.allAddresses?.length) {
      address?.selectAddress();
    }
  }, []);

  const addressId = useMemo(() => {
    return address?.getDefaultAddress?.find(
      ({ is_default_address }) => is_default_address
    )?.id;
  }, [address.getDefaultAddress]);

  useEffect(() => {
    if (addressId) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("address_id", addressId);
      setSearchParams(newParams);
    }
  }, [addressId]);

  return (
    <>
      <CheckoutPage
        fpi={fpi}
        breakupValues={breakupValues}
        cartItemsCount={bagData?.items?.length}
        currencySymbol={currencySymbol}
        address={{ ...address, isAddressLoading: isApiLoading }}
        payment={payment}
        showShipment={showShipment}
        showPayment={showPayment}
        cartCouponProps={{
          ...cartCoupon,
        }}
        isGuestUser={!isLoggedIn}
        cartCommentProps={cartComment}
        setShowPayment={setShowPayment}
        setShowShipment={showShipmentHandler}
        onPriceDetailsClick={onPriceDetailsClick}
        shipments={shipments}
        isShipmentLoading={isShipmentLoading}
        showPaymentOptions={() => {
          showPaymentOptions();
        }}
        stepperProps={{ steps, currentStepIdx }}
        // mapApiKey={"AIzaSyAVCJQAKy6UfgFqZUNABAuGQp2BkGLhAgI"}
        showGoogleMap={isGoogleMap}
        mapApiKey={mapApiKey}
        isHyperlocal={isHyperlocal}
        convertHyperlocalTat={convertUTCToHyperlocalTat}
        loader={<Loader />}
        buybox={buybox}
        isCartValid={isCartValid}
      />
      {/* <PriceBreakup breakUpValues={breakupValues}></PriceBreakup> */}
    </>
  );
}

export const sections = JSON.stringify([]);

export default SingleCheckoutPage;
