import React from "react";
import {
  useGlobalTranslation,
  useGlobalStore,
  useFPI,
  useNavigate,
} from "fdk-core/utils";
import { useLocation } from "react-router-dom";
import styles from "./styles/order-shipment.less";
import { formatLocale } from "../../helper/utils";

//force GIF to /original/ ---
const isGifUrl = (url = "") => /\.gif(\?|#|$)/i.test(String(url || ""));
const toOriginalVariant = (url = "") => {
  if (!url) return url;
  if (url.includes("/original/")) return url;
  return url.replace(/\/\d+x\d+\//, "/original/");
};

function OrderShipment({
  orderInfo,
  onBuyAgainClick = () => {},
  isBuyAgainEligible,
}) {
  const fpi = useFPI();
  const { language, countryCode } = useGlobalStore(fpi.getters.i18N_DETAILS);
  const locale = language?.locale;
  const { t } = useGlobalTranslation("translation");
  const navigate = useNavigate();
  const location = useLocation();

  const convertUTCDateToLocalDate = (date, format) => {
    if (!format) {
      format = {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      };
    }
    const utcDate = new Date(date);
    const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = {
      ...format,
      timeZone: browserTimezone,
    };
    const formattedDate = utcDate
      .toLocaleString(formatLocale(locale, countryCode), options)
      .replace(" at ", ", ");
    return formattedDate;
  };

  const getTime = (time) => {
    return convertUTCDateToLocalDate(time);
  };

  const navigateToShipment = (shipment) => {
    let link = "";
    if (isBuyAgainEligible) {
      link = `/profile/orders/shipment/${shipment.shipment_id}`;
      // Track navigation source for highlighting correct menu item
      // Check if we're coming from "My Returns" page (status=4)
      try {
        if (location.search.includes("status=4")) {
          sessionStorage.setItem("orderDetailsSource", "returns");
        } else {
          sessionStorage.setItem("orderDetailsSource", "orders");
        }
      } catch (e) {
        // sessionStorage not available, ignore
      }
    } else {
      link = `/order-tracking/${orderInfo.order_id}/${shipment.shipment_id}`;
    }
    navigate(link);
  };

  const getBrandName = (bags) => {
    if (bags && bags.length > 0 && bags[0]?.item?.brand?.name) {
      return bags[0].item.brand.name;
    }
    return "";
  };

  const getTotalItems = (bags) => {
    return bags?.length || 0;
  };

  const getTotalQuantity = (bags) => {
    if (!bags || bags.length === 0) return 0;
    return bags.reduce((total, bag) => total + (bag.quantity || 0), 0);
  };

  return (
    <div className={styles.orderWrapper}>
      <div className={styles.orderCard}>
        {/* Order Header */}
        <div className={styles.orderCardHeader}>
          <div className={styles.orderInfo}>
            <h3 className={styles.orderId}>{orderInfo.order_id}</h3>
            <p className={styles.orderDate}>
              {getTime(orderInfo.order_created_ts)}
            </p>
          </div>
        </div>

        {/* Product Details - Always Visible */}
        <div className={styles.productsContainer}>
          {orderInfo?.shipments?.map((shipment) => {
            const productImage = shipment?.bags?.[0]?.item?.image?.[0] || "";
            // --- FIX: if gif, convert /270x0/..gif => /original/..gif ---
            const finalProductImage = isGifUrl(productImage)
              ? toOriginalVariant(productImage)
              : productImage;

            const brandName = getBrandName(shipment?.bags);
            const totalItems = getTotalItems(shipment?.bags);
            const totalQuantity = getTotalQuantity(shipment?.bags);
            const statusTitle = shipment?.shipment_status?.title || "";

            return (
              <div
                key={shipment.shipment_id}
                className={styles.productSection}
                onClick={() => navigateToShipment(shipment)}
              >
                {/* Product Image */}
                <div className={styles.productImage}>
                  <img src={finalProductImage} alt={brandName} />
                </div>

                {/* Product Details */}
                <div className={styles.productDetails}>
                  <p className={styles.brandName}>{brandName}</p>
                  <p className={styles.shipmentId}>
                    {t("resource.order.shipment_label", {
                      defaultValue: "Shipment",
                    })}
                    : {shipment.shipment_id}
                  </p>

                  <div className={styles.productMeta}>
                    <span className={styles.metaText}>
                      {totalItems}{" "}
                      {t("resource.common.item_simple_text", {
                        defaultValue: "Item",
                      })}
                    </span>
                    <span className={styles.metaDivider}>|</span>
                    <span className={styles.metaText}>
                      {totalQuantity}{" "}
                      {t("resource.common.piece", { defaultValue: "Piece" })}
                    </span>
                  </div>

                  <div className={styles.statusBadge}>
                    <span className={styles.statusText}>{statusTitle}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OrderShipment;
