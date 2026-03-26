/* eslint-disable  import/prefer-default-export */
import featureCollection1 from "../assets/images/placeholder/featured-collection-1.jpg";
import featureCollection2 from "../assets/images/placeholder/featured-collection-2.jpg";
import featureCollection3 from "../assets/images/placeholder/featured-collection-3.jpg";
import featureCollection4 from "../assets/images/placeholder/featured-collection-4.jpg";
import featureCollection5 from "../assets/images/placeholder/featured-collection-5.jpg";
import featureCollection6 from "../assets/images/placeholder/featured-collection-6.jpg";
import mediaWithTextHotspot from "../assets/images/placeholder/media-with-text-hotspot.jpg";

export const SINGLE_FILTER_VALUES = {
  page_no: true,
};

// export const ALL_PROFILE_MENU = [
//   {
//     key: "orders",
//     icon: "orders",
//     display: "My Orders",
//     link: "/profile/orders",
//     disabled_cart: false,
//   },
//   {
//     key: "phone",
//     icon: "call",
//     display: "Phone Number",
//     link: "/profile/phone",
//     disabled_cart: true,
//   },
//   {
//     key: "email",
//     icon: "email",
//     display: "Email Address",
//     link: "/profile/email",
//     staff: false,
//     disabled_cart: true,
//   },
//   {
//     key: "address",
//     icon: "address",
//     display: "My Address",
//     link: "/profile/address",
//     disabled_cart: false,
//   },
//   {
//     key: "card",
//     icon: "card",
//     display: "My Cards",
//     link: "/profile/my-cards",
//     disabled_cart: false,
//   },
//   {
//     key: "reward_points",
//     icon: "refernearn",
//     display: "Refer and Earn",
//     link: "/profile/refer-earn",
//     disabled_cart: false,
//   },
// ];
export const ALL_PROFILE_MENU = [
  {
    key: "orders",
    icon: "orders",
    display: "resource.common.my_orders",
    link: "/profile/orders",
    disabled_cart: false,
  },
  {
    key: "phone",
    icon: "call",
    display: "resource.common.phone_number",
    link: "/profile/phone",
    disabled_cart: true,
  },
  {
    key: "email",
    icon: "email",
    display: "resource.common.email_address",
    link: "/profile/email",
    staff: false,
    disabled_cart: true,
  },
  {
    key: "address",
    icon: "address",
    display: "resource.common.my_address",
    link: "/profile/address",
    disabled_cart: false,
  },
  {
    key: "returned_orders",
    icon: "orders",
    display: "My Returns",
    link: "/profile/orders?status=4",
    disabled_cart: false,
  },
  {
    key: "wishlist",
    icon: "wishlist",
    display: "My Wishlist",
    link: "/wishlist",
    disabled_cart: false,
  },
];

export const GENDER_OPTIONS = [
  {
    value: "male",
    display: "Male",
  },
  {
    value: "female",
    display: "Female",
  },
  {
    value: "unisex",
    display: "Other",
  },
];

export const DATE_FILTERS = [
  {
    display: "Today",
    value: 0,
    is_selected: false,
  },
  {
    display: "Last 7 days",
    value: 7,
    is_selected: false,
  },
  {
    display: "Last 30 days",
    value: 30,
    is_selected: false,
  },
  {
    display: "Last 90 days",
    value: 90,
    is_selected: false,
  },
  {
    display: "Last 12 months",
    value: 365,
    is_selected: false,
  },
  {
    display: "Custom",
    value: "custom",
    is_selected: false,
  },
];

export const REFUND_MODE = {
  bank: "bank",
  storeCredits: "store credits",
  upi: "upi",
  refundToSource: "refund to source",
};

export const LANGUAGE_ISO_CODE = [
  {
    label: "Arabic",
    "iso-code": "ar",
  },
  {
    label: "English",
    "iso-code": "en",
  },
  {
    label: "Hindi",
    "iso-code": "hi_IN",
  },
];

export const DEFAULT_UTC_LOCALE = "en-US";
export const DEFAULT_CURRENCY_LOCALE = "en-IN";

export const DIRECTION_ADAPTIVE_CSS_PROPERTIES = {
  TEXT_ALIGNMENT: "text-align",
  FLOAT: "float",
};

export const TEXT_ALIGNMENT_MAP = {
  left: "start",
  right: "end",
  center: "center",
};

