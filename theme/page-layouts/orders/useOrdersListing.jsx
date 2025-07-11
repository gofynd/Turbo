import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ORDER_LISTING, ORDER_BY_ID } from "../../queries/ordersQuery";
import { ADD_TO_CART } from "../../queries/pdpQuery";
import { CART_ITEMS_COUNT } from "../../queries/wishlistQuery";
import { fetchCartDetails } from "../cart/useCart";
import { useGlobalStore, useGlobalTranslation } from "fdk-core/utils";
import dayjs from "dayjs";
import { useSnackbar, useThemeConfig } from "../../helper/hooks";
import { translateDynamicLabel } from "../../helper/utils";

const useOrdersListing = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const { globalConfig, pageConfig } = useThemeConfig({ fpi, page: "orders" });
  const ORDERLIST = useGlobalStore(fpi.getters.SHIPMENTS);
  const [orders, setOrders] = useState({});
  const [orderShipments, setOrderShipments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [linkOrderDetails, setLinkOrderDetails] = useState("");
  const getDateRange = function (days) {
    const fromDate = dayjs().subtract(days, "days").format("MM-DD-YYYY");
    const toDate = dayjs().add(1, "days").format("MM-DD-YYYY");
    return {
      fromDate,
      toDate,
    };
  };

  useEffect(() => {
    setIsLoading(true);
    try {
      if (params?.orderId) {
        const values = {
          orderId: params?.orderId,
        };
        fpi
          .executeGQL(ORDER_BY_ID, values)
          .then((res) => {
            setOrderShipments(res?.data?.order || {});
            setLinkOrderDetails({
              amount:
                res?.data?.order?.breakup_values?.[
                  res?.data?.order?.breakup_values?.length - 1
                ],
              orderId: params?.orderId,
            });
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  }, [params?.orderId]);

  useEffect(() => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams(location.search);
      let values = {
        pageNo: 1,
        pageSize: 50,
      };
      const selected_date_filter =
        queryParams.get("selected_date_filter") || "";
      if (selected_date_filter) {
        const dateObj = getDateRange(selected_date_filter);
        values = { ...values, ...dateObj };
      }
      const status = queryParams.get("status") || "";
      if (status) values.status = Number(status);

      fpi
        .executeGQL(ORDER_LISTING, values)
        .then((res) => {
          if (res?.data?.orders) {
            const data = res?.data?.orders;
            setOrders(data);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } catch (error) {
      console.log({ error });
      setIsLoading(false);
    }
  }, [location.search]);

  const handelBuyAgain = (orderInfo) => {
    const itemsPayload = orderInfo?.bags_for_reorder?.map(
      ({ __typename, ...rest }) => rest
    );
    const payload = {
      buyNow: false,
      areaCode: "",
      addCartRequestInput: {
        items: itemsPayload,
      },
    };
    fpi.executeGQL(ADD_TO_CART, payload).then((outRes) => {
      if (outRes?.data?.addItemsToCart?.success) {
        fpi.executeGQL(CART_ITEMS_COUNT, null).then((res) => {
          showSnackbar(
            translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
              t("resource.common.add_to_cart_success"),
            "success"
          );
        });
        fetchCartDetails(fpi);
      } else {
        showSnackbar(
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) || t("resource.common.add_cart_failure"),
          "error"
        );
      }
    });
  };
  return {
    isLoading,
    orders,
    orderShipments,
    pageConfig,
    globalConfig,
    handelBuyAgain,
    linkOrderDetails,
  };
};

export default useOrdersListing;
