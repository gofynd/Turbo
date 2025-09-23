export const LOGIN_WITH_FACEBOOK_MUTATION = `
    mutation loginWithFacebook(
      $oAuthRequestSchemaInput: OAuthRequestSchemaInput
      $platform: String
    ) {
      loginWithFacebook(
        oAuthRequestSchemaInput: $oAuthRequestSchemaInput
        platform: $platform
      ) {
        register_token
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
        }
        user_exists
      }
    }
  `;

export const GOOGLE_LOGIN = `mutation loginWithGoogle(
  $oAuthRequestSchemaInput: OAuthRequestSchemaInput
  $platform: String
) {
  loginWithGoogle(
    oAuthRequestSchemaInput: $oAuthRequestSchemaInput
    platform: $platform
  ) {
    register_token
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      emails{
      active
      email
      primary
      verified
      }
      first_name
      gender
      last_name
      meta
      phone_numbers{
      active
      country_code
      primary
      verified
      phone
      }
      profile_pic_url
      updated_at
      user_id
      username
      external_id
      rr_id
    }
    user_exists
  }
}
`;
export const APPLE_LOGIN = `mutation loginWithAppleIOS(
  $oAuthRequestAppleSchemaInput: OAuthRequestAppleSchemaInput
  $platform: String
) {
  loginWithAppleIOS(
    oAuthRequestAppleSchemaInput: $oAuthRequestAppleSchemaInput
    platform: $platform
  ) {
    register_token
    user {
      id
      account_type
      active
      application_id
      created_at
      dob
      emails{
      active
      email
      primary
      verified
      }
      phone_numbers{
      active
      country_code
      primary
      verified
      phone
      }
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
    }
    user_exists
  }
}
`;
