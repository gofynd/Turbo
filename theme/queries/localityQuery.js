export const LOCALITY = `query locality(
  $locality: LocalityEnum!
  $localityValue: String!
  $city: String
  $country: String
  $state: String
) {
  locality(
    locality: $locality
    localityValue: $localityValue
    city: $city
    country: $country
    state: $state
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
