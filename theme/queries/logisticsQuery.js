export const LOCALITY = `query locality(
  $locality: LocalityEnum!
  $localityValue: String!
  $country:  String
) {
  locality(
    locality: $locality
    localityValue: $localityValue
    country: $country
  ) {
    display_name
    id
    name
    parent_ids
    type
    localities {
      id
      name
      display_name
      parent_ids
      type
    }
  }
}`;

export const DELIVERY_PROMISE = `query DeliveryPromise {
    deliveryPromise {
        promise {
            min
            max
        }
    }
}`;

export const STORE_HYPERLOCAL = `query store($locationId: Int!) {
    store(locationId: $locationId) {
        uid
        name
        store_code
        address {
            address1
            address2
            city
            country
            landmark
            lat_long {
              coordinates
              type
            }
            pincode
            state
        }
        manager {
            mobile_no {
                country_code
                number
            }
        }
    }
}`;

export const VALIDATE_ADDRESS = `mutation validateAddress(
  $countryIsoCode: String
  $templateName: templateNameEnum
  $validateAddressRequestInput: ValidateAddressRequestInput
) {
  validateAddress(
    countryIsoCode: $countryIsoCode
    templateName: $templateName
    validateAddressRequestInput: $validateAddressRequestInput
  ) {
    address
    address1
    address2
    area
    landmark
    pincode
    sector
    city
    state
    name
    phone
    email
  }
}`;