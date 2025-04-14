export const GET_PRODUCT_DETAILS = `query($slug: String!)  {
  product(slug: $slug) {
    brand {
      action {
        type
        page {
          params
          query
          type
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
    }
    color
    item_code
    item_type
    has_variant
    uid
    product_online_date
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
      image {
        url
      }
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
    categories {
      description
      name
      uid
      action {
        type
        page {
          params
          query
          type
        }
      }
    }
  }
  promotions(slug: $slug, pageSize: 30) {
    available_promotions {
      buy_rules
      description
      discount_rules
      id
      offer_text
      promotion_group
      promotion_name
      valid_till
      free_gift_items {
        item_brand_name
        item_id
        item_images_url
        item_name
        item_price_details {
          currency
          marked {
              min
              max
          }
          effective {
              min
              max
          }
        }
        item_slug
      }
    }
  }
  coupons(productSlug : $slug) {
    available_coupon_list {
      coupon_amount
      coupon_applicable_message
      coupon_code
      coupon_type
      coupon_value
      description
      end_date
      expires_on
      is_applicable
      is_applied
      is_bank_offer
      max_discount_value
      message
      minimum_cart_value
      offer_text
      start_date
      sub_title
      title
    }
    page {
      current
      has_next
      has_previous
      total
      total_item_count
    }
  }
}`;

export const OFFERS = `query Offers($slug: String!) {
  promotions(slug: $slug, pageSize: 30) {
    available_promotions {
      buy_rules
      description
      discount_rules
      id
      offer_text
      promotion_group
      promotion_name
      valid_till
      free_gift_items {
        item_brand_name
        item_id
        item_images_url
        item_name
        item_price_details {
          currency
          marked {
              min
              max
          }
          effective {
              min
              max
          }
        }
        item_slug
      }
      
    }
  }
  coupons {
    available_coupon_list {
      coupon_amount
      coupon_applicable_message
      coupon_code
      coupon_type
      coupon_value
      description
      end_date
      expires_on
      is_applicable
      is_applied
      is_bank_offer
      max_discount_value
      message
      minimum_cart_value
      offer_text
      start_date
      sub_title
      title
    }
    page {
      current
      has_next
      has_previous
      total
      total_item_count
    }
  }
}`;

export const PRODUCT_SIZE_PRICE = `query ProductPrice($slug: String!, $size: String!,  $pincode: String!) {
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
    return_config {
      returnable
      time
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
    strategy_wise_listing {
      distance
      pincode
      quantity
      tat
    }
    grouped_attributes {
      title
      details {
        key
        type
        value
      }
    }
    article_assignment {
      level
      strategy
    }
    delivery_promise {
      max
      min
    }
    discount_meta {
      end
      start
      start_timer_in_minutes
      timer
    }
  }
} `;

export const COUPONS_DATA = `query Coupons {
  coupons {
    available_coupon_list {
      coupon_code
      coupon_type
      coupon_value
      coupon_description
      is_valid
      is_applied
      discount
      maximum_discount_value
      message
      minimum_cart_value
      coupon_subtitle
      coupon_title
      cashback_amount
      cashback_message_primary
      cashback_message_secondary
      coupon_id
    }
  }
}`;

