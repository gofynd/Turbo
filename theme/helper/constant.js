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
