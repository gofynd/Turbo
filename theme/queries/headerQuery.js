export const FETCH_NAVIGATION_QUERY = `query Navigations {
  applicationContent {
    navigations {
      items {
        id
        archived
        name
        navigation {
          action {
            page {
              params
              query
              type
              url
            }
            type
          }
          active
          display
          image
          sort_order
          sub_navigation {
            active
            display
            image
            sort_order
            tags
            type
            action {
              page {
                params
                query
                type
                url
              }
              popup {
                params
                query
                type
                url
              }
              type
            }
            sub_navigation {
              acl
              active
              display
              image
              sort_order
              tags
              type
            }
          }
          tags
          type
        }
        orientation {
          landscape
          portrait
        }
        platform
        slug
        version
      }
    }
  }
}`;

export const FETCH_CARTCOUNT_QUERY = `GetItemCount {
  cart {
    user_cart_items_count
  }
}`;

export const SEARCH_PRODUCT = `query products(
  $search: String
  $filterQuery: String
  $enableFilter: Boolean
  $sortOn: String
  $first: Int
  $pageNo: Int
  $after: String
  $pageType: String
) {
  products(
    search: $search
    filterQuery: $filterQuery
    enableFilter: $enableFilter
    sortOn: $sortOn
    first: $first
    pageNo: $pageNo
    after: $after
    pageType: $pageType
  ) {
    page {
      current
      next_id
      has_previous
      has_next
      item_total
      type
      size
    }
    items {
      uid
      name
      slug
      media {
        alt
        meta {
          source
        }
        type
        url
      }
    }
  }
}`;

export const CART_COUNT = `query Cart($areaCode: String, $assignCardId: Int, $includeBreakup: Boolean, $buyNow: Boolean, $includeAllItems: Boolean, $includeCodCharges: Boolean, $cartId: String) {
  cart(areaCode: $areaCode, assignCardId: $assignCardId, includeBreakup: $includeBreakup, buyNow: $buyNow, includeAllItems: $includeAllItems, includeCodCharges: $includeCodCharges, id: $cartId) {
    user_cart_items_count
  }
}`;

export const AUTOCOMPLETE = `query SearchProduct($query: String!) {
  searchProduct(query: $query) {
    items {
      custom_json
      display
      type
      action {
        type
        page {
          params
          query
          type
        }
      }
      logo {
        alt
        type
        url
        meta {
          source
        }
      }
    }
  }
}
`;
