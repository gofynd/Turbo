export const CREATE_TICKET = `
mutation createTicket($addTicketPayloadInput: AddTicketPayloadInput) {
  createTicket(addTicketPayloadInput: $addTicketPayloadInput) {
    _custom_json
    _id
    assigned_to
    category {
      display
      group_id
      key
    }
    content {
      description
      title
    }
    context {
      application_id
      company_id
    }
    created_at
    created_by
    created_on {
      user_agent
    }
    integration
    is_feedback_pending
    priority {
      color
      display
      key
    }
    response_id
    source
    status {
      color
      display
      key
    }
    sub_category
    tags
    updated_at
  }
}

`;
