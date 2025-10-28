import React from "react";
import { motion } from "framer-motion";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import styles from "../styles/order-list.less";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";
import OrdersHeader from "@gofynd/theme-template/components/order-header/order-header";
import "@gofynd/theme-template/components/order-header/order-header.css";
import OrderShipment from "@gofynd/theme-template/components/order-shipment/order-shipment";
import "@gofynd/theme-template/components/order-shipment/order-shipment.css";
import Loader from "../components/loader/loader";
import ProfileRoot from "../components/profile/profile-root";
import EmptyState from "../components/empty-state/empty-state";
import { isLoggedIn } from "../helper/auth-guard";
import { getGroupedShipmentBags } from "../helper/utils";
import { useThemeConfig } from "../helper/hooks";

function OrdersList({ fpi }) {
  const { globalConfig } = useThemeConfig({ fpi });
  const { t } = useGlobalTranslation("translation");
  const { isLoading, orders, handelBuyAgain } = useOrdersListing(fpi);
  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);
  const orderShipments = orders;
  const getOrdersCount = () => {
    const itemTotal = orderShipments?.page?.item_total;

    if (itemTotal) {
      return `(${itemTotal} ${
        itemTotal === 1
          ? t("resource.order.list.orders_count_singular_suffix")
          : t("resource.order.list.orders_count_suffix")
      })`;
    } else {
      return "";
    }
  };

  return (
    <ProfileRoot fpi={fpi}>
      {isLoading ? (
        <Loader />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 0.5 } },
          }}
          initial="hidden"
          animate="visible"
          className="basePageContainer margin0auto"
        >
          <>
            <OrdersHeader
              filters={orderShipments?.filters}
              title={t("resource.order.list.my_orders")}
              subtitle={getOrdersCount()}
              customClassName={styles.header}
              flag={true}
            ></OrdersHeader>

            {orderShipments?.items?.length === 0 ? (
              <div className={`${styles.error}`}>
                <EmptyState
                  title={t("resource.common.empty_state")}
                ></EmptyState>
              </div>
            ) : (
              <div className={`${styles.myOrders}`}>
                {orderShipments?.items?.map((item, index) => (
                  <OrderShipment
                    key={index}
                    orderInfo={item}
                    getGroupedShipmentBags={getGroupedShipmentBags}
                    globalConfig={globalConfig}
                    onBuyAgainClick={handelBuyAgain}
                    isBuyAgainEligible={true}
                    availableFOCount={fulfillment_option?.count || 1}
                  ></OrderShipment>
                ))}
              </div>
            )}
          </>
        </motion.div>
      )}
    </ProfileRoot>
  );
}

OrdersList.authGuard = isLoggedIn;
export const sections = JSON.stringify([]);

export default OrdersList;
