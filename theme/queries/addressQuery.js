export const ADDRESS_LIST = `query addresses(
  $buyNow: Boolean
  $cartId: String
  $checkoutMode: String
  $isDefault: Boolean
  $mobileNo: String
  $tags: String
) {
  addresses(
    buyNow: $buyNow
    cartId: $cartId
    checkoutMode: $checkoutMode
    isDefault: $isDefault
    mobileNo: $mobileNo
    tags: $tags
  ) {
    address {
      custom_json
      address
      address_type
      area
      area_code
      area_code_slug
      checkout_mode
      city
      country
      country_code
      country_iso_code
      country_phone_code
      created_by_user_id
      email
      geo_location {
          latitude
          longitude
      }
      google_map_point
      id
      is_active
      is_default_address
      landmark
      meta
      name
      phone
      state
      tags
      user_id
      sector
      state_code
    }
    pii_masking
  }
}`;

export const ADD_ADDRESS = `mutation addAddress($address2Input: Address2Input) {
  addAddress(address2Input: $address2Input) {
    id
    is_default_address
    success
  }
}`;

export const UPDATE_ADDRESS = `mutation updateAddress($address2Input: Address2Input, $id: String) {
  updateAddress(address2Input: $address2Input, id: $id) {
    id
    is_default_address
    success
    is_updated
  }
}`;

export const REMOVE_ADDRESS = `mutation removeAddress($id: String) {
  removeAddress(id: $id) {
    id
    is_deleted
  }
}`;
