export const STORES_QUERY = `query stores(
  $city: String
  $latitude: Float
  $longitude: Float
  $pageNo: Int
  $pageSize: Int
  $query: String
  $range: Int
) {
  stores(
    city: $city
    latitude: $latitude
    longitude: $longitude
    pageNo: $pageNo
    pageSize: $pageSize
    query: $query
    range: $range
  ) {
    items {
      address
      city
      country
      name
      pincode
      postal_code
      state
      store_code
      store_email
      uid
      tags
      manager_contact
      company_id
      display_name
      store_type
      auto_invoice
      credit_note
      stage
      bulk_shipment
      default_order_acceptance_timing
      auto_assign_courier_partner
      contact_numbers {
        country_code
        number
      }
      order_acceptance_timing {
            weekday
            open
            opening {
                hour
                minute
            }
            closing {
                hour
                minute
            }
        }
    }
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
  }
}
`;
