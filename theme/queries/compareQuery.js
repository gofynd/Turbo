export const PRODUCT_COMPARISON = `query productComparison($slug: [String]!) {
  productComparison(slug: $slug) {
    attributes_metadata {
      details {
        display
        key
      }
        title
    }
    items {
      attributes
      discount      
      name
      slug
      sellable
      teaser_tag
      brand {
        name
    }
      categories {
        name
        id
        action {
          page {
            params
            query
            type
          }
        }
      }
      media {
        alt
        type
        url
      }
      price {
        effective {
          currency_code
          currency_symbol
          max
          min
        }
        marked {
          currency_code
          currency_symbol
          max
          min
        }
      }
    }
  }
}`;

export const SEARCH_PRODUCT = `query products(
  $search: String
  $filterQuery: String
  $enableFilter: Boolean
) {
  products(
    search: $search
    filterQuery: $filterQuery
    enableFilter: $enableFilter
  ) {
    items {
      media {
        alt
        meta {
          source
        }
        type
        url
      }
      name
      slug
    }
  }
}
`;
