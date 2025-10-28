export const CHECKOUT_LANDING = `query Addresses( $buyNow: Boolean, $includeBreakup: Boolean, $includeAllItems: Boolean, $includeCodCharges: Boolean, $id: String) {
  addresses {
    address {
      custom_json
      address
      address_type
      area
      area_code
      area_code_slug
      checkout_mode
      city
      country
      country_code
      country_iso_code
      country_phone_code
      created_by_user_id
      email
      geo_location {
        latitude
        longitude
      }
      google_map_point
      id
      is_active
      is_default_address
      landmark
      meta
      name
      phone
      state
      tags
      user_id
      sector
    }
    pii_masking
  }
  cart(includeBreakup: $includeBreakup, buyNow: $buyNow, includeAllItems: $includeAllItems, includeCodCharges: $includeCodCharges) {
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
        _custom_json
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
    coupon {
      cashback_amount
      cashback_message_primary
      cashback_message_secondary
      coupon_code
      coupon_description
      coupon_id
      coupon_subtitle
      coupon_title
      coupon_type
      coupon_value
      discount
      is_applied
      is_valid
      message
      minimum_cart_value
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
    applied_promo_details {
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
    }
    currency {
      code
      symbol
    }
    success
  }
  coupons(buyNow: $buyNow, id: $id) {
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
  }
}`;

export const SELECT_ADDRESS = `mutation SelectAddress( $buyNow: Boolean, $cartId: String, $selectCartAddressRequestInput: SelectCartAddressRequestInput) {
  selectAddress(cartId: $cartId, buyNow: $buyNow, selectCartAddressRequestInput: $selectCartAddressRequestInput)
  {
    is_valid
    id
    message
  }
}`;

export const FETCH_SHIPMENTS = `query CartShipmentDetails($buyNow: Boolean, $addressId: String, $id: String) {
  cartShipmentDetails(addressId: $addressId, id: $id, buyNow: $buyNow) {
    buy_now
    cart_id
    checkout_mode
    comment
    coupon_text
    delivery_charge_info
    error
    gstin
    id
    is_valid
    last_modified
    message
    restrict_checkout
    uid
    custom_cart_meta
    currency {
      code
      symbol
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
    shipments {
      box_type
      dp_id
      dp_options
      fulfillment_id
      fulfillment_type
      order_type
      shipment_type
      shipments
      promise {
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
      fulfillment_option {
        name
        slug
        type
        is_default
      }
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
          seller {
            name
            uid
          }
          store {
            name
            store_code
            uid
          }
          fulfillment_option {
            name
            slug
            type
            is_default
          }
        }
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
          _custom_json
          attributes
          item_code
          name
          slug
          tags
          type
          uid
          images {
            aspect_ratio
            secure_url
            url
          }
          brand {
            name
            uid
          }
          categories {
            name
            uid
          }
          action {
            type
            url
          }
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
        }
      }
    }
    currency {
      code
      symbol
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
    breakup_values {
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
}`;

export const PAYMENT_AGG = `query AggregatorsConfig {
  aggregatorsConfig {
    env
    success
    ccavenue {
      api
      config_type
      key
      merchant_id
      merchant_key
      pin
      sdk
      secret
      user_id
      verify_api
    }
    juspay {
      api
      config_type
      key
      merchant_id
      merchant_key
      sdk
      secret
      user_id
      verify_api
      pin
    }
    mswipe {
      config_type
      key
      merchant_id
      pin
      sdk
      secret
      user_id
      verify_api
    }
    payumoney {
      config_type
      key
      merchant_id
      sdk
      secret
    }
    razorpay {
      api
      config_type
      key
      sdk
      secret
      vpa
      pin
      merchant_key
      verify_api
      user_id
      merchant_id
    }
    rupifi {
      config_type
      key
      merchant_id
      secret
      user_id
      verify_api
      api
      pin
      merchant_key
      sdk
    }
    simpl {
      config_type
      key
      secret
      sdk
    }
    stripe {
      config_type
      key
      sdk
      secret
      user_id
      verify_api
      merchant_id
      merchant_key
      api
      pin
    }
  }
}
`;

