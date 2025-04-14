export const FEATURE_PRODUCT_DETAILS = `query($slug: String!)  {
  product(slug: $slug) {
    color
    item_code
    item_type
    has_variant
    uid
    grouped_attributes {
      title
      details {
        key
        type
        value
      }
    }
    attributes
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
    custom_meta {
      key
      value
    }
    description
    discount
    highlights
    image_nature
    is_dependent
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
    product_group_tag
    product_online_date
    rating
    rating_count
    seo {
      description
      title
    }
    short_description
    similars
    slug
    teaser_tag
    tryouts
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

export const FEATURE_PRODUCT_SIZE_PRICE = `query ProductPrice($slug: String!, $size: String!,  $pincode: String!) {
  productPrice(slug: $slug, size: $size,  pincode: $pincode) {
    article_id
    discount
    is_cod
    is_gift
    item_type
    long_lat
    pincode
    quantity
    seller_count
    special_badge
    price_per_piece {
      currency_code
      currency_symbol
      effective
      marked
      selling
    }
    price {
      currency_code
      currency_symbol
      effective
      marked
      selling
    }
    price_per_unit {
      currency_code
      currency_symbol
      price
      unit
    }
    seller {
      count
      name
      uid
    }
    set {
      quantity
    }
    store {
      uid
      name
      count
    }
    article_assignment {
        level
        strategy
    }
    delivery_promise {
      max
      min
    }
  }
} `;
