export const LOGIN_WITH_OTP = `mutation loginWithOTP(
  $platform: String
  $sendOtpRequestSchemaInput: SendOtpRequestSchemaInput
) {
  loginWithOTP(
    platform: $platform
    sendOtpRequestSchemaInput: $sendOtpRequestSchemaInput
  ) {
    country_code
    email
    message
    mobile
    register_token
    request_id
    resend_email_token
    resend_timer
    resend_token
    success
    user_exists
    verify_email_otp
    verify_mobile_otp
  }
}`;

export const VERIFY_MOBILE_OTP = `mutation verifyMobileOTP(
  $platform: String
  $verifyOtpRequestSchemaInput: VerifyOtpRequestSchemaInput
) {
  verifyMobileOTP(
    platform: $platform
    verifyOtpRequestSchemaInput: $verifyOtpRequestSchemaInput
  ) {
    register_token
    user_exists
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      first_name
      gender
      last_name
      meta
      profile_pic_url
      updated_at
      user_id
      username
      emails {
        active
        email
        primary
        verified
      }
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
    }
  }
}`;

export const LOGIN_WITH_EMAIL_AND_PASSWORD = `mutation loginWithEmailAndPassword($passwordLoginRequestSchemaInput: PasswordLoginRequestSchemaInput) {
    loginWithEmailAndPassword(passwordLoginRequestSchemaInput: $passwordLoginRequestSchemaInput) {
        register_token
        request_id
        user {
            id
            account_type
            active
            application_id
            created_at
            dob
            first_name
            gender
            last_name
            meta
            profile_pic_url
            updated_at
            user_id
            username
            external_id
            rr_id
            emails {
                active
                email
                primary
                verified
            }
            phone_numbers {
                active
                country_code
                phone
                primary
                verified
            }
        }
    }
}`;

export const LOGOUT = `query Logout {
  user {
    logout {
      logout
    }
  }
}`;

export const UPDATE_PROFILE = `mutation updateProfile(
  $editProfileRequestSchemaInput: EditProfileRequestSchemaInput
  $platform: String
) {
  updateProfile(
    editProfileRequestSchemaInput: $editProfileRequestSchemaInput
    platform: $platform
  ) {
    country_code
    email
    message
    mobile
    register_token
    request_id
    resend_email_token
    resend_timer
    resend_token
    success
    user_exists
    verify_email_link
    verify_email_otp
    verify_mobile_otp
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      first_name
      gender
      last_name
      meta
      profile_pic_url
      updated_at
      user_id
      username
      external_id
      rr_id
      emails {
        active
        email
        primary
        verified
      }
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
    }
  }
}`;

export const SEND_RESET_PASSWORD_EMAIL = `mutation sendResetPasswordEmail(
  $platform: String
  $sendResetPasswordEmailRequestSchemaInput: SendResetPasswordEmailRequestSchemaInput
) {
  sendResetPasswordEmail(
    platform: $platform
    sendResetPasswordEmailRequestSchemaInput: $sendResetPasswordEmailRequestSchemaInput
  ) {
    status
  }
}`;

export const REGISTER_WITH_FORM = `mutation registerWithForm(
  $formRegisterRequestSchemaInput: FormRegisterRequestSchemaInput
  $platform: String
) {
  registerWithForm(
    formRegisterRequestSchemaInput: $formRegisterRequestSchemaInput
    platform: $platform
  ) {
    country_code
    email
    message
    mobile
    register_token
    request_id
    resend_email_token
    resend_timer
    resend_token
    success
    user_exists
    verify_email_otp
    verify_mobile_otp
  }
}`;

export const SEND_OTP_ON_MOBILE = `mutation sendOTPOnMobile(
  $platform: String
  $sendMobileOtpRequestSchemaInput: SendMobileOtpRequestSchemaInput
) {
  sendOTPOnMobile(
    platform: $platform
    sendMobileOtpRequestSchemaInput: $sendMobileOtpRequestSchemaInput
  ) {
    country_code
    message
    mobile
    register_token
    request_id
    resend_timer
    resend_token
    success
  }
}`;

export const VERIFY_EMAIL_OTP = `mutation verifyEmailOTP(
  $platform: String
  $verifyEmailOtpRequestSchemaInput: VerifyEmailOtpRequestSchemaInput
) {
  verifyEmailOTP(
    platform: $platform
    verifyEmailOtpRequestSchemaInput: $verifyEmailOtpRequestSchemaInput
  ) {
    register_token
    user_exists
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      first_name
      gender
      last_name
      meta
      profile_pic_url
      updated_at
      user_id
      username
      external_id
      rr_id
      emails {
        active
        email
        primary
        verified
      }
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
    }
  }
}`;

export const SEND_OTP_ON_EMAIL = `mutation sendOTPOnEmail(
  $platform: String
  $sendEmailOtpRequestSchemaInput: SendEmailOtpRequestSchemaInput
) {
  sendOTPOnEmail(
    platform: $platform
    sendEmailOtpRequestSchemaInput: $sendEmailOtpRequestSchemaInput
  ) {
    success
    resend_email_token
  }
}`;

export const FORGOT_PASSWORD = `mutation forgotPassword(
  $forgotPasswordRequestSchemaInput: ForgotPasswordRequestSchemaInput
) {
  forgotPassword(
    forgotPasswordRequestSchemaInput: $forgotPasswordRequestSchemaInput
  ) {
    register_token
    request_id
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      emails {
        active
        email
        primary
        verified
      }
      first_name
      gender
      last_name
      meta
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
      profile_pic_url
      updated_at
      user_id
      username
    }
  }
}`;

export const SEND_RESET_TOKEN = `mutation sendResetToken(
  $codeRequestBodySchemaInput: CodeRequestBodySchemaInput
) {
  sendResetToken(codeRequestBodySchemaInput: $codeRequestBodySchemaInput) {
    status
  }
}`;
