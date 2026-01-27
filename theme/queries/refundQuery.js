export const GET_REFUND_DETAILS = `query refund($orderId: String!) {
  refund {
    user_beneficiaries_detail(orderId: $orderId) {
        show_beneficiary_details
        beneficiaries {
            account_holder
            account_no
            address
            bank_name
            beneficiary_id
            branch_name
            comment
            created_on
            delights_user_name
            display_name
            email
            id
            ifsc_code
            is_active
            mobile
            modified_on
            subtitle
            title
            transfer_mode
        }
    }
  }
}`;

export const GET_ACTVE_REFUND_MODE = `query refund($orderId: String!) {
   refund { 
        user_beneficiaries_detail(orderId: $orderId) {
            show_beneficiary_details
            beneficiaries {
                account_holder
                account_no
                address
                bank_name
                beneficiary_id
                branch_name
                comment
                created_on
                delights_user_name
                display_name
                email
                id
                ifsc_code
                is_active
                mobile
                modified_on
                subtitle
                title
                transfer_mode
            }
        }
        active_refund_transfer_modes {
            data {
                display_name
                items {
                    id
                    display_name
                    logo_large
                    logo_small
                    name
                }
            }
        }
    }
}`;

export const VERIFY_IFSC_CODE = `query Payment($ifscCode: String!) {
   payment { 
        verify_IFSC_code(ifscCode: $ifscCode) {
            bank_name
            branch_name
            success
        }
    }
}`;

export const ADD_BENEFICIARY_DETAILS = `mutation addBeneficiaryDetails(
  $addBeneficiaryDetailsRequestInput: AddBeneficiaryDetailsRequestInput
) {
  addBeneficiaryDetails(
    addBeneficiaryDetailsRequestInput: $addBeneficiaryDetailsRequestInput
  ) {
    data
    is_verified_flag
    message
    success
  }
}`;

export const ADD_REFUND_BANK_DETAILS = `
  mutation addRefundBeneficiaryUsingOTPSession(
    $addBeneficiaryInput: AddBeneficiaryInput
  ) {
    addRefundBeneficiaryUsingOTPSession(
      addBeneficiaryInput: $addBeneficiaryInput
    ) {
      message
      is_verified
      id
      account_no
      account_holder
      bank_name
      upi
      logo
    }
  }
`;

export const VERIFY_OTP_FOR_WALLET = `mutation verifyOtpAndAddBeneficiaryForWallet(
  $walletOtpRequestInput: WalletOtpRequestInput
) {
  verifyOtpAndAddBeneficiaryForWallet(
    walletOtpRequestInput: $walletOtpRequestInput
  ) {
    is_verified_flag
    request_id
    success
  }
}`;

export const VERIFY_OTP_FOR_BANK = `mutation verifyOtpAndAddBeneficiaryForBank(
  $addBeneficiaryViaOtpVerificationRequestInput: AddBeneficiaryViaOtpVerificationRequestInput
) {
  verifyOtpAndAddBeneficiaryForBank(
    addBeneficiaryViaOtpVerificationRequestInput: $addBeneficiaryViaOtpVerificationRequestInput
  ) {
    message
    success
  }
}`;

export const SEND_OTP_FOR_REFUND_BANK_DETAILS = `mutation sendOtpForRefundBankDetails($orderId: String, $shipmentId: String) {
  sendOtpForRefundBankDetails(orderId: $orderId, shipmentId: $shipmentId) {
    message
    request_id
    resend_timer
    success
  }
}
`;

export const VERIFY_OTP_FOR_REFUND_BANK_DETAILS = `mutation verifyOtpForRefundBankDetails(
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

export const GET_REFUND_MODES = `query getRefundModes(
  $shipmentId: String!
  $lineNumbers: [Int!]
) {
  getRefundModes(
    shipmentId: $shipmentId
    lineNumbers: $lineNumbers
  ) {
    refund_options {
      slug
      display_name
      beneficiary_type
      amount
      currency_symbol
      message
      logo
      suggested_list
      refund_modes {
        refund_mode
        display_name
        payment_identifiers
      }
    }
    refund_price_breakup {
      name
      display
      value
      currency_symbol
      currency_code
      sub_values {
        name
        display
        value
        currency_symbol
        currency_code
      }
    }
    is_refund_config_enabled
  }
}
`;

export const GET_REFUND_BENEFICIARIES = `query Refund($orderId: String!, $shipmentId: String!) {
  refund {
    order_user_beneficiaries(orderId: $orderId, shipmentId: $shipmentId) {
      upi {
        is_active
        is_verified
        transfer_mode
        display_name
        vpa_address
        customer_name
        id
        logo
      }
      bank {
        ifsc_code
        is_active
        is_verified
        transfer_mode
        display_name
        account_holder
        logo
        account_no
        id
      }
    }
  }
}
`;

export const ADD_BENEFICIARY_BANK = `
  mutation AddBeneficiary(
    $account_holder: String!
    $account_no: String!
    $ifsc_code: String!
    $order_id: String!
    $shipment_id: String!
  ) {
    addBeneficiary(
      addBeneficiaryInput: {
        details: {
          account_holder: $account_holder
          account_no: $account_no
          ifsc_code: $ifsc_code
        }
        order_id: $order_id
        shipment_id: $shipment_id
      }
    ) {
      message
      is_verified
      id
      account_no
      account_holder
      bank_name
      upi
      logo
    }
  }
`;

export const ADD_BENEFICIARY_UPI = `mutation AddBeneficiary($upi: String!, $order_id: String!, $shipment_id: String!) {
  addBeneficiary(
    addBeneficiaryInput: {
      details: {
        upi: $upi
      }
      order_id: $order_id
      shipment_id: $shipment_id
    }
  ) {
    message
    is_verified
    id
    account_no
    account_holder
    bank_name
    upi
    logo
  }
}`;

export const UPDATE_DEFAULT_BENEFICIARY = `mutation updateDefaultBeneficiary(
  $setDefaultBeneficiaryRequestInput: SetDefaultBeneficiaryRequestInput
) {
  updateDefaultBeneficiary(
    setDefaultBeneficiaryRequestInput: $setDefaultBeneficiaryRequestInput
  ) {
    is_beneficiary_set
    success
  }
}`;

export const GETREFUNDBENEFICIARIESUSINGOTPSESSION = `mutation getRefundBeneficiariesUsingOTPSession(
  $orderId: String
  $shipmentId: String
  $filterBy: FilterByEnum
) {
  getRefundBeneficiariesUsingOTPSession(
    orderId: $orderId
    shipmentId: $shipmentId
    filterBy: $filterBy
  ) {
    upi {
      is_active
      is_verified
      transfer_mode
      display_name
      vpa_address
      customer_name
      id
      logo
    }
    bank {
      ifsc_code
      is_active
      is_verified
      transfer_mode
      display_name
      account_holder
      logo
      account_no
      id
    }
  }
}`;
