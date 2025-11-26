export const SEND_OTP_FOR_REATTEMPT_SHIPMENT = `mutation sendShipmentOtpToCustomer($orderId: String, $shipmentId: String, $eventType: ShipmentOtpEventType) {
  sendShipmentOtpToCustomer(
    orderId: $orderId
    shipmentId: $shipmentId
    eventType: $eventType
  ) {
    message
    request_id
    resend_timer
    success
  }
}
`;

export const VERIFY_OTP_FOR_REATTEMPT_SHIPMENT = `mutation verifyShipmentOtpFromCustomer(
  $orderId: String
  $shipmentId: String
  $verifyOtpInput: VerifyOtpInput
) {
  verifyOtpForRefundBankDetails(
    orderId: $orderId
    shipmentId: $shipmentId
    verifyOtpInput: $verifyOtpInput
  ) {
    success
    message
  }
}
`;