export const ADD_TO_CART = `mutation AddItemsToCart($buyNow: Boolean,$areaCode:String! $addCartRequestInput: AddCartRequestInput) {
  addItemsToCart(buyNow: $buyNow,areaCode: $areaCode addCartRequestInput:$addCartRequestInput) {
    message
    partial
    success
    cart {
      buy_now
      cart_id
      checkout_mode
      comment
      coupon_text
      delivery_charge_info
      gstin
      id
      is_valid
      message
      restrict_checkout
      user_cart_items_count
      uid
      items {
        bulk_offer
        coupon_message
        custom_order
        discount
        is_set
        key
        message
        moq
        parent_item_identifiers
        product_ean_id
        quantity
        availability {
          deliverable
          is_valid
          other_store_quantity
          out_of_stock
          sizes
          available_sizes {
            display
            is_available
            value
          }
        }
        article {
          _custom_json
          cart_item_meta
          extra_meta
          gift_card
          identifier
          is_gift_visible
          meta
          mto_quantity
          parent_item_identifiers
          product_group_tags
          quantity
          seller_identifier
          size
          tags
          uid
          seller {
            name
            uid
          }
          price {
            base {
              currency_code
              currency_symbol
              effective
              marked
            }
            converted {
              currency_code
              currency_symbol
              effective
              marked
            }
          }
        }
        price_per_unit {
          base {
            currency_code
            currency_symbol
            effective
            marked
            selling_price
          }
          converted {
            currency_code
            currency_symbol
            effective
            marked
            selling_price
          }
        }
        product {
          attributes
          item_code
          name
          slug
          tags
          type
          uid
          brand {
            name
            uid
          }
          action {
            type
            url
          }
          categories {
            name
            uid
          }
          images {
            aspect_ratio
            secure_url
            url
          }
        }
        promo_meta {
          message
        }
        promotions_applied {
          amount
          article_quantity
          code
          meta
          mrp_promotion
          offer_text
          promo_id
          promotion_group
          promotion_name
          promotion_type
          applied_free_articles {
              article_id
              parent_item_identifier
              quantity
              free_gift_item_details {
                  item_brand_name
                  item_id
                  item_images_url
                  item_name
                  item_price_details {
                    currency
                    marked {
                        min
                        max
                    }
                    effective {
                        min
                        max
                    }
                  }
                  item_slug
              }
          }
          discount_rules {
            item_criteria
            matched_buy_rules
            offer
            raw_offer
          }
        }
        charges {
          meta
          name
          allow_refund
          code
          type
          amount {
            currency
            value
          }
        }
        coupon {
          code
          discount_single_quantity
          discount_total_quantity
        }
        identifiers {
          identifier
        }
        price {
          base {
            currency_code
            currency_symbol
            effective
            marked
          }
          converted {
            currency_code
            currency_symbol
            effective
            marked
          }
        }
        delivery_promise {
          formatted {
            max
            min
          }
          timestamp {
            max
            min
          }
          iso {
            max
            min
          }
        }
      }
      breakup_values {
        coupon {
          code
          coupon_type
          coupon_value
          description
          is_applied
          message
          minimum_cart_value
          sub_title
          title
          type
          uid
          value
        }
        display {
          currency_code
          currency_symbol
          display
          key
          message
          value
          preset
        }
        loyalty_points {
          applicable
          description
          is_applied
          total
        }
        raw {
          cod_charge
          convenience_fee
          coupon
          delivery_charge
          discount
          fynd_cash
          gift_card
          gst_charges
          mop_total
          mrp_total
          subtotal
          total
          vog
          you_saved
          total_charge
        }
      }
    }
  }
}`;

export const CHECK_PINCODE = `query PincodeDetails($pincode: String!) {
  pincodeDetails(pincode: $pincode) {
    success
    error {
      message
      type
      value
    }
  }
}`;

export const PRODUCT_SELLERS = `query productSellers(
  $size: String!
  $slug: String!
  $strategy: String
  $pageNo: Int
  $pageSize: Int
) {
  productSellers(
    size: $size
    slug: $slug
    strategy: $strategy
    pageNo: $pageNo
    pageSize: $pageSize
  ) {
    items {
      article_assignment {
        level
        strategy
      }
      article_id
      delivery_promise {
        min
        max
      }
      discount
      is_cod
      is_gift
      item_type
      long_lat
      pincode
      price {
        currency_code
        currency_symbol
        effective
        marked
        selling
      }
      quantity
      seller {
        name
        count
        uid
      }
      seller_count
      special_badge
      store {
        name
        count
        uid
      }
      trader
      is_serviceable
      tags

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
    sort_on {
      is_selected
      name
      value
    }
  }
}`;
