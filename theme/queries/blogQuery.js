export const FETCH_BLOGS_LIST = `query ApplicationContent(
  $pageNo: Int
  $pageSize: Int
  $tags: String
  $search: String
) {
  applicationContent {
    blogs(
        pageNo: $pageNo 
        pageSize: $pageSize 
        tags: $tags 
        search: $search
    ) {
      items {
        custom_json
        id
        application
        archived
        published
        reading_time
        slug
        tags
        publish_date
        title
        summary
        author {
            designation
            id
            name
        }
        feature_image {
            aspect_ratio
            id
            secure_url
        }
        date_meta {
            created_on
            modified_on
        }
        content {
            type
            value
        }
      }
      page {
        current
        next_id
        has_previous
        has_next
        item_total
        type
        size
      }
      filters {
        tags
      }
    }
  }
}
`;

export const GET_BLOG = `query blog($slug: String!,$preview: Boolean) {
  blog(slug: $slug,preview:$preview) {
    custom_json
    id
    application
    archived
    author {
      designation
      id
      name
    }
    content {
      type
      value
    }
    date_meta {
      created_on
      modified_on
    }
    feature_image {
      aspect_ratio
      id
      secure_url
    }
    published
    reading_time
    seo {
      title
      description
      canonical_url
    }
    slug
    tags
    publish_date
    title
    summary
  }
}
`;
