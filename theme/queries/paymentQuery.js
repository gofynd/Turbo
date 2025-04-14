export const CHECK_AND_UPDATE_PAYMENT_STATUS = `mutation checkAndUpdatePaymentStatus(
  $paymentStatusUpdateRequestInput: PaymentStatusUpdateRequestInput
) {
  checkAndUpdatePaymentStatus(
    paymentStatusUpdateRequestInput: $paymentStatusUpdateRequestInput
  ) {
    aggregator_name
    redirect_url
    retry
    status
    success
  }
}
`;

export const RESEND_OR_CANCEL_PAYMENT = `mutation resendOrCancelPayment(
  $resendOrCancelPaymentRequestInput: ResendOrCancelPaymentRequestInput
) {
  resendOrCancelPayment(
    resendOrCancelPaymentRequestInput: $resendOrCancelPaymentRequestInput
  ) {
    data {
      message
      status
      is_payment_done
    }
    success
  }
}
`;

export const CARD_DETAILS = `query payment(
  $cardInfo: String!, $aggregator: String
) {
  payment {
    card_details(cardInfo: $cardInfo, aggregator: $aggregator) {
      data {
        card_brand,
        cvv_length,
        logo,
        is_enabled,
        is_card_valid
      }
      success
    }
  }
}
`;
