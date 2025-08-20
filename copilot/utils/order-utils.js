/**
 * Order Utilities for Copilot Integration
 *
 * This file contains utility functions for order tracking, status checking,
 * and order-related data extraction and formatting.
 */

import { GET_SHIPMENT_DETAILS } from "../../theme/queries/shipmentQuery.js";
import { ORDER_BY_ID, ORDER_LISTING } from "../../theme/queries/ordersQuery.js";
import {
  getFpiState,
  createErrorResponse,
  createSuccessResponse,
} from "./common-utils.js";

/**
 * Get user's orders list
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Orders list with pagination info
 */
export const getUserOrdersList = async (options = {}) => {
  try {
    if (!window.fpi) {
      throw new Error("FPI not available");
    }

    const { pageNo = 1, pageSize = 10, status = null } = options;

    const values = {
      pageNo,
      pageSize,
    };

    if (status) {
      values.status = Number(status);
    }

    const result = await window.fpi.executeGQL(ORDER_LISTING, values);

    if (result?.data?.orders) {
      const ordersData = result.data.orders;
      return {
        success: true,
        orders: ordersData.items || [],
        pagination: ordersData.page || {},
        total_orders: ordersData.page?.item_total || 0,
      };
    } else {
      return {
        success: false,
        message: "No orders found",
        orders: [],
      };
    }
  } catch (error) {
    console.error("Error fetching orders list:", error);
    return {
      success: false,
      message: `Failed to fetch orders: ${error.message}`,
      orders: [],
    };
  }
};

/**
 * Parse natural language order selection
 * @param {string} orderReference - Natural language reference like "latest", "3rd", "last"
 * @param {Array} ordersList - List of orders to select from (assumed to be in reverse chronological order - newest first)
 * @returns {Object} Selected order information
 */
export const parseOrderSelection = (orderReference, ordersList) => {
  if (!ordersList || ordersList.length === 0) {
    return {
      success: false,
      message: "No orders available to select from",
    };
  }

  const ref = orderReference.toLowerCase().trim();

  // Handle different natural language patterns
  let selectedIndex = -1;

  // LATEST/NEWEST/RECENT/LAST = Most recent order (index 0)
  if (
    ref.includes("latest") ||
    ref.includes("newest") ||
    ref.includes("recent") ||
    ref.includes("last")
  ) {
    selectedIndex = 0; // First in list (most recent)
  }
  // FIRST/OLDEST = First/oldest order (last index)
  else if (ref.includes("first") || ref.includes("oldest")) {
    selectedIndex = ordersList.length - 1; // Last in list (oldest)
  }
  // NUMERICAL POSITIONS (1st, 2nd, 3rd etc.)
  else if (ref.includes("second") || ref.includes("2nd")) {
    selectedIndex = 1; // Second order in chronological list
  } else if (ref.includes("third") || ref.includes("3rd")) {
    selectedIndex = 2; // Third order in chronological list
  } else if (ref.includes("fourth") || ref.includes("4th")) {
    selectedIndex = 3;
  } else if (ref.includes("fifth") || ref.includes("5th")) {
    selectedIndex = 4;
  } else {
    // Try to parse numbers like "1", "2", "3"
    const numberMatch = ref.match(/(\d+)/);
    if (numberMatch) {
      const number = parseInt(numberMatch[1]);
      if (number === 1) {
        // "1" or "1st" should refer to the FIRST/OLDEST order
        selectedIndex = ordersList.length - 1;
      } else {
        // "2", "3", etc. refer to positions in chronological order
        selectedIndex = number - 1; // Convert to 0-based index
      }
    }
  }

  // Validate index
  if (selectedIndex < 0 || selectedIndex >= ordersList.length) {
    return {
      success: false,
      message: `Cannot find order at position "${orderReference}". You have ${ordersList.length} order(s) available.`,
      available_count: ordersList.length,
    };
  }

  const selectedOrder = ordersList[selectedIndex];

  // Calculate the actual chronological position for display
  let chronologicalPosition;
  if (selectedIndex === ordersList.length - 1) {
    chronologicalPosition = 1; // First/oldest order
  } else if (selectedIndex === 0) {
    chronologicalPosition = ordersList.length; // Latest/newest order
  } else {
    chronologicalPosition = ordersList.length - selectedIndex; // Calculate position from oldest
  }

  return {
    success: true,
    selected_order: selectedOrder,
    position: selectedIndex + 1, // Position in current list (newest first)
    chronological_position: chronologicalPosition, // Position from oldest to newest
    total_orders: ordersList.length,
    interpretation: getSelectionInterpretation(
      ref,
      selectedIndex,
      ordersList.length
    ),
  };
};

