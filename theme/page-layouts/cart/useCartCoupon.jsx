import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useGlobalStore } from "fdk-core/utils";
import couponSuccessGif from "../../assets/images/coupon-success.gif";
import { APPLY_COUPON, REMOVE_COUPON } from "../../queries/cartQuery";
import { fetchCartDetails } from "./useCart";

const useCartCoupon = ({ fpi, cartData }) => {
  const coupons = useGlobalStore(fpi.getters.COUPONS);

  const [isCouponListModalOpen, setIsCouponListModalOpen] = useState(false);
  const [isCouponSuccessModalOpen, setIsCouponSuccessModalOpen] =
    useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");
  const { breakup_values: breakUpValues } = cartData;
  const couponAttrs = useMemo(() => {
    let attrs = {
      title: "COUPONS",
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
      attrs = { ...attrs, subtitle: "View all offers" };
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

  const onApplyCouponClick = (couponCode) => {
    const payload = {
      applyCouponRequestInput: {
        coupon_code: couponCode?.toString(),
      },
      applyCouponId: cartData?.id?.toString(),
      buyNow,
    };
    fpi.executeGQL(APPLY_COUPON, payload).then((res) => {
      const couponBreakup =
        res?.data?.applyCoupon?.breakup_values?.coupon || {};
      if (couponBreakup?.code && couponBreakup?.is_applied) {
        fpi.custom.setValue("isCouponApplied", couponBreakup?.is_applied);
        setError(null);
        setIsCouponListModalOpen(false);
        setIsCouponSuccessModalOpen(true);
        fetchCartDetails(fpi, { buyNow });

        const id = setTimeout(() => {
          setIsCouponSuccessModalOpen(false);

          clearTimeout(id);
        }, 2000);
      } else {
        setError({ message: couponBreakup?.message || "Something went wrong" });
      }
    });
  };

  const onRemoveCouponClick = (couponId) => {
    const payload = {
      removeCouponId: couponId?.toString(),
      buyNow,
    };
    fpi.executeGQL(REMOVE_COUPON, payload).then((res) => {
      const isApplied = res?.data?.removeCoupon?.coupon?.is_applied;
      fpi.custom.setValue("isCouponApplied", isApplied);
      fetchCartDetails(fpi, { buyNow });
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
  };
};

export default useCartCoupon;
