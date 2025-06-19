import React, { useEffect, useState, useMemo } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { useParams } from "react-router-dom";
import CheckoutPayment from "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment.js";
import "@gofynd/theme-template/pages/checkout/checkout.css";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import Loader from "../components/loader/loader";
import styles from "../styles/payment-link.less";
import GatewayIcon from "../assets/images/trust-gateway.svg";
import LinkExpired from "../components/payment-link/link-expired";
import PaymentLinkLoader from "../components/payment-link/payment-link-loader";
import { currencyFormat } from "../helper/utils";
import Timer from "../assets/images/timer-count-down.svg";

function PaymentLink({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};

  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const [showPayment, setShowPayment] = useState(false);
  // const { onPriceDetailsClick } = useCart(fpi);

  const {
    setIsLoading,
    linkPaymentModeOptions,
    paymentLinkData,
    isApiLoading,
    getLinkOrderDetails,
    ...payment
  } = usePayment(fpi);

  const [secondsLeft, setSecondsLeft] = useState(null);
  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData]
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        getLinkOrderDetails();
        linkPaymentModeOptions();
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [fpi, secondsLeft === 0]);

  useEffect(() => {
    if (paymentLinkData?.polling_timeout) {
      setSecondsLeft(paymentLinkData.polling_timeout);
    }
  }, [paymentLinkData?.polling_timeout]);

  useEffect(() => {
    if (secondsLeft === null || secondsLeft <= 0) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsLeft !== null]);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  if (isApiLoading) {
    return <PaymentLinkLoader />;
  }
  return (
    <>
      {paymentLinkData?.external_order_id ? (
        <div
          className={`${styles.mainContainer} basePageContainer margin0auto`}
        >
          <div className={`${styles.logoHeader} ${styles.paymentHeader}`}>
            <img
              src={CONFIGURATION.application.logo?.secure_url?.replace(
                "original",
                "resize-h:32"
              )}
              alt="name"
            />
            <div className={styles.logoTextContainer}>
              <p className={`fontHeader`}>{t("resource.common.fynd")}</p>
              <div className={styles.gatewayContainer}>
                <GatewayIcon />
                <p className={`${styles.headerChildText} fontBody`}>
                  {t("resource.common.fynd_trusted_gateway")}
                </p>
              </div>
            </div>
            {secondsLeft !== null && (
              <div className={styles.timerBox}>
                <Timer />
                <span>{formatTime(secondsLeft)}</span>
              </div>
            )}
          </div>
          <div className={styles.paymentHeader}>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text} ${styles.textWidth}`}>
                {t("resource.payment_link.order_id")}
              </p>{" "}
              <p className={`${styles.orderId} fontBody ${styles.text}`}>
                {paymentLinkData?.external_order_id ?? ""}
              </p>
            </div>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text}  ${styles.textWidth}`}>
                {t("resource.common.amount")}
              </p>{" "}
              <p className={`${styles.orderId} fontBody ${styles.text}`}>
                {paymentLinkData?.amount
                  ? currencyFormat(paymentLinkData?.amount, currencySymbol)
                  : ""}
              </p>
            </div>
          </div>
          <CheckoutPayment
            customClassName={styles.borderTopUnset}
            fpi={fpi}
            // breakupValues={breakupValues}
            // cartItemsCount={bagData?.items?.length}
            currencySymbol={currencySymbol}
            payment={payment}
            showShipment={false}
            showPayment={true}
            setShowPayment={setShowPayment}
            // setShowShipment={showShipmentHandler}
            // onPriceDetailsClick={onPriceDetailsClick}
            // shipments={shipments}
            showPaymentOptions={true}
            loader={<Loader />}
          />
        </div>
      ) : (
        <LinkExpired />
      )}
    </>
  );
}
export const sections = JSON.stringify([]);

export default PaymentLink;