/**
 * Helper function to explain how the selection was interpreted
 * @param {string} reference - Original reference
 * @param {number} selectedIndex - Selected index
 * @param {number} totalOrders - Total number of orders
 * @returns {string} Human-readable interpretation
 */
const getSelectionInterpretation = (reference, selectedIndex, totalOrders) => {
  const ref = reference.toLowerCase().trim();

  if (
    ref.includes("latest") ||
    ref.includes("newest") ||
    ref.includes("recent") ||
    ref.includes("last")
  ) {
    return "most recent order";
  } else if (
    ref.includes("first") ||
    ref.includes("oldest") ||
    ref === "1" ||
    ref.includes("1st")
  ) {
    return "first/oldest order";
  } else if (selectedIndex === 0) {
    return "most recent order";
  } else if (selectedIndex === totalOrders - 1) {
    return "first/oldest order";
  } else {
    const chronologicalPos = totalOrders - selectedIndex;
    return `${getOrdinalNumber(chronologicalPos)} order chronologically`;
  }
};

/**
 * Convert number to ordinal (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to convert
 * @returns {string} Ordinal string
 */
const getOrdinalNumber = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return num + "st";
  }
  if (j === 2 && k !== 12) {
    return num + "nd";
  }
  if (j === 3 && k !== 13) {
    return num + "rd";
  }
  return num + "th";
};

/**
 * Format orders list for user selection
 * @param {Array} ordersList - List of orders
 * @param {number} maxDisplay - Maximum orders to display
 * @returns {string} Formatted orders list
 */
export const formatOrdersList = (ordersList, maxDisplay = 10) => {
  if (!ordersList || ordersList.length === 0) {
    return "No orders found.";
  }

  let summary = `📋 Your Orders (${ordersList.length} total):\n\n`;

  const ordersToShow = ordersList.slice(0, maxDisplay);

  ordersToShow.forEach((order, index) => {
    const orderDate = new Date(order.order_created_time).toLocaleDateString();
    const totalShipments =
      order.total_shipments_in_order || order.shipments?.length || 0;

    // Get first shipment status for quick reference
    const firstShipmentStatus =
      order.shipments?.[0]?.shipment_status?.title || "Processing";

    summary += `${index + 1}. 📦 Order ${order.order_id}\n`;
    summary += `   📅 Placed: ${orderDate}\n`;
    summary += `   📊 Shipments: ${totalShipments}\n`;
    summary += `   📋 Status: ${firstShipmentStatus}\n\n`;
  });

  if (ordersList.length > maxDisplay) {
    summary += `... and ${ordersList.length - maxDisplay} more orders\n\n`;
  }

  summary += `💬 Say "track my latest order", "3rd order details", or "track order [ORDER_ID]"`;

  return summary;
};

/**
 * Extract shipment IDs from an order
 * @param {Object} order - Order object
 * @returns {Array} Array of shipment IDs
 */
export const extractShipmentIds = (order) => {
  if (!order || !order.shipments) {
    return [];
  }

  return order.shipments
    .map((shipment) => shipment.shipment_id)
    .filter(Boolean);
};

/**
 * Get multiple shipments tracking details
 * @param {Array} shipmentIds - Array of shipment IDs
 * @returns {Promise<Object>} Combined tracking details
 */
