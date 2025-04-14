import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import OrderStatusPage from "@gofynd/theme-template/pages/order-status/order-status";
import { useLoggedInUser } from "../helper/hooks";
import empty from "../assets/images/empty_state.png";
import { ORDER_BY_ID } from "../queries/checkoutQuery";
import "@gofynd/theme-template/pages/order-status/order-status.css";
import Loader from "../components/loader/loader";
import EmptyState from "../components/empty-state/empty-state";
import OrderPendingIcon from "../assets/images/order-pending.svg";

function OrderPolling({ isLoggedIn }) {
  return (
    <EmptyState
      description="Your order is pending. Please allow us a few minutes to confirm the status. We will update you via SMS or email shortly."
      Icon={<OrderPendingIcon />}
      title="Order Pending"
      btnLink="/"
      btnTitle="CONTINUE SHOPPING"
    />
  );
}

function OrderStatus({ fpi }) {
  const [searchParams] = useSearchParams();
  const success = searchParams.get("success");
  const orderId = searchParams.get("order_id");
  const [orderData, setOrderData] = useState(null);
  const { loggedIn: isloggedIn } = useLoggedInUser(fpi);
  const [attempts, setAttempts] = useState(0);
  const [showPolling, setShowPolling] = useState(false);
  const navigate = useNavigate();

  const fetchOrder = useCallback(() => {
    setTimeout(() => {
      fpi.executeGQL(ORDER_BY_ID, { orderId }).then((res) => {
        if (res?.data?.order && orderData === null) {
          setOrderData(res?.data?.order);
          setShowPolling(false);
        } else {
          setAttempts((prev) => prev + 1);
        }
      });
    }, 2000);
  }, [orderId, orderData]);

  useEffect(() => {
    if (success === "true") {
      if (attempts < 5 && orderData === null) {
        fetchOrder();
      } else if (attempts >= 5) {
        setShowPolling(true);
        // navigate("/cart/order-status?success=false");
      }
    }
  }, [success, attempts, fetchOrder, orderData]);

  console.log({ orderData });

  return (
    <div className="basePageContainer margin0auto">
      <OrderStatusPage
        success={success}
        orderData={orderData}
        isLoggedIn={isloggedIn}
        orderFailImg={empty}
        showPolling={showPolling}
        pollingComp={<OrderPolling isLoggedIn={isloggedIn} />}
        onOrderFailure={() => navigate("/cart/bag")}
        loader={<Loader />}
      />
    </div>
  );
}

export const sections = JSON.stringify([]);

export default OrderStatus;
