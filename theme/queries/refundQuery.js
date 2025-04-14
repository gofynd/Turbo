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

export const ADD_REFUND_BANK_DETAILS = `mutation addRefundBankAccountUsingOTP(
  $addBeneficiaryDetailsOTPRequestInput: AddBeneficiaryDetailsOTPRequestInput
) {
  addRefundBankAccountUsingOTP(
    addBeneficiaryDetailsOTPRequestInput: $addBeneficiaryDetailsOTPRequestInput
  ) {
    data
    is_verified_flag
    message
    success
  }
}`;

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