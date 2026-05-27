import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from "react";
  import { createPortal } from "react-dom";
  import { useGlobalStore, useNavigate } from "fdk-core/utils";
  import useCart from "./useCart";
  import useCartGst from "./useCartGst";
  import useCartCoupon from "./useCartCoupon";
  import Minicart from "../../components/cart/minicart";
  
  let activeMiniCartRendererId = null;
  
  const useMinicart = (fpi, isActive = true) => {
    const navigate = useNavigate();
    const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
    const customValues = useGlobalStore(fpi.getters.CUSTOM_VALUE) || {};
    const lastMiniCartTrigger = useRef(null);
    const cartState = useCart(fpi, isActive && isMiniCartOpen);
    const cartGst = useCartGst({ fpi, cartData: cartState.cartData });
    const cartCoupon = useCartCoupon({ fpi, cartData: cartState.cartData });
    const miniCartPropsRef = useRef(null);
    const rendererIdRef = useRef(Symbol("MiniCartRenderer"));
    const MiniCartRenderer = useMemo(
      () =>
        function MiniCartRenderer() {
          const [isPrimaryRenderer, setIsPrimaryRenderer] = useState(() => {
            if (activeMiniCartRendererId === null) {
              activeMiniCartRendererId = rendererIdRef.current;
              return true;
            }
            return activeMiniCartRendererId === rendererIdRef.current;
          });
  
          useEffect(() => {
            if (activeMiniCartRendererId === null) {
              activeMiniCartRendererId = rendererIdRef.current;
              setIsPrimaryRenderer(true);
            }
  
            return () => {
              if (activeMiniCartRendererId === rendererIdRef.current) {
                activeMiniCartRendererId = null;
              }
            };
          }, []);
  
          const props = miniCartPropsRef.current;
          if (!isPrimaryRenderer || !props?.isOpen) return null;
          if (typeof document === "undefined") return null;
  
          return createPortal(
            <React.Suspense fallback={<div />}>
              <Minicart {...props} />
            </React.Suspense>,
            document.body
          );
        },
      []
    );
  
    const miniCartItems = useMemo(
      () => cartState.cartItemsWithActualIndex || cartState.cartData?.items || [],
      [cartState.cartItemsWithActualIndex, cartState.cartData?.items]
    );
  
    const breakupValues = useMemo(
      () => cartState.breakUpValues?.display || [],
      [cartState.breakUpValues?.display]
    );
  
    const getBreakupValue = useCallback(
      (key) => breakupValues.find(({ key: breakupKey }) => breakupKey === key),
      [breakupValues]
    );
  
    const totalPrice = useMemo(
      () =>
        getBreakupValue("total")?.value ??
        cartState.breakUpValues?.total ??
        null,
      [getBreakupValue, cartState.breakUpValues?.total]
    );
  
    const subTotal = useMemo(
      () =>
        getBreakupValue("subtotal")?.value ??
        getBreakupValue("sub_total")?.value ??
        cartState.breakUpValues?.subtotal ??
        null,
      [
        getBreakupValue,
        cartState.breakUpValues?.subtotal,
        cartState.breakUpValues,
      ]
    );
  
    const openMiniCart = useCallback(() => {
      if (!isActive) return;
      setIsMiniCartOpen(true);
    }, [isActive]);
    const closeMiniCart = useCallback(() => {
      if (!isActive) return;
      setIsMiniCartOpen(false);
    }, [isActive]);
    const toggleMiniCart = useCallback(() => {
      if (!isActive) return;
      setIsMiniCartOpen((prev) => !prev);
    }, [isActive]);
  
    useEffect(() => {
      if (!isActive) return;
      if (
        customValues?.openMiniCartTrigger &&
        customValues?.openMiniCartTrigger !== lastMiniCartTrigger.current
      ) {
        lastMiniCartTrigger.current = customValues.openMiniCartTrigger;
        openMiniCart();
      }
    }, [customValues?.openMiniCartTrigger, isActive, openMiniCart]);
  
    const onViewCart = useCallback(() => {
      if (!isActive) return;
      closeMiniCart();
      navigate("/cart/bag");
    }, [isActive, closeMiniCart, navigate]);
  
    const onCheckout = useCallback(() => {
      if (!isActive) return;
      closeMiniCart();
      cartState.onGotoCheckout();
    }, [isActive, closeMiniCart, cartState.onGotoCheckout]);
  
    const miniCartProps = useMemo(
      () =>
        isActive
          ? {
              isOpen: isMiniCartOpen,
              onClose: closeMiniCart,
              onCheckout,
              onViewCart,
              miniCartItems,
              miniCartSummary: {
                totalPrice,
                subTotal,
              },
              miniCartBreakupValues: breakupValues,
              currencySymbol: cartState.currencySymbol,
              isCartUpdating: cartState.isCartUpdating,
              onUpdateCartItems: cartState.onUpdateCartItems,
              cartItemCount: cartState.cartItemCount,
              isValid: cartState.isValid,
              isNotServicable: cartState.isNotServicable,
              isOutOfStock: cartState.isOutOfStock,
              isLoading: cartState.isLoading,
              availableCouponList: cartCoupon?.availableCouponList || [],
              onApplyCoupon: cartCoupon?.onApplyCouponClick,
              couponError: cartCoupon?.error,
              appliedCoupon: cartCoupon?.successCoupon,
              title: cartCoupon?.title,
              subtitle: cartCoupon?.subtitle,
              couponId: cartCoupon?.couponId,
              couponCode: cartCoupon?.couponCode,
              couponValue: cartCoupon?.couponValue,
              hasCancel: cartCoupon?.hasCancel,
              isCouponListModalOpen: cartCoupon?.isCouponListModalOpen,
              onCouponBoxClick: cartCoupon?.onCouponBoxClick,
              onCouponListCloseModalClick: cartCoupon?.onCouponListCloseModalClick,
              couponSuccessGif: cartCoupon?.couponSuccessGif,
              isCouponSuccessModalOpen: cartCoupon?.isCouponSuccessModalOpen,
              onCouponSuccessCloseModalClick:
                cartCoupon?.onCouponSuccessCloseModalClick,
              onRemoveCouponClick: cartCoupon?.onRemoveCouponClick,
              successCoupon: cartCoupon?.successCoupon,
              gstDetails: cartGst,
              isGstInput: cartState.isGstInput,
            }
          : null,
      [
        isActive,
        isMiniCartOpen,
        closeMiniCart,
        cartState.onGotoCheckout,
        onViewCart,
        miniCartItems,
        totalPrice,
        subTotal,
        breakupValues,
        cartState.currencySymbol,
        cartState.isCartUpdating,
        cartState.onUpdateCartItems,
        cartState.cartItemCount,
        cartState.isValid,
        cartState.isNotServicable,
        cartState.isOutOfStock,
        cartState.isLoading,
        cartCoupon?.availableCouponList,
        cartCoupon?.onApplyCouponClick,
        cartCoupon?.error,
        cartCoupon?.successCoupon,
        cartCoupon?.title,
        cartCoupon?.subtitle,
        cartCoupon?.couponId,
        cartCoupon?.couponCode,
        cartCoupon?.couponValue,
        cartCoupon?.hasCancel,
        cartCoupon?.isCouponListModalOpen,
        cartCoupon?.onCouponBoxClick,
        cartCoupon?.onCouponListCloseModalClick,
        cartCoupon?.couponSuccessGif,
        cartCoupon?.isCouponSuccessModalOpen,
        cartCoupon?.onCouponSuccessCloseModalClick,
        cartCoupon?.onRemoveCouponClick,
        cartGst,
        cartState.isGstInput,
      ]
    );
  
    miniCartPropsRef.current = miniCartProps;
  
    return {
      ...cartState,
      miniCartItems,
      miniCartBreakupValues: breakupValues,
      miniCartSummary: {
        totalPrice,
        subTotal,
      },
      gstDetails: cartGst,
      isMiniCartOpen,
      openMiniCart,
      closeMiniCart,
      toggleMiniCart,
      onViewCart,
      cartCoupon,
      miniCartProps,
      MiniCartRenderer,
    };
  };
  
  export default useMinicart;
  