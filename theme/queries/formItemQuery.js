export const CUSTOM_FORM = `query support($slug: String!) {
    support {
      custom_form(slug: $slug) {
        id
        application_id
        description
        header_image
        inputs
        login_required
        should_notify
        slug
        success_message
        title
      }
    }
  }
`;

export const SUBMIT_CUSTOM_FORM = `mutation submitCustomForm(
    $customFormSubmissionPayloadInput: CustomFormSubmissionPayloadInput
    $slug: String!
  ) {
    submitCustomForm(
      customFormSubmissionPayloadInput: $customFormSubmissionPayloadInput
      slug: $slug
    ) {
      message
      ticket {
        _custom_json
        _id
        assigned_to
        created_at
        created_by
        integration
        is_feedback_pending
        response_id
        source
        sub_category
        tags
        updated_at
      }
    }
  }
`;