export const getMultipleShipmentsTracking = async (shipmentIds) => {
  try {
    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return {
        success: false,
        message: "No shipment IDs provided",
      };
    }

    // Fetch details for all shipments in parallel
    const shipmentPromises = shipmentIds.map((shipmentId) =>
      window.fpi
        .executeGQL(GET_SHIPMENT_DETAILS, { shipmentId })
        .then((result) => ({
          shipmentId,
          success: true,
          data: result?.data?.shipment?.detail,
        }))
        .catch((error) => ({
          shipmentId,
          success: false,
          error: error.message,
        }))
    );

    const results = await Promise.all(shipmentPromises);

    const successful = results.filter((r) => r.success && r.data);
    const failed = results.filter((r) => !r.success);

    return {
      success: successful.length > 0,
      shipments: successful.map((r) => r.data),
      failed_shipments: failed,
      total_requested: shipmentIds.length,
      successful_count: successful.length,
    };
  } catch (error) {
    console.error("Error fetching multiple shipments:", error);
    return {
      success: false,
      message: `Failed to fetch shipment details: ${error.message}`,
    };
  }
};

/**
 * Format tracking details for multiple shipments
 * @param {Array} shipments - Array of shipment details
 * @param {Object} orderInfo - Order information
 * @returns {string} Formatted tracking summary
 */
export const formatMultipleShipmentsTracking = (shipments, orderInfo = {}) => {
  if (!shipments || shipments.length === 0) {
    return "No shipment tracking details available.";
  }

  let summary = "";

  if (orderInfo.order_id) {
    summary += `📦 Order ${orderInfo.order_id}\n`;
    if (orderInfo.order_created_time) {
      summary += `📅 Placed: ${new Date(orderInfo.order_created_time).toLocaleDateString()}\n`;
    }
    summary += `📊 Total Shipments: ${shipments.length}\n\n`;
  }

  shipments.forEach((shipment, index) => {
    summary += `🚚 Shipment ${index + 1}: ${shipment.shipment_id}\n`;
    summary += `📋 Status: ${shipment.shipment_status?.title || "Unknown"}\n`;

    if (shipment.awb_no) summary += `🏷️ AWB: ${shipment.awb_no}\n`;
    if (shipment.traking_no) summary += `🔢 Tracking: ${shipment.traking_no}\n`;
    if (shipment.dp_name) summary += `🚛 Courier: ${shipment.dp_name}\n`;
    if (shipment.delivery_date) {
      summary += `📅 Expected: ${new Date(shipment.delivery_date).toLocaleDateString()}\n`;
    }

    // Show items in this shipment
    if (shipment.bags && shipment.bags.length > 0) {
      summary += `📦 Items (${shipment.total_bags || shipment.bags.length}):\n`;
      shipment.bags.forEach((bag) => {
        summary += `  • ${bag.item?.name || "Unknown Item"}`;
        if (bag.item?.brand?.name) summary += ` (${bag.item.brand.name})`;
        if (bag.item?.size) summary += ` - Size: ${bag.item.size}`;
        summary += ` x ${bag.quantity}\n`;
      });
    }

    // Show recent tracking updates
    if (shipment.tracking_details && shipment.tracking_details.length > 0) {
      const recentUpdates = shipment.tracking_details
        .sort(
          (a, b) =>
            new Date(b.created_ts || b.time) - new Date(a.created_ts || a.time)
        )
        .slice(0, 2); // Show 2 most recent updates

      summary += `📍 Recent Updates:\n`;
      recentUpdates.forEach((update) => {
        const date = new Date(
          update.created_ts || update.time
        ).toLocaleString();
        summary += `  • ${update.status} - ${date}\n`;
      });
    }

    summary += "\n";
  });

  return summary.trim();
};

/**
 * Extract order and shipment tracking details from the current page
 * @returns {Promise<Object>} Order/shipment details for the current page
 */
