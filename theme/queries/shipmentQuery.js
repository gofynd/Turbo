export const GET_SHIPMENT_DETAILS = `query shipment(
  $shipmentId: String!
) {
  shipment(shipmentId: $shipmentId) {
    detail {
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
        applied_promos {
          amount
          article_quantity
          mrp_promotion
          promo_id
          promotion_name
          promotion_type
          applied_free_articles {
            article_id
            free_gift_item_details
            parent_item_identifier
            quantity
          }
        }
        current_status {
          journey_type
          name
          status
          updated_at
        }
        financial_breakup {
          added_to_fynd_cash
          amount_paid
          amount_paid_roundoff
          brand_calculated_amount
          cashback
          cashback_applied
          cod_charges
          coupon_effective_discount
          coupon_value
          delivery_charge
          discount
          fynd_credits
          gst_fee
          gst_tag
          gst_tax_percentage
          hsn_code
          item_name
          price_effective
          price_marked
          promotion_effective_discount
          refund_amount
          refund_credit
          size
          total_units
          transfer_price
          value_of_good
        }
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
      delivery_address {
        address
        address1
        address2
        address_category
        address_type
        area
        city
        contact_person
        country
        country_iso_code
        country_phone_code
        created_at
        email
        landmark
        latitude
        longitude
        name
        phone
        pincode
        state
        updated_at
        version
        display_address
      }
      fulfilling_company {
        id
        name
      }
      invoice {
        invoice_url
        label_url
        updated_date
      }
      fulfilling_store {
        code
        company_id
        company_name
        id
        name
      }
      promise {
        show_promise
        timestamp {
          max
          min
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
      payment {
        display_name
        logo
        mode
        mop
        payment_mode
        status
        amount
      }
      shipment_status {
        hex_code
        title
        value
      }
      total_details {
        pieces
        sizes
        total_price
      }
      payment_info {
          display_name
          logo
          mode
          mop
          payment_mode
          status
          amount
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
  }
}`;

export const GET_SHIPMENT_CUSTOMER_DETAILS = `query shipment(
  $shipmentId: String!
  $orderId: String!
) {
  shipment(shipmentId: $shipmentId) {
    detail {
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
        applied_promos {
          amount
          article_quantity
          mrp_promotion
          promo_id
          promotion_name
          promotion_type
          applied_free_articles {
            article_id
            free_gift_item_details
            parent_item_identifier
            quantity
          }
        }
        current_status {
          journey_type
          name
          status
          updated_at
        }
        financial_breakup {
          added_to_fynd_cash
          amount_paid
          amount_paid_roundoff
          brand_calculated_amount
          cashback
          cashback_applied
          cod_charges
          coupon_effective_discount
          coupon_value
          delivery_charge
          discount
          fynd_credits
          gst_fee
          gst_tag
          gst_tax_percentage
          hsn_code
          item_name
          price_effective
          price_marked
          promotion_effective_discount
          refund_amount
          refund_credit
          size
          total_units
          transfer_price
          value_of_good
        }
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
      delivery_address {
        address
        address1
        address2
        address_category
        address_type
        area
        city
        contact_person
        country
        country_iso_code
        country_phone_code
        created_at
        email
        landmark
        latitude
        longitude
        name
        phone
        pincode
        state
        updated_at
        version
        display_address
      }
      fulfilling_company {
        id
        name
      }
      invoice {
        invoice_url
        label_url
        updated_date
      }
      fulfilling_store {
        code
        company_id
        company_name
        id
        name
      }
      promise {
        show_promise
        timestamp {
          max
          min
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
      payment {
        display_name
        logo
        mode
        mop
        payment_mode
        status
        amount
      }
      shipment_status {
        hex_code
        title
        value
      }
      total_details {
        pieces
        sizes
        total_price
      }
      payment_info {
          display_name
          logo
          mode
          mop
          payment_mode
          status
          amount
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
    customer_detail(orderId: $orderId) {
      country
      name
      order_id
      phone
      shipment_id
    }
  }

}`;

export const SHIPMENT_REASONS = `query shipment(
  $shipmentId: String!
  $bagId: String!
) {
  shipment(shipmentId: $shipmentId) {
    shipment_reasons {
            reasons {
                feedback_type
                flow
                priority
                reason_id
                reason_text
                show_text_area
            }
        }
    shipment_bag_reasons(bagId: $bagId) {
            success
            reasons {
                display_name
                id
                qc_type
                question_set {
                  display_name
                  id
                }
                meta {
                    show_text_area
                    remark_required
                }
                reasons {
                    display_name
                    id
                    qc_type
                    question_set {
                      display_name
                      id
                    }
                    meta {
                        show_text_area
                        remark_required
                    }
                    reasons {
                        display_name
                        id
                        qc_type
                        question_set {
                          display_name
                          id
                        }
                        meta {
                            show_text_area
                            remark_required
                        }
                        reasons {
                            display_name
                            id
                            qc_type
                            question_set {
                              display_name
                              id
                            }
                            meta {
                                show_text_area
                                remark_required
                            }
                            reasons {
                                display_name
                                id
                                qc_type
                                question_set {
                                  display_name
                                  id
                                }
                                meta {
                                    show_text_area
                                    remark_required
                                }
                            }
                        }
                    }
                }
            }
        }
  }
}
`;

export const UPDATE_SHIPMENT_STATUS = `mutation updateShipmentStatus(
  $shipmentId: String! 
  $updateShipmentStatusRequestInput: UpdateShipmentStatusRequestInput!
) {
    updateShipmentStatus(shipmentId: $shipmentId, updateShipmentStatusRequestInput: $updateShipmentStatusRequestInput) {
      statuses {
        shipments
    }
  }
}
`;

export const SHIPMENT_INVOICE = `query shipment(
  $shipmentId: String!
) {
  shipment(shipmentId: $shipmentId) {
    invoice_detail {
            presigned_type
            presigned_url
            shipment_id
            success
    }
  }
}`;

export const START_MEDIA_UPLOAD = `mutation StartUpload($startUploadReqInput: StartUploadReqInput!, $namespace: FileStorageNamespace!) {
  startUpload(
    startUploadReqInput: $startUploadReqInput
    namespace: $namespace
  ) {
    file_name
    file_path
    content_type
    method
    namespace
    operation
    size
    tags
    upload {
      expiry
      url
    }
  }
}`;

export const COMPLETE_MEDIA_UPLOAD = `mutation CompleteUpload($completeUploadReqInput: CompleteUploadReqInput!, $namespace: FileStorageNamespace!) {
  completeUpload(
    completeUploadReqInput: $completeUploadReqInput
    namespace: $namespace
  ) {
      file_name
      file_path
      content_type
      namespace
      size
      tags
      upload {
        expiry
        url
      }
      cdn {
        url
        absolute_url
        relative_url
      }
  }
}`;
