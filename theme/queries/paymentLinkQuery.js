export const CREATE_ORDER_PAYMENT_LINK = `mutation createOrderHandlerPaymentLink(
  $createOrderUserRequestInput: CreateOrderUserRequestInput
) {
  createOrderHandlerPaymentLink(
    createOrderUserRequestInput: $createOrderUserRequestInput
  ) {
    callback_url
    data {
      aggregator
      amount
      callback_url
      contact
      currency
      customer_id
      email
      merchant_order_id
      method
      order_id
    }
    message
    order_id
    payment_confirm_url
    success
  }
}
`;

export const CREATE_PAYMENT_LINK = ` query paymentLinkDetail($paymentLinkId: String) {
  paymentLinkDetail(paymentLinkId: $paymentLinkId) {
    payment_link {
      amount
      external_order_id
      merchant_name
      message
      payment_link_current_status
      payment_link_url
      polling_timeout
      status_code
      success
    }
    polling_payment_link {
      aggregator_name
      amount
      http_status
      message
      order_id
      payment_link_id
      redirect_url
      status
      status_code
      success
    }
  }
}
`;
export const LINK_PAYMENT_OPTIONS = `query payment(
  $paymentLinkId: String!
) {
  payment {
    
    payment_mode_routes_payment_link(paymentLinkId: $paymentLinkId) {
      success
      payment_breakup
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
        }
        name
        save_card
      }
      }
    }
  }
}
`;
