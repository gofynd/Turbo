export const SHARED_CART_DETAILS = `query sharedCartDetails($token: String!) {
  sharedCartDetails(token: $token) {
    cart {
      buy_now
      id
      restrict_checkout
      uid
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
      }
      items {
        discount
        key
        quantity
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
          type
          uid
          seller {
            name
            uid
          }
          store {
            name
            store_code
            uid
          }
        }
        availability {
          deliverable
          is_valid
          other_store_quantity
          out_of_stock
          sizes
        }
        product {
          attributes
          item_code
          name
          slug
          type
          uid
          brand {
            name
            uid
          }
          images {
            secure_url
            url
          }
        }
        price {
          converted {
            add_on
            currency_code
            currency_symbol
            effective
            marked
            selling
          }
        }
      }
      shared_cart_details {
        created_on
        meta
        source
        token
        user
      }
    }
    error 
  }
}
`;

export const UPDATE_CART_WITH_SHARED_ITEMS = `mutation updateCartWithSharedItems($action: ActionEnum!, $token: String!) {
  updateCartWithSharedItems(action: $action, token: $token) {
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
      last_modified
      message
      restrict_checkout
      uid
      custom_cart_meta
    }
    error
  }
}
`;
