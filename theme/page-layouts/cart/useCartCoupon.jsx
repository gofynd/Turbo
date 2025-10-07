import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import couponSuccessGif from "../../assets/images/coupon-success.gif";
import {
  APPLY_COUPON,
  REMOVE_COUPON,
  VALIDATE_COUPON,
} from "../../queries/cartQuery";
import { fetchCartDetails } from "./useCart";

const useCartCoupon = ({
  fpi,
  cartData,
  showPaymentOptions = () => {},
  setShowPayment = () => {},
  setShowShipment = () => {},
  currentStepIdx = null,
  setIsLoading = () => {},
  setCheckoutAmount = () => {},
  mopPayload = {},
}) => {
  const { t } = useGlobalTranslation("translation");
  const coupons = useGlobalStore(fpi.getters.COUPONS);

  const [isCouponListModalOpen, setIsCouponListModalOpen] = useState(false);
  const [isCouponSuccessModalOpen, setIsCouponSuccessModalOpen] =
    useState(false);
  const [error, setError] = useState(null);
  const [isCouponValid, setIsCouponValid] = useState(true);
  const [inValidCouponData, setInvalidCouponData] = useState({});
  const [searchParams] = useSearchParams();

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  const { breakup_values: breakUpValues } = cartData;
  const couponAttrs = useMemo(() => {
    let attrs = {
      title: t("resource.cart.coupons_title"),
    };
    if (breakUpValues?.coupon?.is_applied && breakUpValues?.coupon?.code) {
      attrs = {
        ...attrs,
        couponCode: breakUpValues?.coupon?.code,
        couponValue: breakUpValues?.coupon?.value || 0,
        couponId: breakUpValues?.coupon?.uid,
        hasCancel: true,
      };
    } else {
      attrs = { ...attrs, subtitle: t("resource.cart.view_all_offers") };
    }
    return attrs;
  }, [breakUpValues]);

  const onCouponBoxClick = () => {
    setIsCouponListModalOpen(true);
  };

  const onCouponListCloseModalClick = () => {
    setIsCouponListModalOpen(false);
  };

  const onCouponSuccessCloseModalClick = () => {
    setIsCouponSuccessModalOpen(false);
  };

  const validateCoupon = async (payload) => {
    const res = await fpi.executeGQL(VALIDATE_COUPON, payload);
    setInvalidCouponData({
      title: res?.data?.validateCoupon?.coupon_validity?.title,
      message: res?.data?.validateCoupon?.coupon_validity?.display_message_en,
    });
    setIsCouponValid(res?.data?.validateCoupon?.coupon_validity?.valid);
  };

  const couponPaymentOptions = (data) => {
    const totalItem = data?.data?.cart?.breakup_values?.display?.find(
      (item) => item.key === "total"
    );
    const finalAmount =
      totalItem && typeof totalItem.value === "number"
        ? Math.abs(totalItem.value)
        : 0;
    if (finalAmount === 0) {
      setShowPayment(false);
      setShowShipment(true);
    }
    setCheckoutAmount((prev) => {
      if (prev === 0) {
        showPaymentOptions(finalAmount);
        return finalAmount;
      } else {
        setIsLoading(false);
        return finalAmount;
      }
    });
  };

  const onApplyCouponClick = (couponCode) => {
    const payload = {
      applyCouponRequestInput: { coupon_code: couponCode?.toString() },
      applyCouponId: cartData?.id?.toString(),
      buyNow,
    };

    fpi
      .executeGQL(APPLY_COUPON, payload)
      .then((res) => {
        const couponBreakup =
          res?.data?.applyCoupon?.breakup_values?.coupon || {};
        if (!(couponBreakup?.code && couponBreakup?.is_applied)) {
          throw new Error(couponBreakup?.message || "Coupon not applied");
        }
        if (mopPayload) {
          validateCoupon(mopPayload);
        }
        fpi.custom.setValue("isCouponApplied", couponBreakup.is_applied);
        setIsLoading(true);
        setError(null);
        setIsCouponListModalOpen(false);
        setIsCouponSuccessModalOpen(true);

        // IMPORTANT: return the promise so the next .then waits
        return fetchCartDetails(fpi, { buyNow });
      })
      .then((data) => {
        if (currentStepIdx >= 1) {
          couponPaymentOptions(data);
        }
        setIsLoading(false);
        setTimeout(() => setIsCouponSuccessModalOpen(false), 2000);
      })
      .catch((err) => {
        console.error("Error applying coupon or fetching cart:", err);
        setError({ message: t("resource.common.error_message") });
        setIsLoading(false);
      });
  };

  const onRemoveCouponClick = (couponId) => {
    const payload = {
      removeCouponId: couponId?.toString(),
      buyNow,
    };
    fpi
      .executeGQL(REMOVE_COUPON, payload)
      .then((res) => {
        const isApplied = res?.data?.removeCoupon?.coupon?.is_applied;
        if (currentStepIdx === 2) {
          setIsLoading(true);
          setShowPayment(true);
          setShowShipment(false);
        }
        fpi.custom.setValue("isCouponApplied", isApplied);
        return fetchCartDetails(fpi, { buyNow });
      })
      .then((data) => {
        couponPaymentOptions(data);
      })
      .catch((err) => {
        setIsLoading(false);
        console.error("Error removing coupon or fetching cart:", err);
        setError({ message: t("resource.common.error_message") });
      });
  };
  return {
    ...couponAttrs,
    isCouponListModalOpen,
    isCouponSuccessModalOpen,
    availableCouponList: coupons?.available_coupon_list,
    error,
    successCoupon: breakUpValues?.coupon,
    couponSuccessGif,
    onCouponBoxClick,
    onCouponListCloseModalClick,
    onCouponSuccessCloseModalClick,
    onApplyCouponClick,
    onRemoveCouponClick,
    isCouponValid,
    setIsCouponValid,
    inValidCouponData,
  };
};

export default useCartCoupon;
