export const SET_MOBILE_NUMBER_AS_PRIMARY = `mutation setMobileNumberAsPrimary(
    $sendVerificationLinkMobileRequestSchemaInput: SendVerificationLinkMobileRequestSchemaInput
  ) {
    setMobileNumberAsPrimary(
      sendVerificationLinkMobileRequestSchemaInput: $sendVerificationLinkMobileRequestSchemaInput
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
          first_name
          gender
          last_name
          meta
          profile_pic_url
          updated_at
          user_id
          username
          id
          external_id
          rr_id
          phone_numbers {
              active
              country_code
              phone
              primary
              verified
          }
        }
      }
    }
  `;

export const DELETE_MOBILE_NUMBER = `mutation deleteMobileNumber(
  $active: Boolean!
  $countryCode: String!
  $phone: String!
  $platform: String
  $primary: Boolean!
  $verified: Boolean!
) {
  deleteMobileNumber(
    active: $active
    countryCode: $countryCode
    phone: $phone
    platform: $platform
    primary: $primary
    verified: $verified
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
        first_name
        gender
        last_name
        meta
        profile_pic_url
        updated_at
        user_id
        username
        id
        external_id
        rr_id
        phone_numbers {
            active
            country_code
            phone
            primary
            verified
        }
      }
    }
  }
`;
