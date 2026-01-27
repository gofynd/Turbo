import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ORDER_LISTING, ORDER_BY_ID } from "../../queries/ordersQuery";
import { ADD_TO_CART } from "../../queries/pdpQuery";
import { CART_ITEMS_COUNT } from "../../queries/wishlistQuery";
import { fetchCartDetails } from "../cart/useCart";
import { useGlobalTranslation } from "fdk-core/utils";
import dayjs from "dayjs";
import { useSnackbar, useThemeConfig } from "../../helper/hooks";
import { translateDynamicLabel } from "../../helper/utils";

const useOrdersListing = (fpi) => {
  const { t } = useGlobalTranslation("translation");
  const location = useLocation();
  const params = useParams();
  const { showSnackbar } = useSnackbar();
  const { globalConfig, pageConfig } = useThemeConfig({ fpi, page: "orders" });
  const [orders, setOrders] = useState({});
  const [orderShipments, setOrderShipments] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [linkOrderDetails, setLinkOrderDetails] = useState("");
  const getDateRange = function (days) {
    // Handle "Today" (0 days) - start from today 00:00:00, end today
    if (days === 0) {
      const fromDate = dayjs().startOf("day").format("MM-DD-YYYY");
      const toDate = dayjs().format("MM-DD-YYYY");
      return {
        fromDate,
        toDate,
      };
    }
    // For other presets, subtract days from today and end today
    const fromDate = dayjs().subtract(days, "days").format("MM-DD-YYYY");
    const toDate = dayjs().format("MM-DD-YYYY");
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
              data: res?.data?.order || null,
              error: res?.errors?.length ? res?.errors[0]?.message : null,
              amount:
                res?.data?.order?.breakup_values?.[
                  res?.data?.order?.breakup_values?.length - 1
                ],
              orderId: params?.orderId,
            });
            if (res?.errors[0]?.message) {
              showSnackbar(res?.errors[0]?.message, "error");
            }
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

      // Default values: pageSize 20, Last 90 days
      const DEFAULT_DATE_FILTER = 90;
      const DEFAULT_PAGE_SIZE = 20;

      // Get page number from URL or default to 1
      const pageNo = queryParams.get("page_no")
        ? Number(queryParams.get("page_no"))
        : 1;

      let values = {
        pageNo,
        pageSize: DEFAULT_PAGE_SIZE, // Ensure pageSize is always 20
      };

      // Safeguard: Ensure pageSize is never undefined or invalid
      if (!values.pageSize || values.pageSize !== 20) {
        values.pageSize = 20;
      }

      // Get date filter from URL - always pass date range to API
      const selected_date_filter = queryParams.get("selected_date_filter");
      const custom_start = queryParams.get("custom_start_date");
      const custom_end = queryParams.get("custom_end_date");

      if (selected_date_filter === "custom" && custom_start && custom_end) {
        // Use custom date range (inclusive of selected end date)
        values.fromDate = custom_start;
        values.toDate = dayjs(custom_end).format("MM-DD-YYYY");
      } else {
        // Use preset date filter or default
        const dateFilterValue = selected_date_filter
          ? Number(selected_date_filter)
          : DEFAULT_DATE_FILTER;
        const dateObj = getDateRange(dateFilterValue);
        values = { ...values, ...dateObj };
      }

      // Get status filter from URL (defaults to null/All if not present)
      const status = queryParams.get("status");
      if (status) {
        values.status = Number(status);
      }

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
          translateDynamicLabel(outRes?.data?.addItemsToCart?.message, t) ||
            t("resource.common.add_cart_failure"),
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
