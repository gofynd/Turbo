export const GET_PAGE = `query Page($slug: String!) {
  customPage: page(slug: $slug) {
    schedule {
      cron
      duration
      end
      start
    }
    application
    archived
    component_ids
    content
    content_path
    created_by {
      id
    }
    date_meta {
      created_on
      modified_on
    }
    description
    feature_image {
      aspect_ratio
      secure_url
    }
    orientation
    page_meta
    platform
    published
    seo {
      description
      title
      canonical_url
    }
    slug
    tags
    title
    type
    visibility
  }
}`;
