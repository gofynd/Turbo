export const SEND_VERIFICATION_LINK_TO_EMAIL = `mutation sendVerificationLinkToEmail(
    $editEmailRequestSchemaInput: EditEmailRequestSchemaInput
    $platform: String
  ) {
    sendVerificationLinkToEmail(
      editEmailRequestSchemaInput: $editEmailRequestSchemaInput
      platform: $platform
    ) {
      verify_email_link
    }
  }`;

export const VERIFY_EMAIL = `mutation verifyEmail($codeRequestBodySchemaInput: CodeRequestBodySchemaInput) {
    verifyEmail(codeRequestBodySchemaInput: $codeRequestBodySchemaInput) {
      message
    }
  }`;

export const SET_EMAIL_AS_PRIMARY = `mutation setEmailAsPrimary(
  $editEmailRequestSchemaInput: EditEmailRequestSchemaInput
) {
  setEmailAsPrimary(editEmailRequestSchemaInput: $editEmailRequestSchemaInput) {
    request_id
    register_token
    user {
        emails {
            active
            email
            primary
            verified
        }
    }
  }
}`;

export const ADD_EMAIL = `mutation addEmail(
  $editEmailRequestSchemaInput: EditEmailRequestSchemaInput
  $platform: String
) {
  addEmail(
    editEmailRequestSchemaInput: $editEmailRequestSchemaInput
    platform: $platform
  ) {
    user {
      emails {
          active
          email
          primary
          verified
      }
    }
    verify_email_link
  }
}`;

export const DELETE_EMAIL = `mutation deleteEmail(
  $active: Boolean!
  $email: String!
  $platform: String
  $primary: Boolean!
  $verified: Boolean!
) {
  deleteEmail(
    active: $active
    email: $email
    platform: $platform
    primary: $primary
    verified: $verified
  ) {
    register_token
    request_id
    user {
      emails {
        active
        email
        primary
        verified
      }
    }
  }
}`;
