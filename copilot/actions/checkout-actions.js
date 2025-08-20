import { spaNavigate } from "../../theme/helper/utils";
import {
  CART_DETAILS,
  APPLY_COUPON,
  REMOVE_COUPON,
} from "../../theme/queries/cartQuery";
import {
  CHECKOUT_LANDING,
  SELECT_ADDRESS,
  FETCH_SHIPMENTS,
} from "../../theme/queries/checkoutQuery";
import { isUserLoggedIn } from "../utils/wishlist-utils";

export const checkoutActions = [
  {
    name: "navigate_to_checkout_page",
    description:
      "Navigate to checkout page, proceed to checkout, go to checkout, start checkout process, checkout now, begin checkout. Validates the current cart and navigates to the checkout page. This action also fetches comprehensive checkout data including addresses and coupons that can be used by subsequent actions.",
    timeout: 15000,
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart to checkout (optional - will auto-detect from current cart)",
        },
        fetch_addresses: {
          type: "boolean",
          description:
            "Whether to also fetch shipping addresses (optional, defaults to true for optimization)",
        },
      },
    },
    handler: async ({ cart_id, fetch_addresses = true }) => {
      console.log("🚀 [CHECKOUT ACTION] Starting navigate_to_checkout_page", {
        provided_cart_id: cart_id,
        fetch_addresses: fetch_addresses,
        timestamp: new Date().toISOString(),
      });

      try {
        // Step 1: Check FPI system availability
        console.log(
          "🔍 [CHECKOUT ACTION] Step 1: Checking FPI system availability"
        );
        if (!window.fpi) {
          console.log("❌ [CHECKOUT ACTION] FPI system not available");
          return {
            success: false,
            message:
              "System temporarily unavailable. Please refresh the page and try again.",
            action_required: "system_error",
          };
        }
        console.log("✅ [CHECKOUT ACTION] FPI system available");

        // Step 2: Check user authentication
        console.log(
          "🔍 [CHECKOUT ACTION] Step 2: Checking user authentication"
        );
        const userLoggedIn = isUserLoggedIn();

        console.log("👤 [CHECKOUT ACTION] Authentication status:", {
          userLoggedIn: userLoggedIn,
        });

        if (!userLoggedIn) {
          console.log(
            "🔒 [CHECKOUT ACTION] User not logged in and guest checkout disabled - redirecting to login"
          );
          spaNavigate(
            "/auth/login?redirectUrl=" +
              encodeURIComponent(
                "/cart/checkout" + (cart_id ? `?id=${cart_id}` : "")
              )
          );
          return {
            success: true,
            message:
              "Please log in to proceed with checkout. You'll be redirected back after login.",
            action: "redirect_to_login",
            url: "/auth/login",
            reason: "authentication_required",
          };
        }

        console.log(
          "✅ [CHECKOUT ACTION] User authenticated - proceeding with checkout"
        );

        // Step 3: Choose API call based on whether addresses are needed
        console.log(
          "📡 [CHECKOUT ACTION] Step 3: Calling API for checkout data"
        );

        let apiResult,
          cartData,
          addressesData = null,
          couponsData = null;

        if (fetch_addresses && userLoggedIn) {
          // Use CHECKOUT_LANDING for comprehensive data (cart + addresses + coupons)
          console.log(
            "📡 [CHECKOUT ACTION] Using CHECKOUT_LANDING for comprehensive data"
          );
          const apiPayload = {
            buyNow: false,
            includeAllItems: true,
            includeBreakup: true,
            includeCodCharges: true,
            ...(cart_id && { id: cart_id }),
          };

          apiResult = await window.fpi.executeGQL(CHECKOUT_LANDING, apiPayload);
          cartData = apiResult?.data?.cart;
          addressesData = apiResult?.data?.addresses;
          couponsData = apiResult?.data?.coupons;
        } else {
          // Use CART_DETAILS for cart-only data (faster, smaller response)
          console.log(
            "📡 [CHECKOUT ACTION] Using CART_DETAILS for cart-only data"
          );
          const apiPayload = {
            buyNow: false,
            includeAllItems: true,
            includeBreakup: true,
            ...(cart_id && { cartId: cart_id }),
          };

          apiResult = await window.fpi.executeGQL(CART_DETAILS, apiPayload);
          cartData = apiResult?.data?.cart;
        }

        console.log("📦 [CHECKOUT ACTION] API response received:", {
          hasData: !!apiResult?.data,
          hasCart: !!cartData,
          hasAddresses: !!addressesData,
          hasCoupons: !!couponsData,
          apiUsed: fetch_addresses ? "CHECKOUT_LANDING" : "CART_DETAILS",
        });

        // Step 4: Validate API response
        console.log("🔍 [CHECKOUT ACTION] Step 4: Validating API response");
        if (!cartData) {
          console.log("❌ [CHECKOUT ACTION] No cart data in API response");
          return {
            success: false,
            message: "Unable to fetch cart data. Please refresh the page.",
            action_required: "cart_fetch_failed",
          };
        }

        console.log("📊 [CHECKOUT ACTION] Cart data extracted:", {
          cartId: cartData?.id,
          cartUid: cartData?.uid,
          isValid: cartData?.is_valid,
          itemCount: cartData?.items?.length || 0,
        });

        // Step 5: Determine cart ID to use
        console.log("🔍 [CHECKOUT ACTION] Step 5: Determining cart ID to use");
        const finalCartId = cart_id || cartData?.id;
        console.log("🆔 [CHECKOUT ACTION] Cart ID resolution:", {
          providedCartId: cart_id,
          apiCartId: cartData?.id,
          finalCartId: finalCartId,
        });

        if (!finalCartId) {
          console.log(
            "⚠️ [CHECKOUT ACTION] No cart ID available - redirecting to cart"
          );
          spaNavigate("/cart/bag");
          console.log("🔄 [CHECKOUT ACTION] Navigation executed: /cart/bag");
          return {
            success: true,
            message: "No cart found. Redirected to cart page.",
            action: "redirect_to_cart",
            url: "/cart/bag",
          };
        }

        // Step 6: Validate cart state
        console.log("🔍 [CHECKOUT ACTION] Step 6: Validating cart state");
        const items = cartData?.items || [];

        if (items.length === 0) {
          console.log("⚠️ [CHECKOUT ACTION] Empty cart - redirecting to cart");
          spaNavigate("/cart/bag");
          return {
            success: true,
            message: "Cart is empty. Redirected to cart page to add items.",
            action: "redirect_to_cart",
            url: "/cart/bag",
            reason: "empty_cart",
          };
        }

        // Step 7: Check for validation issues
        console.log(
          "🔍 [CHECKOUT ACTION] Step 7: Checking for validation issues"
        );
        const validationIssues = [];

        if (cartData?.is_valid === false) {
          validationIssues.push("Cart contains invalid items");
        }

        const outOfStockItems = items.filter(
          (item) => item?.availability?.out_of_stock === true
        );
        if (outOfStockItems.length > 0) {
          validationIssues.push(
            `${outOfStockItems.length} item(s) are out of stock`
          );
        }

        const nonServiceableItems = items.filter(
          (item) => item?.availability?.deliverable === false
        );
        if (nonServiceableItems.length > 0) {
          validationIssues.push(
            `${nonServiceableItems.length} item(s) are not deliverable to your location`
          );
        }

        if (validationIssues.length > 0) {
          console.log(
            "⚠️ [CHECKOUT ACTION] Validation issues found - redirecting to cart"
          );
          spaNavigate("/cart/bag");
          return {
            success: true,
            message: `Cart has issues that need to be resolved: ${validationIssues.join(", ")}. Redirected to cart page.`,
            action: "redirect_to_cart",
            url: "/cart/bag",
            validation_issues: validationIssues,
            reason: "validation_failed",
          };
        }

        // Step 8: Navigate to checkout
        console.log("🔍 [CHECKOUT ACTION] Step 8: Navigating to checkout");
        const checkoutUrl = `/cart/checkout?id=${finalCartId}`;
        spaNavigate(checkoutUrl);
        console.log("✅ [CHECKOUT ACTION] Successfully navigated to checkout");

        // Step 9: Prepare comprehensive response with all fetched data
        const successResponse = {
          success: true,
          message: "Successfully navigated to checkout page.",
          action: "navigate_to_checkout",
          url: checkoutUrl,
          cart_id: finalCartId,
          items_count: items.length,
          user_authenticated: userLoggedIn,

          // Cart details for reference
          cart_data: {
            id: cartData.id,
            uid: cartData.uid,
            is_valid: cartData.is_valid,
            items: cartData.items,
            breakup_values: cartData.breakup_values,
          },

          // Include addresses data if fetched (NO CACHING - direct transfer)
          ...(addressesData && {
            addresses_data: {
              addresses: addressesData.address || [],
              address_count: addressesData.address?.length || 0,
              default_address: addressesData.address?.find(
                (addr) => addr.is_default_address
              ),
            },
          }),

          // Include coupons data if fetched
          ...(couponsData && {
            coupons_data: {
              available_coupons: couponsData.available_coupon_list || [],
              coupon_count: couponsData.available_coupon_list?.length || 0,
            },
          }),

          // Optimization flags
          comprehensive_data_fetched: !!addressesData,
          api_optimization: fetch_addresses
            ? "single_comprehensive_call"
            : "cart_only_call",
        };

        console.log("🎉 [CHECKOUT ACTION] Success response prepared:", {
          cartId: successResponse.cart_id,
          itemsCount: successResponse.items_count,
          hasAddresses: !!successResponse.addresses_data,
          hasCoupons: !!successResponse.coupons_data,
          apiOptimization: successResponse.api_optimization,
        });

        return successResponse;
      } catch (error) {
        console.log("💥 [CHECKOUT ACTION] Unexpected error occurred:", error);
        return {
          success: false,
          message: "An unexpected error occurred. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "get_shipping_addresses",
    description:
      "Get shipping addresses, list my addresses, show delivery addresses, fetch saved addresses, display address list, what addresses do I have. Can use data from previous checkout navigation if available, otherwise fetches fresh data.",
    timeout: 15000,
    keywords: [
      "addresses",
      "shipping",
      "delivery",
      "address list",
      "saved addresses",
    ],
    examples: [
      "show me my addresses",
      "get shipping addresses",
      "list my delivery addresses",
      "what addresses do I have",
      "fetch saved addresses",
      "display address list",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart (optional - will auto-detect from current cart)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        // NEW: Accept pre-fetched data from previous action
        checkout_data: {
          type: "object",
          description:
            "Pre-fetched checkout data from navigate_to_checkout_page action (optional - if provided, skips API call)",
        },
      },
    },
    handler: async ({ cart_id, buy_now = false, checkout_data = null }) => {
      console.log("📍 [ADDRESSES ACTION] Starting get_shipping_addresses", {
        provided_cart_id: cart_id,
        buy_now: buy_now,
        has_checkout_data: !!checkout_data,
        timestamp: new Date().toISOString(),
      });

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
            message: "Please log in to view your saved addresses.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Use provided data OR fetch fresh data
        let addresses, cart, coupons;
        let dataSource = "fresh_api";

        if (checkout_data && checkout_data.addresses_data) {
          console.log(
            "✅ [ADDRESSES ACTION] Using provided checkout data - API call avoided!"
          );

          // Extract data from provided checkout_data
          addresses = { address: checkout_data.addresses_data.addresses };
          cart = checkout_data.cart_data;
          coupons = checkout_data.coupons_data
            ? {
                available_coupon_list:
                  checkout_data.coupons_data.available_coupons,
              }
            : null;
          dataSource = "provided_data";
        } else {
          console.log(
            "📡 [ADDRESSES ACTION] No provided data - calling CHECKOUT_LANDING API"
          );

          const apiPayload = {
            buyNow: buy_now,
            includeBreakup: true,
            includeAllItems: true,
            includeCodCharges: true,
            ...(cart_id && { id: cart_id }),
          };

          const checkoutResult = await window.fpi.executeGQL(
            CHECKOUT_LANDING,
            apiPayload
          );

          if (!checkoutResult?.data) {
            return {
              success: false,
              message: "Unable to fetch address data. Please refresh the page.",
              action_required: "api_error",
            };
          }

          ({ addresses, cart, coupons } = checkoutResult.data);
        }

        // Step 4: Process addresses data
        const addressList = addresses?.address || [];
        const defaultAddress = addressList.find(
          (addr) => addr?.is_default_address === true
        );
        const activeAddresses = addressList.filter(
          (addr) => addr?.is_active !== false
        );

        console.log("📊 [ADDRESSES ACTION] Processing complete:", {
          totalAddresses: addressList.length,
          activeAddresses: activeAddresses.length,
          hasDefault: !!defaultAddress,
          dataSource: dataSource,
        });

        if (addressList.length === 0) {
          return {
            success: true,
            message:
              "No saved addresses found. You can add a new address during checkout.",
            addresses: [],
            address_count: 0,
            has_default_address: false,
            cart_id: cart?.id,
            data_source: dataSource,
            action: "no_addresses_available",
          };
        }

        return {
          success: true,
          message: `Found ${addressList.length} saved address${addressList.length > 1 ? "es" : ""}.`,
          addresses: activeAddresses.map((addr) => ({
            id: addr.id,
            name: addr.name,
            address: addr.address,
            area: addr.area,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            area_code: addr.area_code,
            phone: addr.phone,
            email: addr.email,
            is_default_address: addr.is_default_address,
            landmark: addr.landmark,
            address_type: addr.address_type,
            geo_location: addr.geo_location,
            formatted_address: `${addr.address}, ${addr.area}, ${addr.city}, ${addr.state} ${addr.area_code}`,
          })),
          address_count: activeAddresses.length,
          default_address: defaultAddress
            ? {
                id: defaultAddress.id,
                name: defaultAddress.name,
                formatted_address: `${defaultAddress.address}, ${defaultAddress.area}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.area_code}`,
              }
            : null,
          has_default_address: !!defaultAddress,
          cart_context: {
            cart_id: cart?.id,
            cart_valid: cart?.is_valid,
            item_count: cart?.items?.length || 0,
          },
          coupon_context: {
            available_coupons: coupons?.available_coupon_list?.length || 0,
            applicable_coupons:
              coupons?.available_coupon_list?.filter(
                (coupon) => coupon?.is_applicable === true
              ).length || 0,
          },
          action: "addresses_fetched",
          data_source: dataSource,
          api_calls_saved: dataSource === "provided_data" ? 1 : 0,
        };
      } catch (error) {
        console.log("💥 [ADDRESSES ACTION] Unexpected error occurred:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while fetching addresses. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "select_delivery_address",
    description:
      "Select delivery address, choose shipping address, set delivery location, pick address for delivery, select address by position, use this address for delivery, add new address. Intelligently matches user's address selection by various criteria, handles ambiguous cases by asking for confirmation, and detects when user wants to add a new address instead of using existing ones.",
    timeout: 15000,
    keywords: [
      "select address",
      "choose address",
      "delivery address",
      "shipping address",
      "use address",
      "set address",
      "address selection",
      "add new address",
      "create address",
      "new address",
    ],
    examples: [
      "select my home address",
      "use the first address",
      "choose address number 2",
      "select the office address",
      "use my default address",
      "set delivery to Mumbai address",
      "pick the address with 400001 pincode",
      "I want to add a new address",
      "create new delivery address",
      "add different address",
      "use new address instead",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description:
            "The ID of the cart (optional - will auto-detect from current cart)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        selection_criteria: {
          type: "string",
          description:
            "How user wants to select address: by position (1st, 2nd, etc.), by location (city, area), by type (home, office), by name, by pincode, 'default', or 'new/add' for creating new address",
        },
        addresses_data: {
          type: "object",
          description:
            "Pre-fetched addresses data from previous action (optional - if provided, skips address fetch)",
        },
        force_confirm: {
          type: "boolean",
          description:
            "Force confirmation even for clear matches (optional, defaults to false)",
        },
      },
    },
    handler: async ({
      cart_id,
      buy_now = false,
      selection_criteria = "",
      addresses_data = null,
      force_confirm = false,
    }) => {
      console.log("🏠 [SELECT ADDRESS] Starting select_delivery_address", {
        provided_cart_id: cart_id,
        buy_now: buy_now,
        selection_criteria: selection_criteria,
        has_addresses_data: !!addresses_data,
        force_confirm: force_confirm,
        timestamp: new Date().toISOString(),
      });

      try {
        // Step 1: Check FPI system availability and authentication
        if (!window.fpi) {
          return {
            success: false,
            message:
              "System temporarily unavailable. Please refresh the page and try again.",
            action_required: "system_error",
          };
        }

        const userLoggedIn = isUserLoggedIn();
        if (!userLoggedIn) {
          return {
            success: false,
            message: "Please log in to select a delivery address.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        const criteria = selection_criteria.toLowerCase().trim();

        // Step 2: Check if user wants to add a new address
        const newAddressKeywords = [
          "new",
          "add",
          "create",
          "different",
          "another",
          "fresh",
          "not listed",
          "not here",
          "other",
          "custom",
        ];

        const wantsNewAddress =
          newAddressKeywords.some(
            (keyword) =>
              criteria.includes(keyword) &&
              (criteria.includes("address") ||
                criteria.includes("location") ||
                criteria.includes("delivery"))
          ) ||
          criteria.match(/^(new|add|create|different)\s*(address|location)?$/);

        console.log("🔍 [SELECT ADDRESS] Intent analysis:", {
          criteria: criteria,
          wantsNewAddress: wantsNewAddress,
          detectedKeywords: newAddressKeywords.filter((k) =>
            criteria.includes(k)
          ),
        });

        if (wantsNewAddress) {
          console.log("➕ [SELECT ADDRESS] User wants to add new address");

          // Get cart ID for navigation context
          let finalCartId = cart_id;

          if (!finalCartId && addresses_data?.cart_context) {
            finalCartId = addresses_data.cart_context.cart_id;
          }

          if (!finalCartId) {
            // Need to fetch cart ID
            const cartResult = await window.fpi.executeGQL(CHECKOUT_LANDING, {
              buyNow: buy_now,
              includeBreakup: false,
              includeAllItems: false,
            });
            finalCartId = cartResult?.data?.cart?.id;
          }

          if (!finalCartId) {
            return {
              success: false,
              message:
                "Unable to determine cart information. Please restart checkout process.",
              action_required: "cart_id_missing",
            };
          }

          // Navigate to add address flow
          const addAddressUrl = `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`;

          console.log(
            "🔗 [SELECT ADDRESS] Navigating to add address page:",
            addAddressUrl
          );
          spaNavigate(addAddressUrl);

          return {
            success: true,
            message:
              "Redirecting you to add a new delivery address. After adding the address, you'll be brought back to complete your checkout.",
            action: "redirect_to_add_address",
            url: addAddressUrl,
            cart_id: finalCartId,
            buy_now: buy_now,
            flow_type: "add_new_address",
            next_step:
              "After adding address, you'll return to checkout to continue with payment.",
            instructions: [
              "1. Fill in your new address details",
              "2. Save the address",
              "3. You'll be redirected back to checkout",
              "4. Your new address will be available for selection",
            ],
          };
        }

        // Step 3: Continue with existing address selection logic
        // Get addresses data
        let addressList = [];
        let cartData = null;
        let dataSource = "fresh_api";

        if (addresses_data && addresses_data.addresses) {
          console.log("✅ [SELECT ADDRESS] Using provided addresses data");
          addressList = addresses_data.addresses;
          cartData = addresses_data.cart_context;
          dataSource = "provided_data";
        } else {
          console.log("📡 [SELECT ADDRESS] Fetching addresses from API");
          const apiPayload = {
            buyNow: buy_now,
            includeBreakup: true,
            includeAllItems: true,
            includeCodCharges: true,
            ...(cart_id && { id: cart_id }),
          };

          const checkoutResult = await window.fpi.executeGQL(
            CHECKOUT_LANDING,
            apiPayload
          );

          if (!checkoutResult?.data?.addresses) {
            return {
              success: false,
              message: "Unable to fetch addresses. Please try again.",
              action_required: "api_error",
            };
          }

          addressList = checkoutResult.data.addresses.address || [];
          cartData = checkoutResult.data.cart;
        }

        const finalCartId = cart_id || cartData?.id;

        if (!finalCartId) {
          return {
            success: false,
            message: "Cart ID not found. Please restart checkout process.",
            action_required: "cart_id_missing",
          };
        }

        console.log("📊 [SELECT ADDRESS] Address data processed:", {
          totalAddresses: addressList.length,
          selectionCriteria: selection_criteria,
          dataSource: dataSource,
        });

        if (addressList.length === 0) {
          return {
            success: false,
            message:
              "No saved addresses found. You can add a new address to proceed with checkout.",
            action_required: "no_addresses",
            suggested_action: "add_new_address",
            add_address_url: `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`,
            instructions:
              "Click 'Add New Address' to create your first delivery address.",
          };
        }

        // Step 4: Smart address matching based on selection criteria
        let matchedAddresses = [];
        let selectionMethod = "unknown";

        // Default address selection
        if (criteria.includes("default") || criteria === "") {
          const defaultAddr = addressList.find(
            (addr) => addr.is_default_address === true
          );
          if (defaultAddr) {
            matchedAddresses = [defaultAddr];
            selectionMethod = "default_address";
          }
        }

        // Position-based selection (1st, 2nd, first, second, etc.)
        else if (
          criteria.match(/(\d+)(st|nd|rd|th)|first|second|third|fourth|fifth/)
        ) {
          let position = 0;
          if (criteria.includes("first") || criteria.includes("1st"))
            position = 1;
          else if (criteria.includes("second") || criteria.includes("2nd"))
            position = 2;
          else if (criteria.includes("third") || criteria.includes("3rd"))
            position = 3;
          else if (criteria.includes("fourth") || criteria.includes("4th"))
            position = 4;
          else if (criteria.includes("fifth") || criteria.includes("5th"))
            position = 5;
          else {
            const match = criteria.match(/(\d+)/);
            if (match) position = parseInt(match[1]);
          }

          if (position > 0 && position <= addressList.length) {
            matchedAddresses = [addressList[position - 1]];
            selectionMethod = `position_${position}`;
          }
        }

        // City-based selection
        else if (
          addressList.some((addr) =>
            addr.city?.toLowerCase().includes(criteria)
          )
        ) {
          matchedAddresses = addressList.filter((addr) =>
            addr.city?.toLowerCase().includes(criteria)
          );
          selectionMethod = "city_match";
        }

        // Area/locality-based selection
        else if (
          addressList.some((addr) =>
            addr.area?.toLowerCase().includes(criteria)
          )
        ) {
          matchedAddresses = addressList.filter((addr) =>
            addr.area?.toLowerCase().includes(criteria)
          );
          selectionMethod = "area_match";
        }

        // Pincode-based selection
        else if (criteria.match(/\d{6}/)) {
          const pincode = criteria.match(/(\d{6})/)[1];
          matchedAddresses = addressList.filter(
            (addr) => addr.area_code === pincode
          );
          selectionMethod = "pincode_match";
        }

        // Address type selection (home, office, work, etc.)
        else if (
          addressList.some(
            (addr) =>
              addr.address_type?.toLowerCase().includes(criteria) ||
              addr.name?.toLowerCase().includes(criteria)
          )
        ) {
          matchedAddresses = addressList.filter(
            (addr) =>
              addr.address_type?.toLowerCase().includes(criteria) ||
              addr.name?.toLowerCase().includes(criteria)
          );
          selectionMethod = "type_or_name_match";
        }

        // Fallback: partial text matching in full address
        else {
          matchedAddresses = addressList.filter(
            (addr) =>
              addr.address?.toLowerCase().includes(criteria) ||
              addr.landmark?.toLowerCase().includes(criteria) ||
              addr.state?.toLowerCase().includes(criteria)
          );
          selectionMethod = "text_match";
        }

        console.log("🔍 [SELECT ADDRESS] Address matching results:", {
          selectionMethod: selectionMethod,
          matchedCount: matchedAddresses.length,
          criteriaUsed: criteria,
        });

        // Step 5: Handle matching results

        // No matches found
        if (matchedAddresses.length === 0) {
          return {
            success: false,
            message: `No address found matching "${selection_criteria}". Please try with a different criteria or add a new address.`,
            action_required: "address_not_found",
            available_addresses: addressList.map((addr, index) => ({
              position: index + 1,
              name: addr.name,
              city: addr.city,
              area: addr.area,
              pincode: addr.area_code,
              type: addr.address_type,
              is_default: addr.is_default_address,
              formatted_address: `${addr.address}, ${addr.area}, ${addr.city}, ${addr.state} ${addr.area_code}`,
            })),
            suggestions: [
              "Try: 'select first address', 'use home address', 'choose Mumbai address', or 'select default address'",
              "Or say: 'add new address' to create a new delivery location",
            ],
            add_new_option: {
              message: "Don't see the address you want?",
              action_text: "Add New Address",
              url: `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`,
            },
          };
        }

        // Single match - proceed directly (unless force_confirm is true)
        else if (matchedAddresses.length === 1 && !force_confirm) {
          const selectedAddress = matchedAddresses[0];

          console.log(
            "✅ [SELECT ADDRESS] Single match found - proceeding with selection"
          );

          // Make API call to select the address
          try {
            const selectPayload = {
              cartId: finalCartId,
              buyNow: buy_now,
              selectCartAddressRequestInput: {
                cart_id: finalCartId,
                id: selectedAddress.id,
                billing_address_id: selectedAddress.id,
              },
            };

            const selectResult = await window.fpi.executeGQL(
              SELECT_ADDRESS,
              selectPayload
            );

            if (selectResult?.data?.selectAddress?.is_valid) {
              // Update URL with address_id and trigger shipment fetch
              const currentUrl = new URL(window.location.href);
              currentUrl.searchParams.set("address_id", selectedAddress.id);
              window.history.pushState({}, "", currentUrl.toString());

              // Fetch shipments for the selected address
              const shipmentPayload = {
                addressId: selectedAddress.id.toString(),
                id: finalCartId.toString(),
                buyNow: buy_now,
              };

              await window.fpi.executeGQL(FETCH_SHIPMENTS, shipmentPayload);

              return {
                success: true,
                message: `Successfully selected delivery address: ${selectedAddress.name}, ${selectedAddress.city}`,
                action: "address_selected",
                selected_address: {
                  id: selectedAddress.id,
                  name: selectedAddress.name,
                  formatted_address: `${selectedAddress.address}, ${selectedAddress.area}, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.area_code}`,
                  city: selectedAddress.city,
                  area_code: selectedAddress.area_code,
                  is_default: selectedAddress.is_default_address,
                },
                selection_method: selectionMethod,
                cart_id: finalCartId,
                data_source: dataSource,
                next_step: "proceed_to_payment",
                alternative_option: {
                  message: "Want to use a different address?",
                  action_text: "Add New Address",
                  url: `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`,
                },
              };
            } else {
              return {
                success: false,
                message:
                  selectResult?.data?.selectAddress?.message ||
                  "Failed to select address. Address may not be serviceable.",
                action_required: "address_selection_failed",
                error_details: selectResult?.data?.selectAddress?.message,
                alternative_option: {
                  message: "Try a different address or add a new one",
                  action_text: "Add New Address",
                  url: `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`,
                },
              };
            }
          } catch (error) {
            console.log("💥 [SELECT ADDRESS] Error selecting address:", error);
            return {
              success: false,
              message:
                "Failed to select address due to technical error. Please try again.",
              action_required: "api_error",
              error_details: error?.message,
            };
          }
        }

        // Multiple matches - ask for user confirmation
        else {
          return {
            success: false,
            message: `Found ${matchedAddresses.length} addresses matching "${selection_criteria}". Please specify which one to use:`,
            action_required: "address_disambiguation",
            matched_addresses: matchedAddresses.map((addr, index) => ({
              position: index + 1,
              id: addr.id,
              name: addr.name,
              formatted_address: `${addr.address}, ${addr.area}, ${addr.city}, ${addr.state} ${addr.area_code}`,
              city: addr.city,
              area: addr.area,
              pincode: addr.area_code,
              type: addr.address_type,
              is_default: addr.is_default_address,
              landmark: addr.landmark,
            })),
            selection_method: selectionMethod,
            suggestions: [
              `Say something like "select the first one" or "use the ${matchedAddresses[0].city} address"`,
              "Or say 'add new address' to create a different delivery location",
            ],
            total_matches: matchedAddresses.length,
            add_new_option: {
              message: "None of these? Add a new address instead",
              action_text: "Add New Address",
              url: `/profile/address?redirectUrl=${encodeURIComponent(`/cart/checkout?id=${finalCartId}${buy_now ? "&buy_now=true" : ""}`)}`,
            },
          };
        }
      } catch (error) {
        console.log("💥 [SELECT ADDRESS] Unexpected error occurred:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while selecting address. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "get_available_coupons",
    description:
      "Get available coupons, show coupons, list offers, display available discount codes, what coupons can I use, check available coupons. Fetches all available coupons for the current cart and analyzes them for the best offers.",
    timeout: 15000,
    keywords: [
      "coupons",
      "offers",
      "discounts",
      "promo codes",
      "deals",
      "savings",
      "vouchers",
    ],
    examples: [
      "show me available coupons",
      "what offers do I have",
      "list all coupons",
      "get discount codes",
      "show available offers",
      "what deals are available",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description: "The ID of the cart (optional - will auto-detect)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        checkout_data: {
          type: "object",
          description:
            "Pre-fetched checkout data from navigate_to_checkout_page (optional - for optimization)",
        },
      },
    },
    handler: async ({ cart_id, buy_now = false, checkout_data = null }) => {
      console.log("🎟️ [COUPONS] Starting get_available_coupons", {
        provided_cart_id: cart_id,
        buy_now: buy_now,
        has_checkout_data: !!checkout_data,
        timestamp: new Date().toISOString(),
      });

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
            message: "Please log in to view available coupons.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Get cart data and coupons (use provided data OR fetch fresh)
        let cartData, couponsData;
        let dataSource = "fresh_api";

        if (checkout_data && checkout_data.coupons_data) {
          console.log(
            "✅ [COUPONS] Using provided checkout data - API call avoided!"
          );
          couponsData = checkout_data.coupons_data;
          cartData = checkout_data.cart_data;
          dataSource = "provided_data";
        } else {
          console.log("📡 [COUPONS] Fetching cart and coupons from API");

          const urlParams = new URLSearchParams(window.location.search);
          const finalBuyNow =
            buy_now || JSON.parse(urlParams.get("buy_now") || "false");

          const cartResult = await window.fpi.executeGQL(CART_DETAILS, {
            buyNow: finalBuyNow,
            includeBreakup: true,
            includeAllItems: true,
            includeCodCharges: true,
            ...(cart_id && { cartId: cart_id }),
          });

          if (!cartResult?.data?.cart) {
            return {
              success: false,
              message: "Unable to fetch cart data. Please try again.",
              action_required: "api_error",
            };
          }

          cartData = cartResult.data.cart;
          couponsData = cartResult.data.coupons;
        }

        console.log("📊 [COUPONS] Processing coupon data:", {
          cartId: cartData?.id,
          availableCoupons: couponsData?.available_coupon_list?.length || 0,
          dataSource: dataSource,
        });

        const availableCoupons = couponsData?.available_coupon_list || [];
        const currentCoupon = cartData?.breakup_values?.coupon;

        // Step 4: Analyze and categorize coupons
        const applicableCoupons = availableCoupons.filter(
          (coupon) => coupon.is_applicable
        );
        const bankOffers = availableCoupons.filter(
          (coupon) => coupon.is_bank_offer
        );
        const regularOffers = availableCoupons.filter(
          (coupon) => !coupon.is_bank_offer
        );

        // Find best coupon (highest discount value)
        const bestCoupon = applicableCoupons.reduce((best, current) => {
          const currentValue =
            current.coupon_value || current.max_discount_value || 0;
          const bestValue = best?.coupon_value || best?.max_discount_value || 0;
          return currentValue > bestValue ? current : best;
        }, null);

        // Find urgent coupons (expiring soon)
        const urgentCoupons = applicableCoupons.filter((coupon) => {
          if (!coupon.end_date) return false;
          const endDate = new Date(coupon.end_date);
          const now = new Date();
          const daysUntilExpiry = Math.ceil(
            (endDate - now) / (1000 * 60 * 60 * 24)
          );
          return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
        });

        // Step 5: Prepare categorized response
        const couponData = {
          available_coupons: availableCoupons,
          applicable_coupons: applicableCoupons,
          bank_offers: bankOffers,
          regular_offers: regularOffers,
          best_coupon: bestCoupon,
          urgent_coupons: urgentCoupons,
          current_applied_coupon: currentCoupon?.is_applied
            ? currentCoupon
            : null,
          cart_context: {
            cart_id: cartData?.id,
            cart_total: cartData?.breakup_values?.raw?.total || 0,
            currency: cartData?.currency?.symbol || "₹",
            items_count: cartData?.items?.length || 0,
          },
          api_calls_saved: dataSource === "provided_data" ? 1 : 0,
          data_source: dataSource,
        };

        console.log("💰 [COUPONS] Best coupon analysis:", {
          bestCouponCode: bestCoupon?.coupon_code,
          bestCouponValue:
            bestCoupon?.coupon_value || bestCoupon?.max_discount_value,
          urgentCouponsCount: urgentCoupons.length,
          applicableCouponsCount: applicableCoupons.length,
        });

        return {
          success: true,
          message: `Found ${applicableCoupons.length} applicable coupons for your cart. Apply a coupon to save money, then proceed to payment.`,
          coupons_data: couponData,
          summary: {
            total_coupons: availableCoupons.length,
            applicable_coupons: applicableCoupons.length,
            bank_offers: bankOffers.length,
            best_savings: bestCoupon
              ? `${cartData?.currency?.symbol || "₹"}${bestCoupon.coupon_value || bestCoupon.max_discount_value}`
              : "No savings",
            urgent_offers: urgentCoupons.length,
            current_applied: currentCoupon?.is_applied
              ? currentCoupon.code
              : "None",
          },
          recommendations: {
            best_coupon: bestCoupon
              ? {
                  code: bestCoupon.coupon_code,
                  title: bestCoupon.title,
                  description: bestCoupon.description,
                  value:
                    bestCoupon.coupon_value || bestCoupon.max_discount_value,
                  minimum_order: bestCoupon.minimum_cart_value,
                }
              : null,
            urgent_offers: urgentCoupons.slice(0, 3),
          },
          next_actions: [
            bestCoupon
              ? `Apply best coupon: "apply coupon ${bestCoupon.coupon_code}"`
              : null,
            urgentCoupons.length > 0
              ? "Apply urgent offers before they expire"
              : null,
            currentCoupon?.is_applied
              ? `Remove current coupon: "remove coupon"`
              : null,
            'Apply specific coupon: "apply coupon [CODE]"',
            'Skip coupons and proceed: "show payment options"',
          ].filter(Boolean),
        };
      } catch (error) {
        console.error("❌ [COUPONS] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while fetching coupons. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
  {
    name: "apply_coupon",
    description:
      "Apply a coupon code to the cart, use discount code, redeem coupon, apply promo code, use offer code. Applies the specified coupon to the current cart and shows the discount details.",
    timeout: 15000,
    keywords: [
      "apply coupon",
      "use coupon",
      "redeem",
      "discount",
      "promo code",
      "offer code",
    ],
    examples: [
      "apply coupon SAVE20",
      "use discount code WELCOME",
      "redeem coupon NEWUSER",
      "apply offer FIRSTORDER",
      "use promo code FREESHIP",
    ],
    parameters: {
      type: "object",
      properties: {
        coupon_code: {
          type: "string",
          description: "The coupon code to apply",
        },
        cart_id: {
          type: "string",
          description: "The ID of the cart (optional - will auto-detect)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        coupons_data: {
          type: "object",
          description:
            "Coupons data from get_available_coupons (optional - for validation)",
        },
      },
      required: ["coupon_code"],
    },
    handler: async ({
      coupon_code,
      cart_id,
      buy_now = false,
      coupons_data = null,
    }) => {
      console.log("🎟️ [APPLY COUPON] Starting apply_coupon", {
        coupon_code: coupon_code,
        cart_id: cart_id,
        buy_now: buy_now,
        has_coupons_data: !!coupons_data,
        timestamp: new Date().toISOString(),
      });

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
            message: "Please log in to apply coupons.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Validate coupon code
        if (
          !coupon_code ||
          typeof coupon_code !== "string" ||
          coupon_code.trim().length === 0
        ) {
          return {
            success: false,
            message: "Please provide a valid coupon code.",
            action_required: "invalid_coupon_code",
            suggested_action:
              'Try: "apply coupon [CODE]" with a valid coupon code',
          };
        }

        const cleanCouponCode = coupon_code.trim().toUpperCase();

        // Step 4: Get cart context
        const urlParams = new URLSearchParams(window.location.search);
        const finalBuyNow =
          buy_now || JSON.parse(urlParams.get("buy_now") || "false");
        let finalCartId = cart_id || urlParams.get("id");

        // If no cart ID, try to get it from current cart
        if (!finalCartId) {
          const cartResult = await window.fpi.executeGQL(CART_DETAILS, {
            buyNow: finalBuyNow,
            includeBreakup: false,
            includeAllItems: false,
          });
          finalCartId = cartResult?.data?.cart?.id;
        }

        if (!finalCartId) {
          return {
            success: false,
            message: "Cart not found. Please add items to cart first.",
            action_required: "cart_not_found",
            suggested_action: "Add items to cart and try again",
          };
        }

        // Step 5: Validate coupon if coupons data is provided
        if (coupons_data && coupons_data.available_coupons) {
          const couponExists = coupons_data.available_coupons.find(
            (coupon) => coupon.coupon_code?.toUpperCase() === cleanCouponCode
          );

          if (!couponExists) {
            return {
              success: false,
              message: `Coupon "${cleanCouponCode}" is not available for this cart.`,
              action_required: "coupon_not_found",
              available_coupons: coupons_data.available_coupons
                .slice(0, 5)
                .map((c) => ({
                  code: c.coupon_code,
                  title: c.title,
                  value: c.coupon_value || c.max_discount_value,
                })),
              suggested_action: "Try one of the available coupons above",
            };
          }

          if (!couponExists.is_applicable) {
            return {
              success: false,
              message: `Coupon "${cleanCouponCode}" is not applicable to your current cart.`,
              action_required: "coupon_not_applicable",
              coupon_details: {
                code: couponExists.coupon_code,
                minimum_cart_value: couponExists.minimum_cart_value,
                message: couponExists.message,
              },
              suggested_action: couponExists.minimum_cart_value
                ? `Add more items to reach minimum cart value of ₹${couponExists.minimum_cart_value}`
                : "Check coupon terms and conditions",
            };
          }
        }

        console.log("📡 [APPLY COUPON] Applying coupon to cart", {
          couponCode: cleanCouponCode,
          cartId: finalCartId,
        });

        // Step 6: Apply coupon using the same payload structure as useCartCoupon.jsx
        const payload = {
          applyCouponRequestInput: {
            coupon_code: cleanCouponCode,
          },
          applyCouponId: finalCartId,
          buyNow: finalBuyNow,
        };

        const couponResult = await window.fpi.executeGQL(APPLY_COUPON, payload);

        if (!couponResult?.data?.applyCoupon) {
          return {
            success: false,
            message: "Failed to apply coupon. Please try again.",
            action_required: "api_error",
            error_details: "No response from coupon service",
          };
        }

        const appliedCart = couponResult.data.applyCoupon;
        const couponBreakup = appliedCart.breakup_values?.coupon || {};

        // Step 7: Check if coupon was successfully applied
        if (couponBreakup.code && couponBreakup.is_applied) {
          console.log("✅ [APPLY COUPON] Coupon applied successfully", {
            appliedCode: couponBreakup.code,
            discount: couponBreakup.value,
          });

          // Trigger soft page refresh after successful coupon application
          softRefreshPage();

          return {
            success: true,
            message: `🎉 Coupon "${couponBreakup.code}" applied successfully! You saved ${appliedCart.currency?.symbol || "₹"}${couponBreakup.value}. Ready to proceed with payment?`,
            applied_coupon: {
              code: couponBreakup.code,
              title: couponBreakup.title,
              description: couponBreakup.description,
              discount_amount: couponBreakup.value,
              coupon_type: couponBreakup.coupon_type,
              minimum_cart_value: couponBreakup.minimum_cart_value,
            },
            cart_summary: {
              cart_id: appliedCart.id,
              subtotal: appliedCart.breakup_values?.raw?.subtotal || 0,
              discount: appliedCart.breakup_values?.raw?.discount || 0,
              total: appliedCart.breakup_values?.raw?.total || 0,
              currency: appliedCart.currency?.symbol || "₹",
              items_count: appliedCart.items?.length || 0,
            },
            savings: {
              amount: couponBreakup.value,
              percentage: appliedCart.breakup_values?.raw?.subtotal
                ? Math.round(
                    (couponBreakup.value /
                      appliedCart.breakup_values.raw.subtotal) *
                      100
                  )
                : 0,
            },
            checkout_status: {
              cart_ready: true,
              coupon_applied: true,
              payment_ready: true,
              address_required: true, // User will need to select address before payment
              total_with_discount: appliedCart.breakup_values?.raw?.total || 0,
            },
            next_actions: [
              'Get payment options: "show payment options" or "get payment methods"',
              'Select payment: "use UPI payment" or "pay with card"',
              'Complete checkout: "checkout and pay" or "pay now"',
              'Remove coupon: "remove coupon" if you want to try a different one',
            ],
          };
        } else {
          // Coupon application failed
          const errorMessage =
            couponBreakup.message ||
            appliedCart.message ||
            "Coupon could not be applied to your cart.";

          return {
            success: false,
            message: errorMessage,
            action_required: "coupon_application_failed",
            coupon_code: cleanCouponCode,
            error_details: {
              coupon_message: couponBreakup.message,
              cart_message: appliedCart.message,
            },
            suggested_action:
              "Try a different coupon code or check if your cart meets the coupon requirements",
          };
        }
      } catch (error) {
        console.error("❌ [APPLY COUPON] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while applying the coupon. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
          coupon_code: coupon_code,
        };
      }
    },
  },
  {
    name: "remove_coupon",
    description:
      "Remove applied coupon from cart, delete coupon, cancel discount, remove promo code. Removes the currently applied coupon from the cart.",
    timeout: 10000,
    keywords: [
      "remove coupon",
      "delete coupon",
      "cancel discount",
      "remove promo",
      "unapply coupon",
    ],
    examples: [
      "remove coupon",
      "delete applied coupon",
      "cancel discount",
      "remove promo code",
      "unapply coupon",
    ],
    parameters: {
      type: "object",
      properties: {
        cart_id: {
          type: "string",
          description: "The ID of the cart (optional - will auto-detect)",
        },
        buy_now: {
          type: "boolean",
          description:
            "Whether this is a buy-now flow (optional, defaults to false)",
        },
        coupon_id: {
          type: "string",
          description:
            "The ID of the coupon to remove (optional - will auto-detect from current cart)",
        },
      },
    },
    handler: async ({ cart_id, buy_now = false, coupon_id = null }) => {
      console.log("🗑️ [REMOVE COUPON] Starting remove_coupon", {
        cart_id: cart_id,
        buy_now: buy_now,
        coupon_id: coupon_id,
        timestamp: new Date().toISOString(),
      });

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
            message: "Please log in to remove coupons.",
            action_required: "login_required",
            redirect_to: "/auth/login",
          };
        }

        // Step 3: Get cart context and current coupon
        const urlParams = new URLSearchParams(window.location.search);
        const finalBuyNow =
          buy_now || JSON.parse(urlParams.get("buy_now") || "false");
        let finalCartId = cart_id || urlParams.get("id");
        let finalCouponId = coupon_id;

        // Get current cart to find applied coupon
        const cartResult = await window.fpi.executeGQL(CART_DETAILS, {
          buyNow: finalBuyNow,
          includeBreakup: true,
          includeAllItems: false,
          ...(finalCartId && { cartId: finalCartId }),
        });

        if (!cartResult?.data?.cart) {
          return {
            success: false,
            message: "Cart not found. Please refresh the page and try again.",
            action_required: "cart_not_found",
          };
        }

        const cartData = cartResult.data.cart;
        finalCartId = cartData.id;
        const currentCoupon = cartData.breakup_values?.coupon;

        // Step 4: Check if there's a coupon to remove
        if (!currentCoupon?.is_applied) {
          return {
            success: false,
            message: "No coupon is currently applied to your cart.",
            action_required: "no_coupon_applied",
            cart_summary: {
              cart_id: cartData.id,
              total: cartData.breakup_values?.raw?.total || 0,
              currency: cartData.currency?.symbol || "₹",
              items_count: cartData.items?.length || 0,
            },
            suggested_action:
              'Apply a coupon first using "apply coupon [CODE]" or "show available coupons"',
          };
        }

        // Use the coupon ID from current cart if not provided
        finalCouponId = finalCouponId || currentCoupon.uid || finalCartId;

        console.log("📡 [REMOVE COUPON] Removing coupon from cart", {
          couponCode: currentCoupon.code,
          couponId: finalCouponId,
          cartId: finalCartId,
        });

        // Step 5: Remove coupon using the same payload structure as useCartCoupon.jsx
        const payload = {
          removeCouponId: finalCouponId,
          buyNow: finalBuyNow,
        };

        const removeResult = await window.fpi.executeGQL(
          REMOVE_COUPON,
          payload
        );

        if (!removeResult?.data?.removeCoupon) {
          return {
            success: false,
            message: "Failed to remove coupon. Please try again.",
            action_required: "api_error",
            error_details: "No response from coupon service",
          };
        }

        const updatedCart = removeResult.data.removeCoupon;
        const removedCouponStillApplied = updatedCart.coupon?.is_applied;

        // Step 6: Check if coupon was successfully removed
        if (!removedCouponStillApplied) {
          console.log("✅ [REMOVE COUPON] Coupon removed successfully");

          const savedAmount = currentCoupon.value || 0;

          return {
            success: true,
            message: `✅ Coupon "${currentCoupon.code}" has been removed from your cart.`,
            removed_coupon: {
              code: currentCoupon.code,
              title: currentCoupon.title,
              discount_amount: savedAmount,
            },
            cart_summary: {
              cart_id: updatedCart.cart_id,
              total: updatedCart.breakup_values?.raw?.total || 0,
              currency: updatedCart.currency?.symbol || "₹",
              items_count: updatedCart.items?.length || 0,
            },
            price_change: {
              previous_total:
                (updatedCart.breakup_values?.raw?.total || 0) - savedAmount,
              new_total: updatedCart.breakup_values?.raw?.total || 0,
              difference: savedAmount,
              message:
                savedAmount > 0
                  ? `Your cart total increased by ${updatedCart.currency?.symbol || "₹"}${savedAmount}`
                  : "Cart total updated",
            },
            next_actions: [
              'Apply different coupon: "show available coupons" then "apply coupon [CODE]"',
              'Get payment options: "show payment options" to proceed with payment',
              'Select payment: "use UPI payment" or "pay with card"',
              'Complete checkout: "checkout and pay" with current prices',
            ],
          };
        } else {
          return {
            success: false,
            message: "Coupon could not be removed. Please try again.",
            action_required: "coupon_removal_failed",
            current_coupon: {
              code: currentCoupon.code,
              is_still_applied: true,
            },
            suggested_action:
              "Try again or contact support if the issue persists",
          };
        }
      } catch (error) {
        console.error("❌ [REMOVE COUPON] Error:", error);
        return {
          success: false,
          message:
            "An unexpected error occurred while removing the coupon. Please try again.",
          action_required: "system_error",
          error_details: error?.message || "Unknown error",
        };
      }
    },
  },
];
