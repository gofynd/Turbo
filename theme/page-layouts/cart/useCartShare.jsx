import React, { useState } from "react";
import { useSnackbar } from "../../helper/hooks";
import { copyToClipboard } from "../../helper/utils";
import { GET_CART_SHARE_LINK, GET_URL_QR_CODE } from "../../queries/cartQuery";
import { useGlobalTranslation } from "fdk-core/utils";

const useCartShare = ({ fpi, cartData }) => {
  const { t } = useGlobalTranslation("translation");
  const [isShareLoading, setIsShareLoading] = useState(true);
  const [shareLink, setShareLink] = useState("");
  const [qrCode, setQrCode] = useState("");

  const { showSnackbar } = useSnackbar();

  const onShareClick = () => {
    setIsShareLoading(true);
    const payload = {
      getShareCartLinkRequestInput: {
        id: cartData?.id.toString(),
      },
    };
    fpi.executeGQL(GET_CART_SHARE_LINK, payload).then((res) => {
      if (res?.data?.getCartShareLink?.share_url) {
        const qrPayload = {
          url: res?.data?.getCartShareLink?.share_url,
        };
        fpi.executeGQL(GET_URL_QR_CODE, qrPayload).then((qrRes) => {
          if (qrRes?.data?.getUrlQRCode?.svg) {
            setQrCode(qrRes?.data?.getUrlQRCode?.svg);
            setShareLink(res?.data?.getCartShareLink?.share_url);
          }
          setIsShareLoading(false);
        });
      }
    });
  };

  const onCopyToClipboardClick = (e) => {
    e.stopPropagation();
    copyToClipboard(shareLink);
    showSnackbar(t("resource.cart.link_copied"), "success");
  };

  const onFacebookShareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const facebookWindow = window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${shareLink}`,
      "facebook-popup",
      "height=350,width=600"
    );
    if (facebookWindow.focus) {
      facebookWindow.focus();
    }
    return false;
  };

  const onTwitterShareClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    const twitterWindow = window.open(
      `https://twitter.com/share?url=${shareLink}`,
      "twitter-popup",
      "height=350,width=600"
    );
    if (twitterWindow.focus) {
      twitterWindow.focus();
    }
    return false;
  };

  return {
    isShareLoading,
    qrCode,
    onShareClick,
    onCopyToClipboardClick,
    onFacebookShareClick,
    onTwitterShareClick,
  };
};

export default useCartShare;
