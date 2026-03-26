import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import { GET_SHIPMENT_DETAILS } from "../queries/shipmentQuery";
import useShipmentDetails from "../page-layouts/orders/useShipmentDetails";
import useOrdersListing from "../page-layouts/orders/useOrdersListing";
import OrderTrack from "@gofynd/theme-template/pages/order/order-tracking-details/order-tracking-details";
import "@gofynd/theme-template/pages/order/order-tracking-details/order-tracking-details.css";
import { ADD_TO_CART, FULFILLMENT_OPTIONS } from "../queries/pdpQuery";
import { fetchCartDetails } from "../page-layouts/cart/useCart";
import { useSnackbar } from "../helper/hooks";
import { translateDynamicLabel } from "../helper/utils";

export function Component({ fpi }) {
  const { t } = useGlobalTranslation("translation");
  const { isLoading, orderShipments, linkOrderDetails } = useOrdersListing(fpi);
  const { invoiceDetails } = useShipmentDetails(fpi);
  const { showSnackbar } = useSnackbar();
  const params = useParams();
  const [selectedShipmentBag, setSelectedShipmentBag] =
    useState(orderShipments);
  const [isShipmentLoading, setIsShipmentLoading] = useState(false);

  const { fulfillment_option } = useGlobalStore(fpi.getters.APP_FEATURES);

  const getShipmentDetails = () => {
    if (params?.shipmentId) {
      setIsShipmentLoading(true);
      try {
        const values = {
          shipmentId: params.shipmentId || "",
        };
        fpi
          .executeGQL(GET_SHIPMENT_DETAILS, values)
          .then((res) => {
            if (res?.data?.shipment) {
              const data = res?.data?.shipment?.detail;
              setSelectedShipmentBag(data);
            }
          })
          .finally(() => {
            setIsShipmentLoading(false);
          });
      } catch (error) {
        console.log({ error });
        setIsShipmentLoading(false);
      }
    }
  };

  const handleAddToCart = async (productSlug) => {
    try {
      // Mirror firestone's internal selectedShipmentBag logic:
      // when no shipmentId in URL, firestone displays shipments[0];
      // when shipmentId exists, selectedShipmentBag holds the fetched detail.
      const effectiveShipment = params?.shipmentId
        ? selectedShipmentBag
        : orderShipments?.shipments?.[0];

      const bag = effectiveShipment?.bags?.find(
        (bag) => bag?.item?.slug_key === productSlug
      );

      if (!bag) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      const itemId = bag?.item?.id;
      const itemSize = bag?.item?.size;
      const quantity = bag?.quantity || 1;
      const pincode = effectiveShipment?.delivery_address?.pincode || "";

      if (!itemId) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      const priceResponse = await fpi.executeGQL(FULFILLMENT_OPTIONS, {
        slug: productSlug,
        size: itemSize || "",
        pincode: pincode,
      });

      const priceItems =
        priceResponse?.data?.productsPriceWithFulfillmentOption?.items;
      if (!priceItems || priceItems.length === 0) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      const priceItem =
        priceItems.find((item) => item.quantity > 0) || priceItems[0];

      if (!priceItem) {
        showSnackbar(t("resource.common.add_cart_failure"), "error");
        return;
      }

      const payload = {
        buyNow: false,
        areaCode: pincode,
        addCartRequestInput: {
          items: [
            {
              article_assignment: {
                level: String(priceItem?.article_assignment?.level || ""),
                strategy: String(
                  priceItem?.article_assignment?.strategy || ""
                ),
              },
              article_id: String(priceItem?.article_id || ""),
              item_id: itemId,
              item_size: itemSize ? String(itemSize) : undefined,
              quantity: quantity,
              seller_id: priceItem?.seller?.uid,
              store_id: priceItem?.store?.uid,
              fulfillment_option_slug:
                priceItem?.fulfillment_option?.slug || "",
            },
          ],
        },
      };

      const outRes = await fpi.executeGQL(ADD_TO_CART, payload);

      if (outRes?.data?.addItemsToCart?.success) {
        fetchCartDetails(fpi);
        showSnackbar(
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
            t("resource.common.add_to_cart_success"),
          "success"
        );
      } else {
        const errorMessage =
          translateDynamicLabel(outRes?.errors?.[0]?.message, t) ||
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
          t("resource.common.add_cart_failure");
        showSnackbar(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      showSnackbar(t("resource.common.add_cart_failure"), "error");
    }
  };

  return (
    <OrderTrack
      invoiceDetails={invoiceDetails}
      isLoading={isLoading}
      orderShipments={orderShipments}
      getShipmentDetails={getShipmentDetails}
      selectedShipment={selectedShipmentBag}
      isShipmentLoading={isShipmentLoading}
      availableFOCount={fulfillment_option?.count || 1}
      linkOrderDetails={linkOrderDetails}
      onAddToCart={handleAddToCart}
    ></OrderTrack>
  );
}
``;
export const settings = {
  label: "Order Tracking Details",
};

export default Component;
