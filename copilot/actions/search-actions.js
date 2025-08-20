import { spaNavigate } from "../../theme/helper/utils";
import {
  createErrorResponse,
  createSuccessResponse,
} from "../utils/common-utils.js";

export const searchActions = [
  {
    name: "search_product",
    description:
      "Search for products by name, brand, or type (e.g., 'show me iphones', 'search for nike shoes', 'find samsung phones', 'look for laptops')",
    timeout: 10000,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Product search query or product name",
        },
      },
      required: ["query"],
    },
    handler: async ({ query }) => {
      try {
        // Navigate to product listing page with search query using 'q' parameter
        const searchUrl = `/products?q=${encodeURIComponent(query)}`;
        spaNavigate(searchUrl);

        return createSuccessResponse(`Searching for "${query}"...`);
      } catch (error) {
        return createErrorResponse(
          false,
          `Failed to search for product: ${error.message}`
        );
      }
    },
  },
];
