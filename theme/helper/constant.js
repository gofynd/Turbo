/* eslint-disable  import/prefer-default-export */
export const SINGLE_FILTER_VALUES = {
  page_no: true,
};

export const ALL_PROFILE_MENU = [
  {
    key: "orders",
    icon: "orders",
    display: "My Orders",
    link: "/profile/orders",
    disabled_cart: false,
  },
  {
    key: "phone",
    icon: "call",
    display: "Phone Number",
    link: "/profile/phone",
    disabled_cart: true,
  },
  {
    key: "email",
    icon: "email",
    display: "Email Address",
    link: "/profile/email",
    staff: false,
    disabled_cart: true,
  },
  {
    key: "address",
    icon: "address",
    display: "My Address",
    link: "/profile/address",
    disabled_cart: false,
  },
  {
    key: "card",
    icon: "card",
    display: "My Cards",
    link: "/profile/my-cards",
    disabled_cart: false,
  },
  {
    key: "reward_points",
    icon: "refernearn",
    display: "Refer and Earn",
    link: "/profile/refer-earn",
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
    display: "resource.common.date_filter_options.last_30_days",
    value: 30,
    is_selected: false,
  },
  {
    display: "resource.common.date_filter_options.last_6_months",
    value: 180,
    is_selected: false,
  },
  {
    display: "resource.common.date_filter_options.last_12_months",
    value: 365,
    is_selected: false,
  },
  {
    display: "resource.common.date_filter_options.last_24_months",
    value: 730,
    is_selected: true,
  },
];

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
