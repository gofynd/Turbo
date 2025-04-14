export const FAQ_CATEGORIES = `query ApplicationContent {
    applicationContent {
        faq_categories {
            categories {
                custom_json
                id
                application
                children
                description
                icon_url
                index
                slug
                title
            }
        }
    }

}`;
export const FAQS_BY_CATEGORY = `query faqsByCategory($slug: String!) {
  faqsByCategory(slug: $slug) {
    faqs {
      id
      answer
      application
      question
      slug
      tags
    }
  }
}`;
