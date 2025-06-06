export const COLLECTIONS = `query collections($pageNo: Int,$pageSize: Int) {
    collections(pageNo: $pageNo, pageSize: $pageSize) {
      items {
        uid
        type
        name
        description
        is_active
        slug
        allow_facets
        allow_sort
        sort_on
        priority
        schedule {
          start
          end
          next_schedule {
            start
            end
          }
        }
        badge {
          text
          color
        }
        visible_facets_keys
        tags
        logo {
          type
          url
        }
        banners {
          landscape {
            alt
            meta {
              source
            }
            type
            url
          }
          portrait {
            alt
            type
            url
          }
        }
        query {
          attribute
          op
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
    }
  }`;

export const COLLECTION = `query collection(
  $slug: String!
) {
  collection(slug: $slug) {
    type
    name
    description
    is_active
    slug
    sort_on
    banners {
      landscape {
        alt
        type
        url
      }
      portrait {
        alt
        type
        url
      }
    }
    logo {
      type
      url
      alt
    }
    action {
      type
      page {
        type
        params {
          slug
        }
      }
    }
    seo {
        title
        description
        canonical_url
    }
  }
}
`;

export const COLLECTION_ITEMS = `query collectionItems(
  $slug: String!
  $search: String
  $filters: Boolean
  $first: Int
  $after: String
  $pageNo: Int
  $pageType: String
  $query: String
  $sortOn: Sort_on
) {
  collectionItems(
    slug: $slug
    search: $search
    filters: $filters
    first: $first
    after: $after
    pageNo: $pageNo
    pageType: $pageType
    query: $query
    sortOn: $sortOn
  ) {
    filters {
      key {
        display
        kind
        logo
        name
      }
      values {
        count
        currency_code
        currency_symbol
        display
        display_format
        is_selected
        max
        min
        query_format
        selected_max
        selected_min
        value
      }
    }
    items {
      brand {
        name
      }
      action {
        type
        page {
          params
          query
          type
        }
      }  
      price {
        effective {
            currency_code
            currency_symbol
            max
            min
        }
        marked {
            currency_code
            currency_symbol
            max
            min
        }
      }
      media {
          alt
          type
          url
      }
      variants {
          display_type
          header
          items {
            _custom_meta {
              key
              value
            }
            color
            color_name
            is_available
            medias {
              alt
              type
              url
            }
            name
            slug
            uid
            value
          }
          key
      }
      slug
      uid
      sellable
      teaser_tag
      discount
      name
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
    sort_on {
      display
      is_selected
      logo
      name
      value
    }
  }
}
`;

export const COLLECTION_WITH_ITEMS = `
query collectionWithItems(
  $slug: String!
  $search: String
  $filters: Boolean
  $first: Int
  $after: String
  $pageNo: Int
  $pageType: String
  $query: String
  $sortOn: Sort_on
) {
  collection(slug: $slug) {
    name
    description
    slug
    seo {
      title
      description
      canonical_url
    }
  }

  collectionItems(
    slug: $slug
    search: $search
    filters: $filters
    first: $first
    after: $after
    pageNo: $pageNo
    pageType: $pageType
    query: $query
    sortOn: $sortOn
  ) {
    filters {
      key {
        display
        kind
        logo
        name
      }
      values {
        count
        currency_code
        currency_symbol
        display
        display_format
        is_selected
        max
        min
        query_format
        selected_max
        selected_min
        value
      }
    }
    items {
      brand {
        name
      }
      action {
        type
        page {
          params
          query
          type
        }
      }  
      price {
        effective {
          currency_code
          currency_symbol
          max
          min
        }
        marked {
          currency_code
          currency_symbol
          max
          min
        }
      }
      media {
        alt
        type
        url
      }
      variants {
        display_type
        header
        items {
          _custom_meta {
            key
            value
          }
          color
          color_name
          is_available
          medias {
            alt
            type
            url
          }
          name
          slug
          uid
          value
        }
        key
      }
      slug
      uid
      sellable
      teaser_tag
      discount
      name
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
    sort_on {
      display
      is_selected
      logo
      name
      value
    }
  }
}
`;

export const COLLECTION_DETAILS = `query collection(
  $slug: String!
) {
  collection(slug: $slug) {
    name
    description
    slug
    seo {
        title
        description
        canonical_url
    }
  }
}
`;

export const FEATURED_COLLECTION = `query Collection($slug: String!, $first:Int, $pageNo: Int) {
  collection(slug: $slug) {
    name
    is_active
    description
    slug
    logo {
      type
      url
    }
    banners {
      portrait {
        alt
        type
        url
      }
    }
    products(first: $first, pageNo: $pageNo) {
      items {
        uid
        slug
        media {
          alt
          type
          url
        }
        action {
          page {
            params
            query
            type
          }
          type
        }
        teaser_tag
        sellable
        discount
        name
        price {
          effective {
            currency_code
            currency_symbol
            max
            min
          }
          marked {
            currency_code
            currency_symbol
            max
            min
          }
        }
      }
    }
  }
}
`;
