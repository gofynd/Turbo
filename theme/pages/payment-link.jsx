import React, { useEffect, useMemo, useCallback, useState } from "react";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import CheckoutPayment from "@gofynd/theme-template/page-layouts/single-checkout/payment/checkout-payment.js";
import "@gofynd/theme-template/pages/checkout/checkout.css";
import usePayment from "../page-layouts/single-checkout/payment/usePayment";
import Loader from "../components/loader/loader";
import styles from "../styles/payment-link.less";
import GatewayIcon from "../assets/images/trust-gateway.png";
import LinkExpired from "../components/payment-link/link-expired";
import PaymentLinkLoader from "../components/payment-link/payment-link-loader";
import { currencyFormat } from "../helper/utils";
import CountDown from "../components/payment-link/countDown";

function PaymentLink({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const bagData = useGlobalStore(fpi?.getters?.CART_ITEMS) || {};

  const CONFIGURATION = useGlobalStore(fpi.getters.CONFIGURATION);
  const [showPayment, setShowPayment] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  const {
    setIsLoading,
    linkPaymentModeOptions,
    paymentLinkData,
    isApiLoading,
    getLinkOrderDetails,
    ...payment
  } = usePayment(fpi);

  const currencySymbol = useMemo(
    () => bagData?.currency?.symbol || "₹",
    [bagData?.currency?.symbol]
  );

  // Memoize all non-changing objects/functions
  const memoizedPayment = useMemo(() => payment, [payment]);
  const memoizedLoader = useCallback(() => <Loader />, []);

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
  }, [fpi]);

  if (isApiLoading) {
    return <PaymentLinkLoader />;
  }

  return (
    <>
      {paymentLinkData?.external_order_id && !linkExpired ? (
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
                <img src={GatewayIcon} alt="Gateway Icon" />
                <p className={`${styles.headerChildText} fontBody`}>
                  {t("resource.common.fynd_trusted_gateway")}
                </p>
              </div>
            </div>
            <CountDown
              customClassName={styles.timerBox}
              paymentLinkData={paymentLinkData}
              setLinkExpired={setLinkExpired}
            />
          </div>
          <div className={styles.paymentHeader}>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text} ${styles.textWidth}`}>
                {t("resource.payment_link.order_id")}
              </p>
              <p className={`${styles.orderId} fontBody ${styles.text}`}>
                {paymentLinkData?.external_order_id ?? ""}
              </p>
            </div>
            <div className={styles.box}>
              <p className={`fontBody ${styles.text}  ${styles.textWidth}`}>
                {t("resource.common.amount")}
              </p>
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
            currencySymbol={currencySymbol}
            payment={memoizedPayment}
            showShipment={false}
            showPayment={true}
            setShowPayment={setShowPayment}
            showPaymentOptions={true}
            loader={memoizedLoader}
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
