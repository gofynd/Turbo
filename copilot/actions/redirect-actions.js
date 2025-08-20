import {
  buildProductUrl,
  generateSuccessMessage,
  buildAddressUrl,
  generateAddressMessage,
} from "../utils/redirect-utils.js";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/common-utils.js";
import { spaNavigate } from "../../theme/helper/utils";

export const redirectActions = [
  {
    name: "redirect_to_products",
    description:
      "Redirect user to the products listing page, optionally filtered by search query, department, category, size, color, and/or price range (in INR)",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        search: {
          type: "string",
          description:
            "Search query for product names (e.g., 'bomber jackets', 'nike shoes', 'winter coats')",
        },
        department: {
          type: "string",
          description: "Department slug or name (e.g., 'electronics')",
        },
        category: {
          type: "string",
          description: "Category slug or name (e.g., 'jumpsuits')",
        },
        min_price: {
          type: "number",
          description: "Minimum price in INR (inclusive)",
        },
        max_price: {
          type: "number",
          description: "Maximum price in INR (inclusive)",
        },
        sizes: {
          type: "string",
          description:
            "Size filter (e.g., '38', 'M', or comma-separated for multiple sizes)",
        },
        color: {
          type: "string",
          description: "Product color filter (e.g., 'blue', 'red', 'black')",
        },
        brand: {
          type: "string",
          description: "Brand filter (e.g., 'nike', 'adidas')",
        },
      },
      required: [],
    },
    handler: ({
      search,
      department,
      category,
      min_price,
      max_price,
      sizes,
      color,
      brand,
    } = {}) => {
      try {
        const url = buildProductUrl({
          search,
          department,
          category,
          min_price,
          max_price,
          sizes,
          color,
          brand,
        });
        const message = generateSuccessMessage({
          search,
          department,
          category,
          min_price,
          max_price,
          color,
        });

        spaNavigate(url);

        return {
          success: true,
          message,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to products listing page: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_product",
    description: "Redirect to a particular product page",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        product_id: {
          type: "string",
          description: "Product ID or slug",
        },
        product_slug: {
          type: "string",
          description: "Product URL slug",
        },
      },
      required: ["product_id"],
    },
    handler: ({ product_id, product_slug }) => {
      try {
        const productUrl = product_slug
          ? `/product/${product_slug}`
          : `/product/${product_id}`;
        spaNavigate(productUrl);

        return {
          success: true,
          message: "Redirecting to product page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to product: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_home",
    description: "Redirect user to the home page",
    timeout: 5000,
    handler: () => {
      try {
        spaNavigate("/");
        return {
          success: true,
          message: "Redirecting to home page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to home: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_contact_support",
    description:
      "Redirect user to the contact us or support page, optionally pre-filling name, email, phone, and message fields",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "User's name (optional)",
        },
        email: {
          type: "string",
          description: "User's email address (optional)",
        },
        phone: {
          type: "string",
          description: "User's phone number (optional)",
        },
        message: {
          type: "string",
          description: "Message to pre-fill in the contact form (optional)",
        },
      },
    },
    handler: ({ name, email, phone, message } = {}) => {
      try {
        const params = new URLSearchParams();
        if (phone) params.append("phone", phone);
        if (message) params.append("message", message);
        if (email) params.append("email", email);
        if (name) params.append("name", name);

        const url =
          params.toString().length > 0
            ? `/contact-us/?${params.toString()}`
            : "/contact-us";

        spaNavigate(url);

        return {
          success: true,
          message: "Redirecting to contact us page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to contact page: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_policies",
    description:
      "Redirect to terms and conditions, privacy policy, shipping policy, or returns and exchange policy",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        policy_type: {
          type: "string",
          description: "Type of policy page to redirect to",
          enum: ["terms", "privacy", "shipping", "returns"],
          default: "terms",
        },
      },
    },
    handler: ({ policy_type = "terms" }) => {
      try {
        const policyUrls = {
          terms: "/terms-and-conditions",
          privacy: "/privacy-policy",
          shipping: "/shipping-policy",
          returns: "/returns-and-exchange",
        };

        const url = policyUrls[policy_type] || policyUrls.terms;
        spaNavigate(url);

        return {
          success: true,
          message: `Redirecting to ${policy_type} policy page...`,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to policy page: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_checkout",
    description: "Redirect user to the checkout page",
    timeout: 5000,
    handler: () => {
      try {
        spaNavigate("/checkout");
        return {
          success: true,
          message: "Redirecting to checkout...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to checkout: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_collections",
    description:
      "Redirect user to the collections page, a specific collection, or a collection with a price range filter (supports 'within' and 'min_price_effective')",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        collection_slug: {
          type: "string",
          description: "Specific collection slug/ID to redirect to",
        },
        min_price_effective: {
          type: "string",
          description:
            "Price range filter in the format '[min,INR TO max,INR]' (URL encoded)",
        },
        within: {
          type: "string",
          description:
            "Alternative price range filter, e.g. '[min,INR TO max,INR]' (URL encoded)",
        },
      },
    },
    handler: ({ collection_slug, min_price_effective, within }) => {
      try {
        let url = collection_slug
          ? `/collection/${collection_slug}`
          : "/collections";

        const params = new URLSearchParams();

        if (
          min_price_effective &&
          typeof min_price_effective === "string" &&
          min_price_effective.trim() !== ""
        ) {
          params.set("min_price_effective", min_price_effective);
        }

        if (within && typeof within === "string" && within.trim() !== "") {
          params.set("within", within);
        }

        if ([...params].length > 0) {
          url += `?${params.toString()}`;
        }

        spaNavigate(url);

        let message = "Redirecting to collections page...";
        if (collection_slug && (min_price_effective || within)) {
          message = `Redirecting to ${collection_slug} collection with price filter...`;
        } else if (collection_slug) {
          message = `Redirecting to ${collection_slug} collection...`;
        } else if (min_price_effective || within) {
          message = "Redirecting to collections page with price filter...";
        }

        return {
          success: true,
          message,
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to collections: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_categories",
    description: "Redirect user to the categories page or a specific category",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        category_slug: {
          type: "string",
          description: "Specific category slug/ID to redirect to",
        },
      },
    },
    handler: ({ category_slug }) => {
      try {
        const url = category_slug
          ? `/categories/${category_slug}`
          : "/categories";
        spaNavigate(url);

        return {
          success: true,
          message: category_slug
            ? `Redirecting to ${category_slug} category...`
            : "Redirecting to categories page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to categories: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_blogs",
    description: "Redirect user to the blogs page or a specific blog post",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        blog_slug: {
          type: "string",
          description: "Specific blog post slug/ID to redirect to",
        },
      },
    },
    handler: ({ blog_slug }) => {
      try {
        const url = blog_slug ? `/blog/${blog_slug}` : "/blog";
        spaNavigate(url);

        return {
          success: true,
          message: blog_slug
            ? `Redirecting to blog post: ${blog_slug}...`
            : "Redirecting to blogs page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to blogs: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_faq",
    description:
      "Redirect user to the FAQ (Frequently Asked Questions) page, optionally filtered by category",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "FAQ category to filter by (optional)",
        },
      },
    },
    handler: ({ category } = {}) => {
      try {
        let url = "/faq";
        if (category) {
          url += `?category=${encodeURIComponent(category)}`;
        }
        spaNavigate(url);
        return {
          success: true,
          message: category
            ? `Redirecting to FAQ page for category: ${category}...`
            : "Redirecting to FAQ page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to FAQ: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_brands",
    description:
      "Redirect user to the brands page, a specific brand, or a filtered products listing for a brand",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        brand_slug: {
          type: "string",
          description:
            "Specific brand slug/ID to redirect to (e.g., 'kaarah-by-kaavya')",
        },
        as_products: {
          type: "boolean",
          description:
            "If true, redirect to products listing filtered by brand (e.g., /products/?brand=kaarah-by-kaavya)",
        },
      },
    },
    handler: ({ brand_slug, as_products }) => {
      try {
        let url;
        if (brand_slug && as_products) {
          url = `/products?brand=${encodeURIComponent(brand_slug)}`;
        } else if (brand_slug) {
          url = `/brands/${brand_slug}`;
        } else {
          url = "/brands";
        }
        spaNavigate(url);

        return {
          success: true,
          message: brand_slug
            ? as_products
              ? `Redirecting to products for brand: ${brand_slug}...`
              : `Redirecting to ${brand_slug} brand...`
            : "Redirecting to brands page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to brands: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_orders",
    description:
      "Redirect user to the orders page to view their order history, or to a specific shipment",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        shipment_id: {
          type: "string",
          description:
            "Specific shipment ID to redirect to (e.g., '17530198571021572381')",
        },
      },
    },
    handler: ({ shipment_id } = {}) => {
      try {
        const url = shipment_id
          ? `/profile/orders/shipment/${shipment_id}`
          : "/profile/orders";
        spaNavigate(url);
        return {
          success: true,
          message: shipment_id
            ? `Redirecting to shipment: ${shipment_id}...`
            : "Redirecting to your orders page...",
        };
      } catch (error) {
        return {
          success: false,
          message: `Failed to redirect to orders page: ${error.message}`,
        };
      }
    },
  },

  {
    name: "redirect_to_address",
    description:
      "Redirect user to the address management page, optionally to create a new address or edit an existing one",
    timeout: 5000,
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          description:
            "Action to perform: 'create' for adding new address, 'edit' for editing existing address, or 'list' to view all addresses",
          enum: ["create", "edit", "list"],
          default: "list",
        },
        address_id: {
          type: "string",
          description: "Address ID to edit (required when action is 'edit')",
        },
      },
    },
    handler: ({ action = "list", address_id } = {}) => {
      try {
        // Build URL using utility function
        const urlResult = buildAddressUrl({ action, address_id });

        if (!urlResult.success) {
          return createErrorResponse(
            false,
            urlResult.error,
            "provide_address_id"
          );
        }

        // Navigate to the built URL
        spaNavigate(urlResult.url);

        // Generate appropriate success message
        const message = generateAddressMessage({ action, address_id });

        return createSuccessResponse(message);
      } catch (error) {
        return createErrorResponse(
          false,
          `Failed to redirect to address page: ${error.message}`,
          "retry"
        );
      }
    },
  },
];
