import { spaNavigate } from "../../theme/helper/utils.js";
import { isUserLoggedIn } from "../utils/wishlist-utils.js";
import {
  extractOrderTrackingDetails,
  formatTrackingDetails,
  getOrderStatus,
  getShipmentStatus,
  validateOrderId,
  getOrderPageContext,
  getUserOrdersList,
  parseOrderSelection,
  formatOrdersList,
  extractShipmentIds,
  getMultipleShipmentsTracking,
  formatMultipleShipmentsTracking,
} from "../utils/order-utils.js";

export const orderActions = [
  {
    name: "get_latest_order_tracking",
    description:
      "Handle requests for latest order tracking details. Redirects to orders page if needed, shows order list, and allows user to select which order they want tracking for using natural language like 'latest', '3rd order', 'last order'.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        order_selection: {
          type: "string",
          description:
            "Natural language order selection like 'latest', 'last', '3rd order', 'third order', 'newest', etc.",
          default: "latest",
        },
        auto_navigate: {
          type: "boolean",
          description:
            "Whether to automatically navigate to orders page if not already there",
          default: true,
        },
      },
    },
    handler: async ({ order_selection = "latest", auto_navigate = true }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to view your orders. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Check current page context
        const pageContext = getOrderPageContext();

        // If not on orders page, redirect first
        if (!pageContext.isOrderPage && auto_navigate) {
          spaNavigate("/profile/orders");

          // Wait a moment for the page to start loading
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Now try to fetch orders - the API should work regardless of current page
          // since it's a GraphQL call, not dependent on page state
        }

        // Fetch user's orders list
        const ordersResult = await getUserOrdersList({ pageSize: 20 });

        if (!ordersResult.success || ordersResult.orders.length === 0) {
          return {
            success: false,
            message: pageContext.isOrderPage
              ? "No orders found in your account."
              : "I've redirected you to your orders page, but no orders were found in your account.",
            action_required: "no_orders_found",
          };
        }

        // Parse the order selection
        const selectionResult = parseOrderSelection(
          order_selection,
          ordersResult.orders
        );

        if (!selectionResult.success) {
          // Show orders list for user to choose from
          const ordersList = formatOrdersList(ordersResult.orders);
          const redirectMessage = !pageContext.isOrderPage
            ? "I've redirected you to your orders page. "
            : "";

          return {
            success: false,
            message: `${redirectMessage}${selectionResult.message}\n\n${ordersList}`,
            action_required: "order_selection_needed",
            data: {
              redirected: !pageContext.isOrderPage,
              available_orders: ordersResult.orders.map((order, index) => ({
                position: index + 1,
                order_id: order.order_id,
                date: order.order_created_time,
                status:
                  order.shipments?.[0]?.shipment_status?.title || "Processing",
              })),
            },
          };
        }

        const selectedOrder = selectionResult.selected_order;

        // Extract shipment IDs from the selected order
        const shipmentIds = extractShipmentIds(selectedOrder);

        if (shipmentIds.length === 0) {
          const redirectMessage = !pageContext.isOrderPage
            ? "I've redirected you to your orders page. "
            : "";

          return {
            success: false,
            message: `${redirectMessage}Order ${selectedOrder.order_id} has no shipments to track.`,
            action_required: "no_shipments_found",
          };
        }

        // Fetch tracking details for all shipments in the order
        const trackingResult = await getMultipleShipmentsTracking(shipmentIds);

        if (!trackingResult.success) {
          const redirectMessage = !pageContext.isOrderPage
            ? "I've redirected you to your orders page. "
            : "";

          return {
            success: false,
            message: `${redirectMessage}Failed to fetch tracking details for order ${selectedOrder.order_id}: ${trackingResult.message}`,
            action_required: "tracking_fetch_failed",
          };
        }

        // Format the tracking details
        const formattedTracking = formatMultipleShipmentsTracking(
          trackingResult.shipments,
          {
            order_id: selectedOrder.order_id,
            order_created_time: selectedOrder.order_created_time,
          }
        );

        // Create success message with optional redirect notice
        const redirectMessage = !pageContext.isOrderPage
          ? "I've redirected you to your orders page and fetched your order details:\n\n"
          : "";

        return {
          success: true,
          message: `${redirectMessage}${formattedTracking}`,
          data: {
            order: selectedOrder,
            redirected: !pageContext.isOrderPage,
            shipments_count: trackingResult.shipments.length,
            selection_info: {
              requested: order_selection,
              position: selectionResult.position,
              chronological_position: selectionResult.chronological_position,
              interpretation: selectionResult.interpretation,
              total_orders: selectionResult.total_orders,
            },
            tracking_data: trackingResult.shipments,
          },
        };
      } catch (error) {
        console.error("Error getting latest order tracking:", error);
        return {
          success: false,
          message: `Failed to fetch order tracking details: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "list_my_orders",
    description:
      "Show user's orders list with basic information. Use this when user asks to see their orders or wants to choose which order to track.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        limit: {
          type: "number",
          description: "Maximum number of orders to show",
          default: 10,
          minimum: 1,
          maximum: 50,
        },
        status_filter: {
          type: "string",
          description: "Filter orders by status (optional)",
          enum: ["all", "pending", "shipped", "delivered", "cancelled"],
        },
      },
    },
    handler: async ({ limit = 10, status_filter }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to view your orders. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Check if we're on orders page, if not redirect
        const pageContext = getOrderPageContext();
        if (!pageContext.isOrderPage) {
          spaNavigate("/profile/orders");
          return {
            success: true,
            message: "Redirecting to your orders page...",
            action_required: "navigation_complete",
          };
        }

        const options = { pageSize: limit };

        // Add status filter if provided
        if (status_filter && status_filter !== "all") {
          // Map status filter to numeric values if needed
          const statusMap = {
            pending: 1,
            shipped: 2,
            delivered: 3,
            cancelled: 4,
          };
          if (statusMap[status_filter]) {
            options.status = statusMap[status_filter];
          }
        }

        const ordersResult = await getUserOrdersList(options);

        if (!ordersResult.success) {
          return {
            success: false,
            message: ordersResult.message || "Failed to fetch your orders.",
            action_required: "fetch_failed",
          };
        }

        if (ordersResult.orders.length === 0) {
          return {
            success: false,
            message: "No orders found in your account.",
            action_required: "no_orders_found",
          };
        }

        const formattedList = formatOrdersList(ordersResult.orders, limit);

        return {
          success: true,
          message: formattedList,
          data: {
            orders: ordersResult.orders.map((order, index) => ({
              position: index + 1,
              order_id: order.order_id,
              date: order.order_created_time,
              shipments_count:
                order.total_shipments_in_order || order.shipments?.length || 0,
              status:
                order.shipments?.[0]?.shipment_status?.title || "Processing",
            })),
            total_orders: ordersResult.total_orders,
            pagination: ordersResult.pagination,
          },
        };
      } catch (error) {
        console.error("Error listing orders:", error);
        return {
          success: false,
          message: `Failed to fetch orders: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "track_order_by_position",
    description:
      "Track a specific order by its position in the orders list using natural language. Use this when user specifies 'track my 3rd order', 'show me latest order details', etc.",
    timeout: 12000,
    parameters: {
      type: "object",
      properties: {
        position_reference: {
          type: "string",
          description:
            "Position reference like 'latest', '3rd', 'last', 'first', 'second', etc.",
        },
      },
      required: ["position_reference"],
    },
    handler: async ({ position_reference }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to track your orders. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Fetch user's orders list
        const ordersResult = await getUserOrdersList({ pageSize: 20 });

        if (!ordersResult.success || ordersResult.orders.length === 0) {
          return {
            success: false,
            message: "No orders found to track.",
            action_required: "no_orders_found",
          };
        }

        // Parse the position reference
        const selectionResult = parseOrderSelection(
          position_reference,
          ordersResult.orders
        );

        if (!selectionResult.success) {
          const ordersList = formatOrdersList(ordersResult.orders);
          return {
            success: false,
            message: `${selectionResult.message}\n\n${ordersList}`,
            action_required: "invalid_position",
          };
        }

        const selectedOrder = selectionResult.selected_order;

        // Extract shipment IDs and get tracking details
        const shipmentIds = extractShipmentIds(selectedOrder);

        if (shipmentIds.length === 0) {
          return {
            success: false,
            message: `Order ${selectedOrder.order_id} (position ${selectionResult.position}) has no shipments to track.`,
            action_required: "no_shipments_found",
          };
        }

        // Fetch detailed tracking information
        const trackingResult = await getMultipleShipmentsTracking(shipmentIds);

        if (!trackingResult.success) {
          return {
            success: false,
            message: `Failed to fetch tracking details for your ${position_reference} order: ${trackingResult.message}`,
            action_required: "tracking_fetch_failed",
          };
        }

        // Format the response
        const formattedTracking = formatMultipleShipmentsTracking(
          trackingResult.shipments,
          {
            order_id: selectedOrder.order_id,
            order_created_time: selectedOrder.order_created_time,
          }
        );

        return {
          success: true,
          message: `Here are the tracking details for your ${selectionResult.interpretation}:\n\n${formattedTracking}`,
          data: {
            selected_order: selectedOrder,
            position: selectionResult.position,
            chronological_position: selectionResult.chronological_position,
            total_orders: selectionResult.total_orders,
            interpretation: selectionResult.interpretation,
            shipments: trackingResult.shipments,
            tracking_summary: formattedTracking,
          },
        };
      } catch (error) {
        console.error("Error tracking order by position:", error);
        return {
          success: false,
          message: `Failed to track order: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "share_order_tracking_details",
    description:
      "Extract and share detailed tracking information for the order or shipment currently being viewed on the page. Use this when user asks about order tracking, shipment status, or delivery details.",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        include_items: {
          type: "boolean",
          description: "Whether to include item details in the response",
          default: true,
        },
        include_tracking_history: {
          type: "boolean",
          description: "Whether to include tracking history in the response",
          default: true,
        },
        format: {
          type: "string",
          description: "Format for the response",
          enum: ["summary", "detailed"],
          default: "summary",
        },
      },
    },
    handler: async ({ format = "summary" }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to view order tracking details. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Extract tracking details from current page
        const trackingData = await extractOrderTrackingDetails();

        if (!trackingData || !trackingData.type) {
          return {
            success: false,
            message:
              "No order or shipment tracking information found on this page. Please navigate to an order details or shipment tracking page first.",
            action_required: "navigate_to_order_page",
          };
        }

        // Format the tracking details
        const formattedDetails = formatTrackingDetails(trackingData);

        if (format === "detailed") {
          return {
            success: true,
            message: "Here are the detailed tracking information:",
            data: {
              formatted_summary: formattedDetails,
              raw_data: trackingData,
              page_context: {
                current_url: window.location.href,
                page_type: trackingData.type,
              },
            },
          };
        } else {
          return {
            success: true,
            message: formattedDetails,
            data: {
              tracking_summary: formattedDetails,
              order_id: trackingData.order_id,
              shipment_id: trackingData.shipment_id,
              current_status:
                trackingData.shipment_status?.title ||
                trackingData.shipments?.[0]?.shipment_status?.title,
              track_url:
                trackingData.track_url ||
                trackingData.shipments?.[0]?.track_url,
            },
          };
        }
      } catch (error) {
        console.error("Error sharing order tracking details:", error);
        return {
          success: false,
          message: `Failed to extract tracking details: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "get_order_status",
    description:
      "Get the current status of an order or shipment. Use this when user asks specifically about order status or 'where is my order'.",
    timeout: 8000,
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description:
            "Order ID to check status for (optional if on order page)",
        },
        shipment_id: {
          type: "string",
          description:
            "Shipment ID to check status for (optional if on shipment page)",
        },
      },
    },
    handler: async ({ order_id, shipment_id }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to check order status. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        if (!window.fpi) {
          return {
            success: false,
            message: "Unable to access order information. Please try again.",
            action_required: "system_error",
          };
        }

        let statusInfo = {};

        // If no IDs provided, try to extract from current page
        if (!order_id && !shipment_id) {
          const trackingData = await extractOrderTrackingDetails();
          order_id = trackingData.order_id;
          shipment_id = trackingData.shipment_id;
        }

        if (shipment_id) {
          // Get shipment status using utility function
          statusInfo = await getShipmentStatus(shipment_id);
        } else if (order_id) {
          // Get order status using utility function
          statusInfo = await getOrderStatus(order_id);
        } else {
          return {
            success: false,
            message:
              "Please provide an order ID or shipment ID, or navigate to an order page.",
            action_required: "missing_parameter",
            required_input: {
              field: "order_id or shipment_id",
              description: "Order ID or Shipment ID to check status",
            },
          };
        }

        if (!statusInfo.success) {
          return {
            success: false,
            message:
              statusInfo.message ||
              "Order or shipment not found. Please check the ID and try again.",
            action_required: "not_found",
          };
        }

        // Format response message
        let message = "";
        if (statusInfo.type === "shipment") {
          message = `📦 Shipment ${statusInfo.shipment_id}\n`;
          message += `📋 Current Status: ${statusInfo.status}\n`;
          if (statusInfo.order_id)
            message += `🔗 Order: ${statusInfo.order_id}\n`;
          if (statusInfo.delivery_date)
            message += `📅 Expected Delivery: ${new Date(statusInfo.delivery_date).toLocaleDateString()}\n`;
          if (statusInfo.tracking_no)
            message += `🔢 Tracking Number: ${statusInfo.tracking_no}\n`;
          if (statusInfo.dp_name)
            message += `🚛 Courier Partner: ${statusInfo.dp_name}\n`;
        } else {
          message = `📦 Order ${statusInfo.order_id}\n`;
          message += `📊 Total Shipments: ${statusInfo.total_shipments}\n\n`;
          if (statusInfo.shipments_status?.length > 0) {
            statusInfo.shipments_status.forEach((ship, index) => {
              message += `🚚 Shipment ${index + 1}: ${ship.status}\n`;
              if (ship.delivery_date)
                message += `📅 Expected: ${new Date(ship.delivery_date).toLocaleDateString()}\n`;
            });
          }
        }

        return {
          success: true,
          message: message.trim(),
          data: statusInfo,
        };
      } catch (error) {
        console.error("Error getting order status:", error);
        return {
          success: false,
          message: `Failed to get order status: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },

  {
    name: "track_order_by_id",
    description:
      "Track an order by providing order ID. Redirects to the order tracking page and provides tracking information.",
    timeout: 8000,
    parameters: {
      type: "object",
      properties: {
        order_id: {
          type: "string",
          description: "Order ID to track",
        },
      },
      required: ["order_id"],
    },
    handler: async ({ order_id }) => {
      try {
        // Check if user is logged in
        if (!isUserLoggedIn()) {
          return {
            success: false,
            message:
              "You need to be logged in to track your orders. Please log in first.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Validate order ID using utility function
        const validation = validateOrderId(order_id);
        if (!validation.valid) {
          return {
            success: false,
            message: validation.message,
            action_required: "invalid_order_id",
            required_input: {
              field: "order_id",
              description: "Valid order ID",
              validation:
                "Must be at least 10 characters long and contain only letters and numbers",
              example: "FY6123456789",
            },
          };
        }

        // Navigate to order tracking page
        const normalizedOrderId = validation.normalized;
        const trackingUrl = `/order-tracking/${normalizedOrderId}`;
        spaNavigate(trackingUrl);

        return {
          success: true,
          message: `Redirecting to track order ${normalizedOrderId}...`,
          data: {
            order_id: normalizedOrderId,
            tracking_url: trackingUrl,
          },
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to track order: ${error.message}`,
          action_required: "system_error",
        };
      }
    },
  },
];