export const FLOAT_MAP = {
  left: "start",
  right: "end",
};
export const FEATURED_COLLECTION_PLACEHOLDER_PRODUCTS = [
  {
    uid: 1,
    slug: "",
    media: [
      {
        alt: "The watering Can",
        type: "image",
        url: featureCollection1,
      },
    ],
    teaser_tag: null,
    sellable: true,
    discount: "",
    name: "The watering Can",
    price: {
      effective: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
      marked: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
    },
  },
  {
    uid: 2,
    slug: "",
    media: [
      {
        alt: "The Boots",
        type: "image",
        url: featureCollection2,
      },
    ],
    teaser_tag: null,
    sellable: true,
    discount: "",
    name: "The Boots",
    price: {
      effective: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
      marked: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
    },
  },
  {
    uid: 3,
    slug: "",
    media: [
      {
        alt: "The Cute Planter",
        type: "image",
        url: featureCollection3,
      },
    ],
    teaser_tag: null,
    sellable: true,
    discount: "",
    name: "The Cute Planter",
    price: {
      effective: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
      marked: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
    },
  },
  {
    uid: 4,
    slug: "",
    media: [
      {
        alt: "The Tools",
        type: "image",
        url: featureCollection4,
      },
    ],
    teaser_tag: null,
    sellable: true,
    discount: "",
    name: "The Tools",
    price: {
      effective: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
      marked: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
    },
  },
  // {
  //   uid: 5,
  //   slug: "",
  //   media: [
  //     {
  //       alt: "The Hanging planter",
  //       type: "image",
  //       url: featureCollection5,
  //     },
  //   ],
  //   teaser_tag: null,
  //   sellable: true,
  //   discount: "",
  //   name: "The Hanging planter",
  //   price: {
  //     effective: {
  //       currency_code: "INR",
  //       currency_symbol: "₹",
  //       max: 20.12,
  //       min: 20.12,
  //     },
  //     marked: {
  //       currency_code: "INR",
  //       currency_symbol: "₹",
  //       max: 20.12,
  //       min: 20.12,
  //     },
  //   },
  // },
  // {
  //   uid: 6,
  //   slug: "",
  //   media: [
  //     {
  //       alt: "The Watering Can",
  //       type: "image",
  //       url: featureCollection6,
  //     },
  //   ],
  //   teaser_tag: null,
  //   sellable: true,
  //   discount: "",
  //   name: "The Watering Can",
  //   price: {
  //     effective: {
  //       currency_code: "INR",
  //       currency_symbol: "₹",
  //       max: 20.12,
  //       min: 20.12,
  //     },
  //     marked: {
  //       currency_code: "INR",
  //       currency_symbol: "₹",
  //       max: 20.12,
  //       min: 20.12,
  //     },
  //   },
  // },
];

export const MEDIA_WITH_TEXT_HOTSPOT_PLACEHOLDER_PRODUCT = {
  uid: 1,
  media: [
    {
      alt: "The Wheel Baroww",
      type: "image",
      url: mediaWithTextHotspot,
    },
  ],
  sizes: {
    discount: "",
    sellable: true,
    price: {
      effective: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
      marked: {
        currency_code: "INR",
        currency_symbol: "₹",
        max: 20.12,
        min: 20.12,
      },
    },
  },
  name: "The Wheel Barrow",
  brand: {
    name: "Bloom",
  },
  slug: "",
  type: "product",
  variants: [],
  action: null,
};
export const ENABLE_SWR_CACHE = false;

// Wishlist page size for fetching all wishlist IDs
// Used to ensure global store has complete wishlist data, not just paginated results
export const WISHLIST_PAGE_SIZE = 100;

/**
 * Image optimization configuration for Pixelbin transformations
 * Adjust these values to balance quality vs. performance
 */
export const IMAGE_OPTIMIZATION_CONFIG = {
  // Default quality for all images (1-100)
  // 80 is optimal: ~40-50% smaller files with minimal visible quality loss
  DEFAULT_QUALITY: 80,

  // Maximum DPR (Device Pixel Ratio) to support
  // 2.5 balances retina display sharpness with file size
  MAX_DPR: 2.5,

  // Sharpening settings to prevent blur after resize
  SHARPEN: {
    ENABLED: true, // Set to false to disable sharpening globally
    INTENSITY: 2, // 0-10, where 2 is moderate, 5+ is aggressive
  },

  // Quality presets for different use cases
  QUALITY_PRESETS: {
    THUMBNAIL: 70, // Small images, more compression acceptable
    PRODUCT: 85, // Product images, higher quality needed
    HERO: 90, // Hero/banner images, premium quality
    BACKGROUND: 60, // Background images, can be heavily compressed
  },
};

/**
 * Responsive image breakpoints configuration
 * Maps viewport widths to image sizes (considering DPR)
 *
 * Formula: image_width = viewport_width * target_dpr
 * Target DPR ranges from 1.3x (large screens) to 1.8x (mobile) for optimal quality
 */
export const RESPONSIVE_IMAGE_BREAKPOINTS = [
  // Desktop large (≥1440px): 1920px image (1440 * 1.33 = 1920)
  { breakpoint: { min: 1440 }, width: 1920 },
  // Laptop (≥1024px): 1600px image (1280 * 1.25 = 1600)
  { breakpoint: { min: 1024 }, width: 1600 },
  // Tablet landscape (≥768px): 1200px image (768 * 1.56 = 1200)
  { breakpoint: { min: 768 }, width: 1200 },
  // Tablet portrait (≥640px): 1000px image (640 * 1.56 = 1000)
  { breakpoint: { min: 640 }, width: 1000 },
  // Mobile large (≥480px): 800px image (480 * 1.67 = 800)
  { breakpoint: { min: 480 }, width: 800 },
  // Mobile (≥360px): 640px image (360 * 1.78 = 640)
  { breakpoint: { min: 360 }, width: 640 },
  // Mobile small (<360px): 540px image (320 * 1.69 = 540)
  { breakpoint: { max: 359 }, width: 540 },
];