export const extractOrderTrackingDetails = async () => {
  try {
    if (!window.fpi) {
      throw new Error("FPI not available");
    }

    // Get current URL to determine the context
    const currentUrl = new URL(window.location.href);
    const pathname = currentUrl.pathname;

    // Extract order ID or shipment ID from URL
    let orderId = null;
    let shipmentId = null;

    // Check if we're on an order tracking page
    if (pathname.includes("/order-tracking/")) {
      orderId = pathname.split("/order-tracking/")[1]?.split("/")[0];
    } else if (pathname.includes("/profile/orders/shipment/")) {
      shipmentId = pathname
        .split("/profile/orders/shipment/")[1]
        ?.split("/")[0];
    } else if (pathname.includes("/profile/orders") && pathname.includes("/")) {
      // Extract from order details page
      const pathParts = pathname.split("/");
      const orderIndex = pathParts.indexOf("orders");
      if (orderIndex !== -1 && pathParts[orderIndex + 1]) {
        orderId = pathParts[orderIndex + 1];
      }
    }

    // Try to get from React router params if URL parsing fails
    if (!orderId && !shipmentId) {
      try {
        // Check if React Router params are available in global state
        const state = getFpiState();
        const routerState = state?.ROUTER_STATE || state?.router;
        if (routerState?.params) {
          orderId = routerState.params.orderId;
          shipmentId = routerState.params.shipmentId;
        }
      } catch (error) {
        console.warn("Could not extract from router state:", error);
      }
    }

    let trackingData = {};

    // Fetch order details if we have an order ID
    if (orderId) {
      try {
        const orderResult = await window.fpi.executeGQL(ORDER_BY_ID, {
          orderId,
        });
        if (orderResult?.data?.order) {
          const order = orderResult.data.order;
          trackingData = {
            type: "order",
            order_id: order.order_id,
            order_created_time: order.order_created_time,
            total_shipments: order.total_shipments_in_order,
            shipments: order.shipments?.map((shipment) => ({
              shipment_id: shipment.shipment_id,
              order_id: shipment.order_id,
              awb_no: shipment.awb_no,
              track_url: shipment.track_url,
              tracking_no: shipment.traking_no,
              dp_name: shipment.dp_name,
              shipment_status: shipment.shipment_status,
              delivery_date: shipment.delivery_date,
              tracking_details: shipment.tracking_details,
              bags: shipment.bags?.map((bag) => ({
                item_name: bag.item?.name,
                brand: bag.item?.brand?.name,
                quantity: bag.quantity,
                size: bag.item?.size,
                image: bag.item?.image,
                current_status: bag.current_status,
              })),
            })),
          };
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      }
    }

    // Fetch shipment details if we have a shipment ID
    if (shipmentId) {
      try {
        const shipmentResult = await window.fpi.executeGQL(
          GET_SHIPMENT_DETAILS,
          { shipmentId }
        );
        if (shipmentResult?.data?.shipment?.detail) {
          const shipment = shipmentResult.data.shipment.detail;
          trackingData = {
            type: "shipment",
            shipment_id: shipment.shipment_id,
            order_id: shipment.order_id,
            awb_no: shipment.awb_no,
            track_url: shipment.track_url,
            tracking_no: shipment.traking_no,
            dp_name: shipment.dp_name,
            shipment_status: shipment.shipment_status,
            delivery_date: shipment.delivery_date,
            tracking_details: shipment.tracking_details,
            delivery_address: shipment.delivery_address,
            bags: shipment.bags?.map((bag) => ({
              item_name: bag.item?.name,
              brand: bag.item?.brand?.name,
              quantity: bag.quantity,
              size: bag.item?.size,
              image: bag.item?.image,
              current_status: bag.current_status,
            })),
            total_bags: shipment.total_bags,
            fulfilling_company: shipment.fulfilling_company,
            fulfilling_store: shipment.fulfilling_store,
          };
        }
      } catch (error) {
        console.error("Error fetching shipment details:", error);
      }
    }

    // If no specific order/shipment found, try to get from current page state
    if (!trackingData.type) {
      try {
        const state = getFpiState();

        // Try to get from custom state that might be set by page components
        const customValue = state?.CUSTOM_VALUE;
        if (customValue?.orderDetails || customValue?.shipmentDetails) {
          trackingData = {
            type: "page_state",
            order_details: customValue.orderDetails,
            shipment_details: customValue.shipmentDetails,
          };
        }
      } catch (error) {
        console.warn("Could not extract from page state:", error);
      }
    }

    return trackingData;
  } catch (error) {
    console.error("Error extracting order tracking details:", error);
    return {};
  }
};

/**
 * Format tracking details into a human-readable summary
 * @param {Object} trackingData - Raw tracking data
 * @returns {string} Formatted tracking summary
 */
export const formatTrackingDetails = (trackingData) => {
  if (!trackingData || !trackingData.type) {
    return "No tracking information available on this page.";
  }

  let summary = "";

  if (trackingData.type === "order") {
    summary += `📦 Order ${trackingData.order_id}\n`;
    summary += `📅 Placed: ${new Date(trackingData.order_created_time).toLocaleDateString()}\n`;
    summary += `📊 Total Shipments: ${trackingData.total_shipments}\n\n`;

    if (trackingData.shipments?.length > 0) {
      trackingData.shipments.forEach((shipment, index) => {
        summary += `🚚 Shipment ${index + 1}: ${shipment.shipment_id}\n`;
        summary += `📋 Status: ${shipment.shipment_status?.title || "Unknown"}\n`;
        if (shipment.awb_no) summary += `🏷️ AWB: ${shipment.awb_no}\n`;
        if (shipment.tracking_no)
          summary += `🔢 Tracking: ${shipment.tracking_no}\n`;
        if (shipment.dp_name) summary += `🚛 Courier: ${shipment.dp_name}\n`;
        if (shipment.delivery_date)
          summary += `📅 Expected: ${new Date(shipment.delivery_date).toLocaleDateString()}\n`;

        if (shipment.bags?.length > 0) {
          summary += `📦 Items:\n`;
          shipment.bags.forEach((bag) => {
            summary += `  • ${bag.item_name}${bag.brand ? ` (${bag.brand})` : ""}${bag.size ? ` - Size: ${bag.size}` : ""} x ${bag.quantity}\n`;
          });
        }
        summary += "\n";
      });
    }
  } else if (trackingData.type === "shipment") {
    summary += `🚚 Shipment ${trackingData.shipment_id}\n`;
    summary += `📋 Status: ${trackingData.shipment_status?.title || "Unknown"}\n`;
    if (trackingData.order_id)
      summary += `📦 Order: ${trackingData.order_id}\n`;
    if (trackingData.awb_no) summary += `🏷️ AWB: ${trackingData.awb_no}\n`;
    if (trackingData.tracking_no)
      summary += `🔢 Tracking: ${trackingData.tracking_no}\n`;
    if (trackingData.dp_name)
      summary += `🚛 Courier: ${trackingData.dp_name}\n`;
    if (trackingData.delivery_date)
      summary += `📅 Expected: ${new Date(trackingData.delivery_date).toLocaleDateString()}\n`;

    if (trackingData.delivery_address) {
      const addr = trackingData.delivery_address;
      summary += `📍 Delivery Address: ${addr.display_address || `${addr.address}, ${addr.city}, ${addr.state} ${addr.pincode}`}\n`;
    }

    if (trackingData.bags?.length > 0) {
      summary += `📦 Items (${trackingData.total_bags} total):\n`;
      trackingData.bags.forEach((bag) => {
        summary += `  • ${bag.item_name}${bag.brand ? ` (${bag.brand})` : ""}${bag.size ? ` - Size: ${bag.size}` : ""} x ${bag.quantity}\n`;
      });
    }

    if (trackingData.tracking_details?.length > 0) {
      summary += `\n📍 Tracking History:\n`;
      trackingData.tracking_details
        .sort(
          (a, b) =>
            new Date(b.created_ts || b.time) - new Date(a.created_ts || a.time)
        )
        .slice(0, 5) // Show last 5 updates
        .forEach((detail) => {
          const date = new Date(
            detail.created_ts || detail.time
          ).toLocaleString();
          summary += `  • ${detail.status} - ${date}\n`;
        });
    }
  }

  return summary;
};

/**
 * Get order status by order ID
 * @param {string} orderId - Order ID to check
 * @returns {Promise<Object>} Order status information
 */
export const getOrderStatus = async (orderId) => {
  try {
    if (!window.fpi) {
      throw new Error("FPI not available");
    }

    const result = await window.fpi.executeGQL(ORDER_BY_ID, { orderId });
    if (result?.data?.order) {
      const order = result.data.order;
      return {
        success: true,
        type: "order",
        order_id: order.order_id,
        total_shipments: order.total_shipments_in_order,
        order_created_time: order.order_created_time,
        shipments_status: order.shipments?.map((ship) => ({
          shipment_id: ship.shipment_id,
          status: ship.shipment_status?.title,
          status_value: ship.shipment_status?.value,
          delivery_date: ship.delivery_date,
          tracking_no: ship.traking_no,
          awb_no: ship.awb_no,
          dp_name: ship.dp_name,
        })),
      };
    } else {
      return {
        success: false,
        message: `Order ${orderId} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting order status:", error);
    return {
      success: false,
      message: `Failed to get order status: ${error.message}`,
    };
  }
};

/**
 * Get shipment status by shipment ID
 * @param {string} shipmentId - Shipment ID to check
 * @returns {Promise<Object>} Shipment status information
 */
export const getShipmentStatus = async (shipmentId) => {
  try {
    if (!window.fpi) {
      throw new Error("FPI not available");
    }

    const result = await window.fpi.executeGQL(GET_SHIPMENT_DETAILS, {
      shipmentId,
    });
    if (result?.data?.shipment?.detail) {
      const shipment = result.data.shipment.detail;
      return {
        success: true,
        type: "shipment",
        shipment_id: shipment.shipment_id,
        order_id: shipment.order_id,
        status: shipment.shipment_status?.title || "Unknown",
        status_value: shipment.shipment_status?.value,
        delivery_date: shipment.delivery_date,
        tracking_no: shipment.traking_no,
        awb_no: shipment.awb_no,
        dp_name: shipment.dp_name,
        track_url: shipment.track_url,
        delivery_address: shipment.delivery_address,
      };
    } else {
      return {
        success: false,
        message: `Shipment ${shipmentId} not found`,
      };
    }
  } catch (error) {
    console.error("Error getting shipment status:", error);
    return {
      success: false,
      message: `Failed to get shipment status: ${error.message}`,
    };
  }
};

/**
 * Validate order ID format
 * @param {string} orderId - Order ID to validate
 * @returns {Object} Validation result
 */
export const validateOrderId = (orderId) => {
  if (!orderId) {
    return {
      valid: false,
      message: "Order ID is required",
    };
  }

  if (typeof orderId !== "string") {
    return {
      valid: false,
      message: "Order ID must be a string",
    };
  }

  if (orderId.length < 10) {
    return {
      valid: false,
      message: "Order ID must be at least 10 characters long",
    };
  }

  // Basic pattern check (alphanumeric)
  if (!/^[A-Za-z0-9]+$/.test(orderId)) {
    return {
      valid: false,
      message: "Order ID can only contain letters and numbers",
    };
  }

  return {
    valid: true,
    normalized: orderId.toUpperCase(),
  };
};

/**
 * Check if current page is an order-related page
 * @returns {Object} Page context information
 */
export const getOrderPageContext = () => {
  const pathname = window.location.pathname;

  let pageType = null;
  let context = {};

  if (pathname.includes("/order-tracking")) {
    pageType = "order_tracking";
    context.orderId = pathname.split("/order-tracking/")[1]?.split("/")[0];
  } else if (pathname.includes("/profile/orders/shipment/")) {
    pageType = "shipment_details";
    context.shipmentId = pathname
      .split("/profile/orders/shipment/")[1]
      ?.split("/")[0];
  } else if (pathname.includes("/profile/orders")) {
    pageType = "orders_list";
  } else if (pathname.includes("/order-status")) {
    pageType = "order_status";
  }

  return {
    isOrderPage: pageType !== null,
    pageType,
    context,
    pathname,
  };
};
