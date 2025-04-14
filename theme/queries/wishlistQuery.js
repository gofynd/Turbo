export const FETCH_FOLLOWED_PRODUCTS = `query followedListing(
  $collectionType: String!
  $pageId: String
  $pageSize: Int
) {
  followedListing(
    collectionType: $collectionType
    pageId: $pageId
    pageSize: $pageSize
  ) {
    items {
      brand {
        name
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
      }
      slug
      uid
      sellable
      teaser_tag
      discount
      name
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
}`;

export const FOLLOWED_PRODUCTS_IDS = `query FollowedListing {
  followedListing(collectionType: "products") {
    items {
      uid
    }
    page {
      item_total
    }
  }
}
`;

export const CART_ITEMS_COUNT = `query Cart {
  cart {
    user_cart_items_count
  }
}`;

export const WISHLIST_DATA = `query FollowedListing($collectionType: String!, $pageId: String, $pageSize: Int) {
    followedListing(collectionType: $collectionType, pageSize: $pageSize, pageId: $pageId) {
      items {
        brand {
          custom_config
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
            }
          }
          description
          logo {
            alt
            type
            url
          }
          name
          uid
          departments
          discount
          slug
        }
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
          slug
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
          size_details {
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
        }
        country_of_origin
        department
        custom_order {
          is_custom_order
          manufacturing_time
          manufacturing_time_unit
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
          canonical_url
          sitemap {
            frequency
            priority
          }
          meta_tags
          breadcrumbs
        }
        short_description
        similars
        slug
        tags
        teaser_tag
        tryouts
        type
        variants {
          display_type
          group_id
          header
          items {
            _custom_meta {
              key
              value
            }
            _custom_json
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
          logo
          total
        }
        action {
          page {
            params
            query
            type
            url
          }
          type
        }
        categories {
          _custom_json
          description
          name
          uid
          id
        }
        category_map {
          l1 {
            _custom_json
            description
            name
            uid
            id
          }
          l2 {
            _custom_json
            description
            name
            uid
            id
          }
          l3 {
            _custom_json
            description
            name
            uid
            id
          }
        }
        sellable
        no_of_boxes
        promo_meta
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
  }`;

export const ADD_WISHLIST = `mutation FollowById($collectionType: String!, $collectionId: String!) {
  followById(collectionType: $collectionType, collectionId: $collectionId) {
    id
    message
  }
}`;

export const REMOVE_WISHLIST = `mutation UnFollowById($collectionType: String!, $collectionId: String!) {
  unfollowById(collectionType: $collectionType, collectionId: $collectionId) {
    id
    message
  }
}`;

export const PRODUCT_SIZE_PRICE_WISHLIST = `query ProductPrice($slug: String!, $size: String!,  $pincode: String!) {
  productPrice(slug: $slug, size: $size,  pincode: $pincode) {
    article_assignment {
      level
      strategy
    }
    article_id
    quantity
    seller {
      uid
    }
    store {
      uid
    }
  }
}`;

export const FOLLOWED_PRODUCTS_ID = `query followedListing(
  $collectionType: String!
  $pageId: String
  $pageSize: Int
) {
  followedListing(
    collectionType: $collectionType
    pageId: $pageId
    pageSize: $pageSize
  ) {
    items {
      uid
    }
    page {
      item_total
    }
  }
}`;
