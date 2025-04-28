import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CART_META_UPDATE } from "../../queries/cartQuery";
import { useGlobalTranslation } from "fdk-core/utils";

const GST_NUMBER_LENGTH = 15;
const EMPTY_GST = "Enter GST no to claim input credits";
const GST_APPLIED = "You can claim 250 GST input credit";
const INVALID_GST = "Invalid GST number";

const useCartGst = ({ fpi, cartData }) => {
  const { t } = useGlobalTranslation("translation");
  const [gstNumber, setGstNumber] = useState(cartData?.gstin || "");
  const [isApplied, setIsApplied] = useState(!!cartData?.gstin);
  const [error, setError] = useState({});
  const [searchParams] = useSearchParams();

  const gstCharges = cartData?.breakup_values?.raw?.gst_charges;
  const buyNow = JSON.parse(searchParams?.get("buy_now") || "false");

  useEffect(() => {
    if (cartData) {
      setGstNumber(cartData?.gstin || "");
      setIsApplied(!!cartData.gstin);
    }
  }, [cartData]);

  const applyGST = (gstin) => {
    const payload = {
      updateCartMetaId: cartData?.id?.toString(),
      cartMetaRequestInput: {
        gstin,
      },
      buyNow,
    };
    return fpi.executeGQL(CART_META_UPDATE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.updateCartMeta;
    });
  };

  const removeGST = () => {
    const payload = {
      updateCartMetaId: cartData?.id?.toString(),
      cartMetaRequestInput: {
        gstin: "",
      },
      buyNow,
    };
    return fpi.executeGQL(CART_META_UPDATE, payload).then((res) => {
      if (res?.errors) {
        throw res?.errors?.[0];
      }
      return res?.data?.updateCartMeta;
    });
  };

  const onGstChange = (gst) => {
    setGstNumber(gst);
    if (gst?.length === GST_NUMBER_LENGTH) {
      setError({});
      applyGST(gst)
        .then((res) => {
          setIsApplied(!!res?.is_valid);
        })
        .catch((err) => {
          setError({ message: err?.message || t("resource.common.error_message") });
        });
    } else if (
      gst?.length > GST_NUMBER_LENGTH ||
      gst?.length < GST_NUMBER_LENGTH ||
      gst?.length === 0
    ) {
      setIsApplied(false);
      setError({ message: t("resource.common.invalid_gstin") });
    }
  };

  const onRemoveGstClick = () => {
    if (gstNumber.length === GST_NUMBER_LENGTH && isApplied) {
      removeGST().then((res) => {
        const isValid = !!res?.is_valid;
        if (isValid) {
          setIsApplied(!isValid);
          setGstNumber("");
        }
      });
    } else {
      setGstNumber("");
    }
  };

  return {
    gstNumber,
    gstCharges,
    isApplied,
    error,
    onGstChange,
    onRemoveGstClick,
  };
};

export default useCartGst;