export const PAYMENT_OPTIONS = `query PaymentModeRoutes($amount: Float!,$cartId: String!,$checkoutMode: String!,$pincode: String!) {
  paymentModeRoutes(amount: $amount, cartId: $cartId, checkoutMode: $checkoutMode, pincode: $pincode) {
    payment_options {
      payment_flows {
        ajiodhan {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        bqr_razorpay {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        ccavenue {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        epaylater {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        fynd {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        jiopay {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        juspay {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        mswipe {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        payubiz {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        razorpay {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        rupifi {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        simpl {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        stripe {
          api_link
          data
          payment_flow
          payment_flow_data
        }
        upi_razorpay {
          api_link
          data
          payment_flow
          payment_flow_data
        }
      }
      aggregator_details {
        api_link
        data
        payment_flow
        aggregator_key
        type
      }
      payment_option {
        add_card_enabled
        aggregator_name
        anonymous_enable
        display_name
        display_priority
        is_pay_by_card_pl
        name
        save_card
        suggested_list
        flow
        supported_methods
        {
          name
          logo
        }
      stored_payment_details {
          card_number
          card_reference
          card_issuer
          compliant_with_tokenisation_guidelines
          card_fingerprint
          expired
          exp_year
          exp_month
          card_id
          card_brand
          nickname
          card_name
          card_type
          card_brand_image
          display_name
          card_isin
          cvv_length
          cvv_less
          card_token
          name
          meta
          vpa
      }
        list {
          aggregator_name
          card_brand
          card_brand_image
          card_fingerprint
          card_id
          card_isin
          card_issuer
          card_name
          card_number
          card_reference
          card_token
          card_type
          cod_charges
          cod_limit
          cod_limit_per_order
          code
          compliant_with_tokenisation_guidelines
          display_name
          display_priority
          exp_month
          exp_year
          expired
          fynd_vpa
          intent_app {
            code
            display_name
            logos {
              large
              small
            }
            package_name
          }
          intent_app_error_dict_list {
            code
            package_name
          }
          intent_app_error_list
          intent_flow
          logo_url {
            large
            small
          }
          merchant_code
          name
          nickname
          remaining_limit
          retry_count
          timeout
          partial_payment_allowed
        }
        name
        save_card
      }
    }
    success
  }
}`;

export const SELECT_PAYMENT_MODE = `mutation SelectPaymentMode( $buyNow: Boolean, $id: String $updateCartPaymentRequestInput: UpdateCartPaymentRequestInput) {
  selectPaymentMode(buyNow: $buyNow, id: $id, updateCartPaymentRequestInput: $updateCartPaymentRequestInput) {
    applied_promo_details {
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
    }
    buy_now
    cart_id
    checkout_mode
    comment
    coupon {
      cashback_amount
      cashback_message_primary
      cashback_message_secondary
      coupon_code
      coupon_description
      coupon_id
      coupon_subtitle
      coupon_title
      coupon_type
      coupon_value
      discount
      is_applied
      is_valid
      maximum_discount_value
      message
      minimum_cart_value
    }
    coupon_text
    currency {
      code
      symbol
    }
    delivery_charge_info
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
    gstin
    id
    is_valid
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
          add_on
          currency_code
          currency_symbol
          effective
          marked
        }
        converted {
          add_on
          currency_code
          currency_symbol
          effective
          marked
        }
      }
      price_per_unit {
        base {
          add_on
          currency_code
          currency_symbol
          effective
          marked
          selling_price
        }
        converted {
          add_on
          currency_code
          currency_symbol
          effective
          marked
          selling_price
        }
      }
      product {
        _custom_json
        attributes
        item_code
        name
        slug
        tags
        type
        uid
        images {
          aspect_ratio
          secure_url
          url
        }
        categories {
          name
          uid
        }
        brand {
          name
          uid
        }
        action {
          type
          url
        }
      }
      promo_meta {
        message
      }
    }
  }
}`;

export const CHECKOUT_CART = `mutation CheckoutCart($cartCheckoutDetailRequestInput: CartCheckoutDetailRequestInput) {
  checkoutCart(cartCheckoutDetailRequestInput: $cartCheckoutDetailRequestInput)  {
    app_intercept_url
    callback_url
    data
    message
    order_id
    payment_confirm_url
    success
    cart {
      buy_now
      cart_id
      checkout_mode
      cod_available
      cod_charges
      cod_message
      comment
      coupon_text
      delivery_charge_info
      delivery_charge_order_value
      delivery_charges
      error_message
      gstin
      id
      is_valid
      last_modified
      message
      order_id
      restrict_checkout
      store_code
      store_emps
      success
      uid
      user_type
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
      currency {
        code
        symbol
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
          seller {
            name
            uid
          }
          store {
            name
            store_code
            uid
            code
          }
        }
        availability {
          deliverable
          is_valid
          other_store_quantity
          out_of_stock
          sizes
        }
        coupon {
          code
          discount_single_quantity
          discount_total_quantity
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
        identifiers {
          identifier
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
        price {
          base {
            add_on
            currency_code
            currency_symbol
            effective
            marked
          }
          converted {
            add_on
            currency_code
            currency_symbol
            effective
            marked
          }
        }
        price_per_unit {
          base {
            add_on
            currency_code
            currency_symbol
            effective
            marked
            selling_price
          }
          converted {
            add_on
            currency_code
            currency_symbol
            effective
            marked
            selling_price
          }
        }
        product {
          _custom_json
          attributes
          item_code
          name
          slug
          tags
          type
          uid
          action {
            type
            url
            query {
              product_slug
            }
          }
          brand {
            name
            uid
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
          teaser_tag {
            tags
            tag
          }
        }
        promo_meta {
          message
        }
      }
    }
  }
}`;

