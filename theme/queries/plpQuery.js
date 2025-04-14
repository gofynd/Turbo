export const PLP_PRODUCTS = `query products(
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
    filters {
      key {
        display
        kind
        logo
        name
      }
      values {
        count
        currency_code
        currency_symbol
        display
        display_format
        is_selected
        max
        min
        query_format
        selected_max
        selected_min
        value
      }
    }
    sort_on {
      display
      is_selected
      logo
      name
      value
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
    items {
        brand {
            name
        }
        action {
          page {
            params
            query
            type
          }
          type
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
        media {
            alt
            type
            url
        }
        variants {
          display_type
          header
          items {
            _custom_meta {
              key
              value
            }
            color
            color_name
            is_available
            medias {
              alt
              type
              url
            }
            name
            slug
            uid
            value
          }
          key
          total
        }
        slug
        uid
        sellable
        teaser_tag
        discount
        name
        product_online_date
    }
  }
}
`;

export const GET_QUICK_VIEW_PRODUCT_DETAILS = `query($slug: String!)  {
  product(slug: $slug) {
    brand {
      name
      uid
    }
    color
    item_code
    item_type
    has_variant
    uid
    custom_config
    media {
      alt
      meta {
        source
      }
      type
      url
    }
    sizes {
      discount
      multi_size
      sellable
      size_chart {
        description
        headers {
          col_1 {
            convertable
            value
          }
          col_2 {
            convertable
            value
          }
          col_3 {
            convertable
            value
          }
          col_4 {
            convertable
            value
          }
          col_5 {
            convertable
            value
          }
          col_6 {
            convertable
            value
          }
        }
        image
        size_tip
        sizes {
          col_1
          col_2
          col_3
          col_4
          col_5
          col_6
        }
        title
        unit
      }
      sizes:size_details {
        dimension {
          height
          is_default
          length
          unit
          width
        }
        display
        is_available
        quantity
        seller_identifiers
        value
        weight {
          is_default
          shipping
          unit
        }
      }
      stores {
        count
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
    custom_order {
      is_custom_order
      manufacturing_time
      manufacturing_time_unit
    }
    description
    discount
    moq {
      increment_unit
      maximum
      minimum
    }
    name
    net_quantity {
      unit
      value
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
    rating
    rating_count
    seo {
      description
      title
    }
    short_description
    slug
    type
    variants {
      display_type
      header
      items {
        _custom_meta {
          key
          value
        }
        color
        color_name
        is_available
        medias {
          alt
          type
          url
        }
        name
        slug
        uid
        value
      }
      key
    }
    action {
      page {
        params
        query
        type
      }
      type
    }
  }
}`;

export const BRAND_META = `query brand($slug: String!) {
  brand(slug: $slug) {
    description
    logo {
      alt
      type
      url
    }
    name
    slug
  }
}
`;

export const CATEGORY_META = `query Category($slug: String!) {
    category(slug: $slug) {
        banners {
            landscape {
                alt
                type
                url
            }
            portrait {
                alt
                type
                url
                meta {
                    source
                }
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
        name
        uid
    }
}
`;