import {
  PAYMENT_AGG,
  PAYMENT_OPTIONS,
  SELECT_PAYMENT_MODE,
  VALID_UPI,
  CHECKOUT_LANDING,
} from "../../theme/queries/checkoutQuery";
import { CART_DETAILS } from "../../theme/queries/cartQuery";
import { isUserLoggedIn } from "../utils/wishlist-utils";

export const paymentActions = [
  {
    name: "get_payment_options",
    description:
      "Get payment options, show payment methods, list payment gateways, display payment options",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart (optional - will auto-detect from URL)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        address_id: {
          type: "string",
          description: "The selected address ID for payment context (optional)",
        },
      },
    },
    handler: async ({ cart_id, buy_now = false, address_id = null }) => {
      console.log(
        "💳 [PAYMENT OPTIONS - API_DIRECT] Starting get_payment_options",
        {
          provided_cart_id: cart_id,
          buy_now: buy_now,
          address_id: address_id,
          timestamp: new Date().toISOString(),
          version: "API_DIRECT_V1",
        }
      );

      try {
        // Step 1: Check FPI system availability
        if (!window.fpi) {
          return {
            success: false,
            message:
              "System temporarily unavailable. Please refresh the page and try again.",
            action_required: "system_error",
          };
        }

        // Step 2: Check user authentication
        const userLoggedIn = isUserLoggedIn();
        if (!userLoggedIn) {
          return {
            success: false,
            message: "Please log in to view payment options.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Get cart context
        const urlParams = new URLSearchParams(window.location.search);
        let finalCartId = cart_id || urlParams.get("id");
        let finalBuyNow =
          buy_now || JSON.parse(urlParams.get("buy_now") || "false");
        let finalAddressId = address_id || urlParams.get("address_id");

        if (!finalCartId) {
          return {
            success: false,
            message:
              "Cart ID not found. Please ensure you're in the checkout flow.",
            action_required: "missing_cart_id",
            suggested_action: "Navigate to checkout from cart page",
          };
        }

        console.log("📊 [PAYMENT OPTIONS] Context determined:", {
          cartId: finalCartId,
          addressId: finalAddressId,
          buyNow: finalBuyNow,
        });

        // Step 4: Get cart data first to determine amount and other details
        console.log(
          "📡 [PAYMENT OPTIONS] Getting cart data for payment context"
        );
        const cartPayload = {
          buyNow: finalBuyNow,
          includeBreakup: true,
          includeAllItems: true,
          includeCodCharges: true,
          ...(finalCartId && { cartId: finalCartId }),
        };

        const cartResult = await window.fpi.executeGQL(
          CART_DETAILS,
          cartPayload
        );

        if (!cartResult?.data?.cart) {
          return {
            success: false,
            message:
              "Unable to fetch cart data for payment options. Please try again.",
            action_required: "cart_not_found",
          };
        }

        const cartData = cartResult.data.cart;
        const finalResolvedCartId = cartData.id;

        // Step 5: Get required parameters for PAYMENT_OPTIONS query
        const breakupValues = cartData.breakup_values?.display || [];
        // Always take the 'total' key value and handle negative values
        let totalAmount = 0;
        const totalBreakup = breakupValues.find((item) => item.key === "total");
        if (totalBreakup && typeof totalBreakup.value === "number") {
          totalAmount = Math.abs(totalBreakup.value);
        }
        const amountInPaise = totalAmount * 100; // Convert to paise as required by API

        // Get pincode from localStorage or address_id if available
        let pincode = localStorage?.getItem("pincode") || "";

        // If we have address_id, we might need to get pincode from there
        if (!pincode && finalAddressId) {
          // For now, use a default pincode - in real scenario, would get from selected address
          pincode = "400001"; // This should be retrieved from selected address
        }

        if (!pincode) {
          return {
            success: false,
            message:
              "Unable to determine delivery pincode. Please select a delivery address first.",
            action_required: "pincode_required",
            suggested_action:
              "Select a delivery address first using 'select delivery address'",
          };
        }

        console.log("📊 [PAYMENT OPTIONS] Payment context determined:", {
          cartId: finalResolvedCartId,
          amount: totalAmount,
          amountInPaise: amountInPaise,
          pincode: pincode,
          checkoutMode: "self",
        });

        // Step 6: Call PAYMENT_OPTIONS API with correct parameters
        console.log(
          "📡 [PAYMENT OPTIONS] Calling PAYMENT_OPTIONS API directly"
        );
        const paymentPayload = {
          cartId: finalResolvedCartId,
          amount: amountInPaise,
          checkoutMode: "self",
          pincode: pincode,
        };

        const paymentResult = await window.fpi.executeGQL(
          PAYMENT_OPTIONS,
          paymentPayload
        );

        console.log("📋 [PAYMENT OPTIONS] API Response:", {
          hasData: !!paymentResult?.data,
          hasPaymentOptions:
            !!paymentResult?.data?.paymentModeRoutes?.payment_options,
          paymentOptionsCount:
            paymentResult?.data?.paymentModeRoutes?.payment_options
              ?.payment_option?.length || 0,
        });

        if (!paymentResult?.data?.paymentModeRoutes?.payment_options) {
          return {
            success: false,
            message:
              "No payment options available for your location. Please try a different address.",
            action_required: "no_payment_options",
            cart_context: {
              cart_id: finalResolvedCartId,
              amount: totalAmount,
              pincode: pincode,
            },
          };
        }

        // Step 7: Process and return payment options
        const paymentOptions =
          paymentResult.data.paymentModeRoutes.payment_options.payment_option ||
          [];
        const aggregatorDetails =
          paymentResult.data.paymentModeRoutes.payment_options
            .aggregator_details || [];

        // Step 5: Process and categorize payment options
        const enhancedPaymentOptions = paymentOptions.map((option, index) => ({
          ...option,
          position: index + 1,
        }));

        // Categorize payment methods by type
        const categorizedPayments = {
          cards: enhancedPaymentOptions.filter((opt) => opt.name === "CARD"),
          upi: enhancedPaymentOptions.filter((opt) => opt.name === "UPI"),
          wallets: enhancedPaymentOptions.filter((opt) => opt.name === "WL"),
          net_banking: enhancedPaymentOptions.filter(
            (opt) => opt.name === "NB"
          ),
          cod: enhancedPaymentOptions.filter((opt) => opt.name === "COD"),
          pay_later: enhancedPaymentOptions.filter((opt) => opt.name === "PL"),
          cardless_emi: enhancedPaymentOptions.filter(
            (opt) => opt.name === "CARDLESS_EMI"
          ),
        };

        // Step 6: Determine recommendations
        const recommendations = {
          fastest: categorizedPayments.upi[0] || categorizedPayments.cards[0],
          most_popular:
            categorizedPayments.cards[0] || categorizedPayments.upi[0],
          cod_available: categorizedPayments.cod.length > 0,
        };

        return {
          success: true,
          message: `Found ${enhancedPaymentOptions.length} payment options available for your cart.`,
          payment_data: {
            payment_options: enhancedPaymentOptions,
            categorized_payments: categorizedPayments,
            recommendations: recommendations,
            order_context: {
              cart_id: finalCartId,
              address_id: finalAddressId,
              buy_now: finalBuyNow,
              cod_available: categorizedPayments.cod.length > 0,
              cod_charges: categorizedPayments.cod[0]?.total_charges || 0,
            },
            data_source: "direct_api",
          },
          summary: {
            total_payment_options: enhancedPaymentOptions.length,
            recommended_method:
              recommendations.fastest?.display_name || "Standard Payment",
            cod_available: recommendations.cod_available,
          },
          next_actions: [
            `Select payment: "use ${recommendations.fastest?.display_name?.toLowerCase() || "payment method"}" or "pay with UPI"`,
            `Select by position: "use 1st payment option" or "select 2nd method"`,
            `Choose specific: "pay with cards" or "use COD"`,
          ],
        };
      } catch (error) {
        console.error("❌ [PAYMENT OPTIONS] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while fetching payment options. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "select_payment_method",
    description:
      "Select payment method, choose payment gateway, set payment mode, pick payment option. Intelligently matches user's payment selection and applies it exactly like usePayment.jsx selectPaymentMode.",
    timeout: 15000,
    keywords: [
      "select payment",
      "choose payment",
      "payment method",
      "payment gateway",
      "use payment",
      "set payment",
    ],
    examples: [
      "select UPI payment",
      "use card payment",
      "choose COD",
      "pay with wallet",
      "use first payment option",
      "select saved card",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart (optional - will auto-detect from URL)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        address_id: {
          type: "string",
          description: "The selected address ID (optional)",
        },
        payment_method: {
          type: "string",
          description:
            "Payment method to select (UPI, CARD, COD, WL, NB, PL, CARDLESS_EMI, or position like '1st', '2nd')",
        },
        payment_data: {
          type: "object",
          description:
            "Payment data from get_payment_options (optional - will use session if not provided)",
        },
      },
      required: ["payment_method"],
    },
    handler: async ({
      cart_id,
      buy_now = false,
      address_id = null,
      payment_method,
      payment_data = null,
    }) => {
      console.log(
        "💳 [SELECT PAYMENT - API_DIRECT] Starting select_payment_method",
        {
          provided_cart_id: cart_id,
          buy_now: buy_now,
          payment_method: payment_method,
          address_id: address_id,
          timestamp: new Date().toISOString(),
          version: "API_DIRECT_V1",
        }
      );

      try {
        // Step 1: Check FPI system availability
        if (!window.fpi) {
          return {
            success: false,
            message:
              "System temporarily unavailable. Please refresh the page and try again.",
            action_required: "system_error",
          };
        }

        // Step 2: Check user authentication
        const userLoggedIn = isUserLoggedIn();
        if (!userLoggedIn) {
          return {
            success: false,
            message: "Please log in to select a payment method.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Get cart context
        const urlParams = new URLSearchParams(window.location.search);
        let finalCartId = cart_id || urlParams.get("id");
        let finalBuyNow =
          buy_now || JSON.parse(urlParams.get("buy_now") || "false");
        let finalAddressId = address_id || urlParams.get("address_id");

        if (!finalCartId) {
          return {
            success: false,
            message:
              "Cart ID not found. Please ensure you're in the checkout flow.",
            action_required: "missing_cart_id",
          };
        }

        console.log("📊 [SELECT PAYMENT] Payment selection context:", {
          cartId: finalCartId,
          addressId: finalAddressId,
          method: payment_method,
        });

        // Step 4: Get payment options using the correct API call
        // First get cart data for required parameters
        const initialCartPayload = {
          buyNow: finalBuyNow,
          includeBreakup: true,
          includeAllItems: true,
          includeCodCharges: true,
          cartId: finalCartId,
        };

        const cartResult = await window.fpi.executeGQL(
          CART_DETAILS,
          initialCartPayload
        );

        if (!cartResult?.data?.cart) {
          return {
            success: false,
            message: "Unable to fetch cart data. Please try again.",
            action_required: "cart_not_found",
          };
        }

        const cartData = cartResult.data.cart;

        // Get required parameters for PAYMENT_OPTIONS query
        const breakupValues = cartData.breakup_values?.display || [];
        // Always take the 'total' key value and handle negative values
        let totalAmount = 0;
        const totalBreakup = breakupValues.find((item) => item.key === "total");
        if (totalBreakup && typeof totalBreakup.value === "number") {
          totalAmount = Math.abs(totalBreakup.value);
        }
        const amountInPaise = totalAmount * 100;

        // Get pincode
        let pincode = localStorage?.getItem("pincode") || "";
        if (!pincode) {
          pincode = "400001"; // Default pincode
        }

        console.log(
          "📡 [SELECT PAYMENT] Getting payment options with correct parameters"
        );
        const paymentPayload = {
          cartId: finalCartId,
          amount: amountInPaise,
          checkoutMode: "self",
          pincode: pincode,
        };

        const paymentOptionsResult = await window.fpi.executeGQL(
          PAYMENT_OPTIONS,
          paymentPayload
        );

        if (
          !paymentOptionsResult?.data?.paymentModeRoutes?.payment_options
            ?.payment_option
        ) {
          return {
            success: false,
            message:
              "Payment options not available. Please select a delivery address first.",
            action_required: "fetch_payment_options_first",
            suggested_action:
              'Run: "select delivery address" first, then try payment selection',
          };
        }

        const paymentOptions =
          paymentOptionsResult.data.paymentModeRoutes.payment_options
            .payment_option || [];

        console.log("🔍 [SELECT PAYMENT] Available payment options:", {
          totalOptions: paymentOptions.length,
          optionNames: paymentOptions.map((opt) => opt.name),
          firstOptionStructure: paymentOptions[0],
          upiOption: paymentOptions.find((opt) => opt.name === "UPI"),
        });

        // Step 5: Find the selected payment method (intelligent matching)
        let selectedPaymentOption = null;
        let selectionMethod = "unknown";

        const method = payment_method.toLowerCase().trim();

        // Direct method name matching
        const methodMapping = {
          card: "CARD",
          cards: "CARD",
          upi: "UPI",
          wallet: "WL",
          wallets: "WL",
          netbanking: "NB",
          "net banking": "NB",
          nb: "NB",
          cod: "COD",
          "cash on delivery": "COD",
          "pay later": "PL",
          paylater: "PL",
          pl: "PL",
          "cardless emi": "CARDLESS_EMI",
          cardless_emi: "CARDLESS_EMI",
          emi: "CARDLESS_EMI",
        };

        if (methodMapping[method]) {
          const paymentOptionGroup = paymentOptions.find(
            (opt) => opt.name === methodMapping[method]
          );
          // Get the actual payment data from list[0] (like usePayment.jsx does)
          selectedPaymentOption = paymentOptionGroup?.list?.[0];
          selectionMethod = `direct_${methodMapping[method].toLowerCase()}`;
        }
        // Position-based selection (1st, 2nd, etc.)
        else if (method.match(/^(\d+)(st|nd|rd|th)?$/)) {
          const position = parseInt(method.match(/^(\d+)/)[1]);
          if (position > 0 && position <= paymentOptions.length) {
            const paymentOptionGroup = paymentOptions[position - 1];
            selectedPaymentOption = paymentOptionGroup?.list?.[0];
            selectionMethod = `position_${position}`;
          }
        }
        // First available option
        else if (method.includes("first") || method.includes("default")) {
          const paymentOptionGroup = paymentOptions[0];
          selectedPaymentOption = paymentOptionGroup?.list?.[0];
          selectionMethod = "first_available";
        }

        if (!selectedPaymentOption) {
          return {
            success: false,
            message: `Payment method "${payment_method}" not found or not available. Please try a different payment option.`,
            action_required: "retry_selection",
            available_methods: paymentOptions.map((opt) => ({
              name: opt.name,
              display_name: opt.display_name,
              position: opt.position,
            })),
            suggested_action: 'Try: "use first payment" or "pay with UPI"',
          };
        }

        console.log("🔍 [SELECT PAYMENT] Payment method matching results:", {
          selectionMethod: selectionMethod,
          selectedMethod:
            selectedPaymentOption.display_name || selectedPaymentOption.name,
          selectedPaymentOption: selectedPaymentOption, // Add full object for debugging
        });

        // Step 6: Apply payment mode selection using SELECT_PAYMENT_MODE
        console.log("📡 [SELECT PAYMENT] Applying payment mode selection");

        const updateCartPaymentRequestInput = {
          payment_mode: selectedPaymentOption.name,
          aggregator_name: selectedPaymentOption.aggregator_name,
          payment_identifier: selectedPaymentOption.code || "",
          ...(selectedPaymentOption.merchant_code && {
            merchant_code: selectedPaymentOption.merchant_code,
          }),
        };

        await window.fpi.executeGQL(SELECT_PAYMENT_MODE, {
          id: finalCartId,
          buyNow: finalBuyNow,
          updateCartPaymentRequestInput: updateCartPaymentRequestInput,
        });

        // Step 6.5: Add payment parameters to URL (like usePayment.jsx addParamsToLocation)
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("payment_mode", selectedPaymentOption.name);
        currentUrl.searchParams.set(
          "aggregator_name",
          selectedPaymentOption.aggregator_name
        );
        currentUrl.searchParams.set(
          "payment_identifier",
          selectedPaymentOption.code || ""
        );
        if (selectedPaymentOption.merchant_code) {
          currentUrl.searchParams.set(
            "merchant_code",
            selectedPaymentOption.merchant_code
          );
        }
        window.history.pushState({}, "", currentUrl.toString());

        console.log("🔗 [SELECT PAYMENT] Payment parameters added to URL:", {
          payment_mode: selectedPaymentOption.name,
          aggregator_name: selectedPaymentOption.aggregator_name,
          payment_identifier: selectedPaymentOption.code || "",
          merchant_code: selectedPaymentOption.merchant_code,
        });

        // Step 7: Refresh cart data after payment selection
        const refreshCartPayload = {
          buyNow: finalBuyNow,
          includeAllItems: true,
          includeBreakup: true,
          includeCodCharges: true,
        };
        const updatedCartResult = await window.fpi.executeGQL(
          CART_DETAILS,
          refreshCartPayload
        );

        console.log(
          "✅ [SELECT PAYMENT] Payment method successfully selected:",
          {
            method: selectedPaymentOption.display_name,
            cartId: finalCartId,
            addressId: finalAddressId,
            selectionMethod: selectionMethod,
          }
        );

        return {
          success: true,
          message: `🎉 Payment method "${selectedPaymentOption.display_name}" has been successfully selected for your order.`,
          selected_payment: {
            method: selectedPaymentOption.name,
            display_name: selectedPaymentOption.display_name,
            type: selectionMethod,
            aggregator_name: selectedPaymentOption.aggregator_name,
            is_cod: selectedPaymentOption.name === "COD",
          },
          cart_summary: {
            cart_id: finalCartId,
            total:
              updatedCartResult?.data?.cart?.breakup_values?.raw?.total || 0,
            currency: updatedCartResult?.data?.cart?.currency?.symbol || "₹",
            items_count: updatedCartResult?.data?.cart?.items?.length || 0,
          },
          next_actions: [
            'Complete checkout: "checkout and pay" or "place order"',
            'Change payment: "use different payment method" if needed',
          ],
        };
      } catch (error) {
        console.error("❌ [SELECT PAYMENT] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while selecting payment method. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "checkout_and_pay",
    description:
      "Complete checkout and process payment, finalize order, place order, proceed to payment. Completes the checkout process using the previously selected payment method, following the exact same flow as usePayment.jsx.",
    timeout: 30000,
    keywords: [
      "checkout and pay",
      "place order",
      "complete checkout",
      "proceed to payment",
      "finalize order",
      "pay now",
    ],
    examples: [
      "checkout and pay",
      "place my order",
      "complete the checkout",
      "proceed to payment",
      "pay now",
      "finalize order",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart (optional - will auto-detect from URL)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        address_id: {
          type: "string",
          description: "The selected address ID (optional)",
        },
        payment_mode: {
          type: "string",
          description:
            "Selected payment mode (UPI, CARD, COD, WL, NB, PL) - will detect from URL if not provided",
        },
        upi_vpa: {
          type: "string",
          description:
            "UPI VPA/ID for UPI payments (optional - required only for UPI)",
        },
      },
    },
    handler: async ({
      cart_id,
      buy_now = false,
      address_id = null,
      payment_mode = null,
      upi_vpa = null,
    }) => {
      console.log("🚀 [CHECKOUT PAY - API_DIRECT] Starting checkout_and_pay", {
        provided_cart_id: cart_id,
        buy_now: buy_now,
        address_id: address_id,
        payment_mode: payment_mode,
        upi_vpa: upi_vpa,
        timestamp: new Date().toISOString(),
        version: "API_DIRECT_V2",
      });

      try {
        // Step 1: Check FPI system availability
        if (!window.fpi || !window.fpi.payment) {
          return {
            success: false,
            message:
              "Payment system temporarily unavailable. Please refresh the page and try again.",
            action_required: "system_error",
          };
        }

        // Step 2: Check user authentication
        const userLoggedIn = isUserLoggedIn();
        if (!userLoggedIn) {
          return {
            success: false,
            message: "Please log in to complete checkout.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Get cart and payment context from URL and parameters
        const urlParams = new URLSearchParams(window.location.search);

        // Auto-detect cart ID and address ID, ignore literal string parameters
        let finalCartId = urlParams.get("id");
        let finalBuyNow = JSON.parse(urlParams.get("buy_now") || "false");
        let finalAddressId = urlParams.get("address_id");

        // Only use provided parameters if they're not literal strings
        if (
          cart_id &&
          cart_id !== "cart_id" &&
          cart_id !== "current" &&
          cart_id !== "undefined"
        ) {
          finalCartId = cart_id;
        }
        if (
          address_id &&
          address_id !== "address_id" &&
          address_id !== "default" &&
          address_id !== "undefined"
        ) {
          finalAddressId = address_id;
        }
        if (typeof buy_now === "boolean") {
          finalBuyNow = buy_now;
        }

        // Get payment context from URL (set by select_payment_method)
        let finalPaymentMode = payment_mode || urlParams.get("payment_mode");
        let aggregatorName = urlParams.get("aggregator_name");
        let paymentIdentifier = urlParams.get("payment_identifier");
        let merchantCode = urlParams.get("merchant_code");

        console.log("📊 [CHECKOUT PAY] Payment context from URL:", {
          cartId: finalCartId,
          addressId: finalAddressId,
          paymentMode: finalPaymentMode,
          aggregatorName: aggregatorName,
          paymentIdentifier: paymentIdentifier,
          merchantCode: merchantCode,
          urlParamsRaw: Object.fromEntries(urlParams.entries()),
        });

        // Validation and fallback for missing IDs
        if (!finalCartId) {
          // Try to get cart ID from current cart
          try {
            const cartResult = await window.fpi.executeGQL(CART_DETAILS, {
              buyNow: finalBuyNow,
              includeBreakup: false,
              includeAllItems: false,
            });
            finalCartId = cartResult?.data?.cart?.id;
            console.log(
              "🔍 [CHECKOUT PAY] Auto-detected cart ID:",
              finalCartId
            );
          } catch (error) {
            console.log(
              "⚠️ [CHECKOUT PAY] Failed to auto-detect cart ID:",
              error
            );
          }
        }

        if (!finalCartId) {
          return {
            success: false,
            message:
              "Cart ID not found. Please ensure you're in the checkout flow.",
            action_required: "missing_cart_id",
            suggested_action: "Navigate to checkout from cart page first",
          };
        }

        if (!finalAddressId) {
          // Try to get default address or first available address
          try {
            const addressResult = await window.fpi.executeGQL(
              CHECKOUT_LANDING,
              {
                buyNow: finalBuyNow,
                includeBreakup: false,
                includeAllItems: false,
                id: finalCartId,
              }
            );
            const addresses = addressResult?.data?.addresses?.address || [];
            const defaultAddress = addresses.find(
              (addr) => addr.is_default_address
            );
            finalAddressId = defaultAddress?.id || addresses[0]?.id;
            console.log(
              "🔍 [CHECKOUT PAY] Auto-detected address ID:",
              finalAddressId
            );
          } catch (error) {
            console.log(
              "⚠️ [CHECKOUT PAY] Failed to auto-detect address ID:",
              error
            );
          }
        }

        if (!finalAddressId) {
          return {
            success: false,
            message:
              "Please select a delivery address before completing checkout.",
            action_required: "address_required",
            suggested_action: 'Run: "select delivery address" first',
          };
        }

        if (!finalPaymentMode) {
          // Try to detect payment method from cart data
          try {
            const cartResult = await window.fpi.executeGQL(CART_DETAILS, {
              buyNow: finalBuyNow,
              includeBreakup: true,
              includeAllItems: false,
              cartId: finalCartId,
            });
            // Check if there's a selected payment mode in cart
            const paymentMode = cartResult?.data?.cart?.payment_mode;
            if (paymentMode) {
              finalPaymentMode = paymentMode;
              console.log(
                "🔍 [CHECKOUT PAY] Auto-detected payment mode from cart:",
                finalPaymentMode
              );
            }
          } catch (error) {
            console.log(
              "⚠️ [CHECKOUT PAY] Failed to auto-detect payment mode:",
              error
            );
          }
        }

        if (!finalPaymentMode) {
          return {
            success: false,
            message:
              "Please select a payment method before completing checkout.",
            action_required: "payment_method_required",
            suggested_action:
              'Run: "select payment method" first (e.g., "use UPI payment")',
            debug_info: {
              urlParams: Object.fromEntries(urlParams.entries()),
              cartId: finalCartId,
              addressId: finalAddressId,
            },
          };
        }

        // Step 4: Get payment options to find the selected payment method details
        const breakupValues = [];
        let totalAmount = 0;
        let amountInPaise = 0;
        let pincode = localStorage?.getItem("pincode") || "400001";

        // Get cart data for amount calculation
        const cartPayload = {
          buyNow: finalBuyNow,
          includeBreakup: true,
          includeAllItems: true,
          includeCodCharges: true,
          cartId: finalCartId,
        };

        const cartResult = await window.fpi.executeGQL(
          CART_DETAILS,
          cartPayload
        );

        if (!cartResult?.data?.cart) {
          return {
            success: false,
            message: "Unable to fetch cart data. Please try again.",
            action_required: "cart_not_found",
          };
        }

        const cartData = cartResult.data.cart;
        const cartBreakupValues = cartData.breakup_values?.display || [];
        // Always take the 'total' key value and handle negative values
        const totalBreakup = cartBreakupValues.find((item) => item.key === "total");
        totalAmount = totalBreakup && typeof totalBreakup.value === "number" ? Math.abs(totalBreakup.value) : 0;
        amountInPaise = totalAmount * 100;

        // Get payment options to find selected payment method details
        const paymentPayload = {
          cartId: finalCartId,
          amount: amountInPaise,
          checkoutMode: "self",
          pincode: pincode,
        };

        const paymentResult = await window.fpi.executeGQL(
          PAYMENT_OPTIONS,
          paymentPayload
        );

        if (
          !paymentResult?.data?.paymentModeRoutes?.payment_options
            ?.payment_option
        ) {
          return {
            success: false,
            message: "Payment options not available. Please try again.",
            action_required: "payment_options_failed",
          };
        }

        const paymentOptions =
          paymentResult.data.paymentModeRoutes.payment_options.payment_option ||
          [];
        const aggregatorDetails =
          paymentResult.data.paymentModeRoutes.payment_options
            .aggregator_details || [];

        // Find the selected payment method
        const paymentOptionGroup = paymentOptions.find(
          (option) => option.name === finalPaymentMode
        );
        let selectedPaymentOption = paymentOptionGroup?.list?.[0];

        if (!selectedPaymentOption) {
          return {
            success: false,
            message: `Selected payment method "${finalPaymentMode}" is no longer available.`,
            action_required: "payment_method_unavailable",
            suggested_action: "Please select a different payment method",
            debug_info: {
              availableOptions: paymentOptions.map((opt) => opt.name),
              requestedPaymentMode: finalPaymentMode,
              paymentOptionGroup: paymentOptionGroup,
            },
          };
        }

        console.log("💳 [CHECKOUT PAY] Selected payment method found:", {
          paymentMethod: selectedPaymentOption.display_name,
          aggregator: selectedPaymentOption.aggregator_name,
        });

        // Step 5: Helper function for query parameters (like usePayment.jsx)
        function getQueryParams() {
          const queryParams = {};
          for (const [key, value] of urlParams.entries()) {
            queryParams[key] = value;
          }
          return queryParams;
        }

        // Step 6: Process payment based on payment mode (following usePayment.jsx patterns)
        const paymentflow = aggregatorDetails?.find(
          (item) =>
            item.aggregator_key === selectedPaymentOption.aggregator_name
        );

        let checkoutPaymentOptions = {};

        if (finalPaymentMode === "UPI") {
          // UPI Payment Flow (following usePayment.jsx lines 530-660)
          const vpa = upi_vpa || paymentIdentifier;

          if (!vpa) {
            return {
              success: false,
              message:
                "UPI ID is required for UPI payments. Please provide your UPI ID.",
              action_required: "upi_vpa_required",
              suggested_action:
                'Provide UPI ID like: "checkout and pay with UPI ID user@paytm"',
            };
          }

          // Validate UPI VPA (following usePayment.jsx)
          try {
            console.log("🔍 [CHECKOUT PAY] UPI Validation input:", {
              upi_vpa: vpa,
              aggregator: selectedPaymentOption.aggregator_name,
              selectedPaymentOption: selectedPaymentOption,
            });

            const upiValidationResult = await window.fpi.executeGQL(VALID_UPI, {
              validateVPARequestInput: {
                upi_vpa: vpa,
                aggregator: selectedPaymentOption.aggregator_name,
              },
            });

            console.log("🔍 [CHECKOUT PAY] UPI Validation result:", {
              result: upiValidationResult?.data?.validateVPA,
              isValid: upiValidationResult?.data?.validateVPA?.data?.is_valid,
            });

            if (!upiValidationResult?.data?.validateVPA?.data?.is_valid) {
              return {
                success: false,
                message: `Invalid UPI ID "${vpa}". Please check and try again.`,
                action_required: "invalid_upi_vpa",
                suggested_action:
                  "Provide a valid UPI ID like: user@paytm, user@phonepe, etc.",
                debug_info: {
                  vpa: vpa,
                  aggregator: selectedPaymentOption.aggregator_name,
                  validation_response: upiValidationResult?.data?.validateVPA,
                },
              };
            }
          } catch (error) {
            console.log(
              "⚠️ [CHECKOUT PAY] UPI validation failed, proceeding anyway:",
              error
            );
          }

          checkoutPaymentOptions = {
            payment_mode: finalPaymentMode,
            aggregator_name: selectedPaymentOption.aggregator_name,
            payment_identifier: vpa,
            merchant_code: selectedPaymentOption.merchant_code,
            payment: {
              ...selectedPaymentOption,
              upi: vpa,
            },
            address_id: finalAddressId,
            billing_address_id: finalAddressId,
            paymentflow: paymentflow,
            buy_now: finalBuyNow,
            queryParams: getQueryParams(),
          };
        } else if (finalPaymentMode === "COD") {
          // COD Payment Flow (following usePayment.jsx lines 837-870)
          // Note: COD uses the payment option group, not list[0]
          const selectedTabData = paymentOptionGroup; // This is like selectedTabData in UI

          console.log("💰 [CHECKOUT PAY] COD Payment Flow:", {
            selectedTabData: selectedTabData,
            aggregator_name: selectedTabData?.aggregator_name,
            payment_mode_id: selectedTabData?.payment_mode_id,
          });

          const payload = {
            payment_mode: "COD",
            id: finalCartId,
            address_id: finalAddressId,
          };

          // Remove 'id' field from options (like usePayment.jsx does)
          const { id, is_redirection, ...options } = payload;

          checkoutPaymentOptions = {
            ...options, // This spreads payment_mode and address_id (but not id)
            aggregator_name: selectedTabData.aggregator_name,
            queryParams: getQueryParams(),
            payment: selectedTabData,
            address_id: finalAddressId,
            billing_address_id: finalAddressId,
            paymentflow: aggregatorDetails?.find(
              (item) => item.aggregator_key === selectedTabData?.aggregator_name
            ),
            buy_now: finalBuyNow,
          };
        } else if (finalPaymentMode === "CARD") {
          // Card Payment Flow (basic - would need card details for full implementation)
          checkoutPaymentOptions = {
            payment_mode: finalPaymentMode,
            aggregator_name: selectedPaymentOption.aggregator_name,
            payment_identifier: selectedPaymentOption.code || "",
            payment: selectedPaymentOption,
            address_id: finalAddressId,
            billing_address_id: finalAddressId,
            paymentflow: paymentflow,
            buy_now: finalBuyNow,
            queryParams: getQueryParams(),
          };
        } else if (finalPaymentMode === "WL") {
          // Wallet Payment Flow
          checkoutPaymentOptions = {
            payment_mode: finalPaymentMode,
            aggregator_name: selectedPaymentOption.aggregator_name,
            payment_identifier: selectedPaymentOption.code || "",
            merchant_code: selectedPaymentOption.merchant_code,
            payment: selectedPaymentOption,
            address_id: finalAddressId,
            billing_address_id: finalAddressId,
            paymentflow: paymentflow,
            buy_now: finalBuyNow,
            queryParams: getQueryParams(),
          };
        } else {
          // Generic payment flow for other methods (NB, PL, etc.)
          checkoutPaymentOptions = {
            payment_mode: finalPaymentMode,
            aggregator_name: selectedPaymentOption.aggregator_name,
            payment_identifier: selectedPaymentOption.code || "",
            merchant_code: selectedPaymentOption.merchant_code,
            payment: selectedPaymentOption,
            address_id: finalAddressId,
            billing_address_id: finalAddressId,
            paymentflow: paymentflow,
            buy_now: finalBuyNow,
            queryParams: getQueryParams(),
          };
        }

        console.log(
          "🚀 [CHECKOUT PAY] Initiating payment with fpi.payment.checkoutPayment"
        );

        // Step 7: Execute payment (following usePayment.jsx patterns)
        const paymentResponse = await window.fpi.payment.checkoutPayment(
          checkoutPaymentOptions
        );

        console.log("📋 [CHECKOUT PAY] Payment response received:", {
          hasError: !!paymentResponse?.error,
          requestStatus: paymentResponse?.meta?.requestStatus,
          hasPayload: !!paymentResponse?.payload,
        });

        // Handle payment response (following usePayment.jsx error handling)
        if (paymentResponse?.error?.message) {
          return {
            success: false,
            message:
              paymentResponse.error.message ||
              "Payment failed. Please try again.",
            action_required: "payment_failed",
            error_details: paymentResponse.error,
            suggested_action:
              "Try a different payment method or contact support",
          };
        }

        if (paymentResponse?.meta?.requestStatus === "rejected") {
          return {
            success: false,
            message:
              paymentResponse?.payload?.message ||
              "Payment was rejected. Please try again.",
            action_required: "payment_rejected",
            error_details: paymentResponse?.payload,
            suggested_action:
              "Check payment details and try again, or use a different payment method",
          };
        }

        // Step 8: Handle successful payment initiation
        console.log("✅ [CHECKOUT PAY] Payment successfully initiated");

        return {
          success: true,
          message: `🎉 Order has been successfully placed! Payment is being processed using ${selectedPaymentOption.display_name}.`,
          order_summary: {
            cart_id: finalCartId,
            total_amount: totalAmount,
            currency: cartData.currency?.symbol || "₹",
            items_count: cartData.items?.length || 0,
            payment_method: selectedPaymentOption.display_name,
            delivery_address_id: finalAddressId,
          },
          payment_details: {
            method: selectedPaymentOption.display_name,
            mode: finalPaymentMode,
            aggregator: selectedPaymentOption.aggregator_name,
            status: "initiated",
            ...(finalPaymentMode === "UPI" && {
              upi_vpa: upi_vpa || paymentIdentifier,
            }),
          },
          next_steps: [
            finalPaymentMode === "COD"
              ? "Your order is confirmed! Pay cash when the order is delivered."
              : "You will be redirected to the payment gateway to complete payment",
            "After successful payment, you'll receive order confirmation",
            "Track your order in the orders section",
          ],
          action: "payment_initiated",
          checkout_flow_completed: true,
        };
      } catch (error) {
        console.error("❌ [CHECKOUT PAY] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred during checkout. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
          suggested_action:
            "Try again or contact support if the issue persists",
        };
      }
    },
  },
];
