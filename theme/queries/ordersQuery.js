export const ORDER_LISTING = `query orders(
  $customMeta: String
  $fromDate: String
  $pageNo: Int
  $pageSize: Int
  $status: Int
  $toDate: String
) {
  orders(
    customMeta: $customMeta
    fromDate: $fromDate
    pageNo: $pageNo
    pageSize: $pageSize
    status: $status
    toDate: $toDate
  ) {
    page {
      current
      has_next
      item_total
      size
      type
    }
    filters {
      statuses {
        display
        is_selected
        value
      }
    }
    items {
      order_created_time
      order_created_ts
      order_id
      total_shipments_in_order
      shipments {
        awb_no
        beneficiary_details
        can_break
        can_cancel
        can_return
        comment
        custom_meta
        delivery_date
        dp_name
        need_help_url
        order_id
        order_type
        refund_details
        return_meta
        returnable_date
        shipment_created_at
        shipment_id
        show_download_invoice
        show_track_link
        size_info
        total_bags
        track_url
        traking_no
        fulfillment_option {
          name
          slug
          type
          is_default
        }
        bags {
          can_cancel
          can_return
          currency_code
          currency_symbol
          delivery_date
          id
          line_number
          meta
          parent_promo_bags
          quantity
          returnable_date
          seller_identifier
          item {
            code
            id
            image
            l1_categories
            l2_categories
            l3_category_name
            name
            seller_identifier
            size
            slug_key
          }
          bundle_details {
            bundle_group_id
            name
            slug
            price_marked
            price_effective
            item_id
            item_type
            is_base
            images
            seller_identifier
            article_bundle_id
            bundle_count
            bundle_article_quantity
            return_config {
              allow_partial_return
            }
          }
          prices {
            added_to_fynd_cash
            amount_paid
            amount_paid_roundoff
            brand_calculated_amount
            cashback
            cashback_applied
            cod_charges
            coupon_effective_discount
            coupon_value
            currency_code
            currency_symbol
            delivery_charge
            discount
            fynd_credits
            gst_tax_percentage
            price_effective
            price_marked
            promotion_effective_discount
            refund_amount
            refund_credit
            transfer_price
            value_of_good
          }
        }
        shipment_status {
          hex_code
          title
          value
        }
        tracking_details {
          is_current
          is_passed
          status
          time
          value
          created_ts
          tracking_details {
            is_current
            is_passed
            status
            time
          }
        }
        user_info {
          email
          first_name
          gender
          last_name
          mobile
          name
        }
      }
      bags_for_reorder {
          item_id
          item_size
          quantity
          seller_id
          store_id
          article_assignment {
              level
              strategy
          }
      }
    }
  }
}`;

export const ORDER_BY_ID = `query order($orderId: String!) {
  order(orderId: $orderId) {
    bags_for_reorder {
      item_id
      item_size
      quantity
      seller_id
      store_id
    }
    breakup_values {
      currency_code
      currency_symbol
      display
      name
      value
    }
    order_created_time
    order_created_ts
    order_id
    shipments {
      awb_no
      beneficiary_details
      can_break
      can_cancel
      can_return
      comment
      custom_meta
      delivery_date
      dp_name
      need_help_url
      order_id
      order_type
      refund_details
      return_meta
      returnable_date
      shipment_created_at
      shipment_id
      show_download_invoice
      show_track_link
      size_info
      total_bags
      track_url
      traking_no
      fulfillment_option {
        name
        slug
        type
        is_default
      }
      bags {
        can_cancel
        can_return
        currency_code
        currency_symbol
        delivery_date
        id
        line_number
        meta
        parent_promo_bags
        quantity
        returnable_date
        seller_identifier
        item {
          code
          id
          image
          l1_categories
          l2_categories
          l3_category_name
          name
          seller_identifier
          size
          slug_key
          brand {
            logo
            name
          }
        }
        bundle_details {
          bundle_group_id
          name
          slug
          price_marked
          price_effective
          item_id
          item_type
          is_base
          images
          seller_identifier
          article_bundle_id
          bundle_count
          bundle_article_quantity
          return_config {
            allow_partial_return
          }
        }
        prices {
          added_to_fynd_cash
          amount_paid
          amount_paid_roundoff
          brand_calculated_amount
          cashback
          cashback_applied
          cod_charges
          coupon_effective_discount
          coupon_value
          currency_code
          currency_symbol
          delivery_charge
          discount
          fynd_credits
          gst_tax_percentage
          price_effective
          price_marked
          promotion_effective_discount
          refund_amount
          refund_credit
          transfer_price
          value_of_good
        }
      }
      breakup_values {
        currency_code
        currency_symbol
        display
        name
        value
      }
      shipment_status {
        hex_code
        title
        value
      }
      tracking_details {
        is_current
        is_passed
        status
        time
        value
        created_ts
        tracking_details {
          is_current
          is_passed
          status
          time
        }
      }
      user_info {
        email
        first_name
        gender
        last_name
        mobile
        name
      }
    }
    total_shipments_in_order
    user_info {
      email
      first_name
      gender
      last_name
      mobile
      name
    }
  }
}
`;