export const ORDER_BY_ID = `query Order($orderId: String!) {
  order(orderId: $orderId) {
    bags_for_reorder {
      article_assignment {
        level
        strategy
      }
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
    order_id
    shipments {
      awb_no
      bags {
        applied_promos {
          amount
          applied_free_articles {
              article_id
              parent_item_identifier
              quantity
              free_gift_item_details
          }
          article_quantity
          mrp_promotion
          promo_id
          promotion_name
          promotion_type
        }
        can_cancel
        can_return
        currency_code
        currency_symbol
        current_status {
          journey_type
          name
          status
          updated_at
        }
        delivery_date
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
          size
          return_config {
            allow_partial_return
          }
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
          identifiers {
            ean
            sku_code
          }
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
        id
        item {
          brand {
            logo
            name
          }
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
        line_number
        meta
        parent_promo_bags
        quantity
        returnable_date
        seller_identifier
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
      beneficiary_details
      can_break
      can_cancel
      can_return
      comment
      custom_meta
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
      }
      delivery_date
      dp_name
      fulfilling_company {
        id
        name
      }
      fulfilling_store {
        code
        company_id
        company_name
        id
        name
      }
      invoice {
        invoice_url
        label_url
        updated_date
      }
      need_help_url
      order_id
      order_type
      payment {
        display_name
        logo
        mode
        mop
        payment_mode
        status
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
      promise {
        show_promise
        timestamp {
          max
          min
        }
      }
      refund_details
      return_meta
      returnable_date
      shipment_created_at
      shipment_id
      shipment_status {
        hex_code
        title
        value
      }
      show_download_invoice
      show_track_link
      size_info
      total_bags
      total_details {
        pieces
        sizes
        total_price
      }
      track_url
      tracking_details {
        is_current
        is_passed
        status
        time
        tracking_details {
          is_current
          is_passed
          status
          time
        }
        value
      }
      traking_no
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
}`;
export const VALID_UPI = `mutation validateVPA($validateVPARequestInput: ValidateVPARequestInput) {
  validateVPA(validateVPARequestInput: $validateVPARequestInput) {
    data {
      customer_name
      is_valid
      status
      upi_vpa
    }
    success
    customer_name
  }
}`;

export const CREDIT_NOTE_BALANCE = `mutation validateCustomerAndCreditSummary(
  $customerAndCreditSummary: CustomerAndCreditSummary
) {
  validateCustomerAndCreditSummary(
    customerAndCreditSummary: $customerAndCreditSummary
  ) {
    is_eligible
    is_applied
    message
    cart_id
    account {
      account_id
      status
      redeemable_balance {
          amount
          currency
          uid
      }
      available_balance {
          amount
          currency
          uid
      }
      amount_on_hold {
          amount
          currency
          uid
      }
    }
  }
}
`;

export const UPDATE_CART_BREAKUP = `mutation updateCartBreakup(
  $b: Boolean
  $buyNow: Boolean
  $i: Boolean
  $id: String
  $updateCartBreakupRequestInput: UpdateCartBreakupRequestInput
) {
  updateCartBreakup(
    b: $b
    buyNow: $buyNow
    i: $i
    id: $id
    updateCartBreakupRequestInput: $updateCartBreakupRequestInput
  ) {
    applied_promo_details {
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
      cancellation_allowed
    }
    buy_now
    cart_id
    checkout_mode
    comment
    coupon {
      cashback_amount
      cashback_message_primary
      cashback_message_secondary
      coupon_code
      coupon_description
      coupon_id
      coupon_subtitle
      coupon_title
      coupon_type
      coupon_value
      discount
      is_applied
      is_valid
      maximum_discount_value
      message
      minimum_cart_value
    }
    coupon_text
    currency {
      code
      symbol
    }
    delivery_charge_info
    gstin
    id
    is_valid
    items {
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
      bulk_offer
    }
    last_modified
    message
    notification
    pan_config
    pan_no
    payment_selection_lock {
      default_options
      enabled
      payment_identifier
    }
    restrict_checkout
    staff_user_id
    success
    uid
    custom_cart_meta
  }
}
`;
