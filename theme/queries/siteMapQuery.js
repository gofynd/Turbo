export const PRODUCTS = `query products(
  $search: String
  $filterQuery: String
  $enableFilter: Boolean
  $sortOn: String
  $first: Int
  $pageNo: Int
  $pageSize: Int
  $after: String
  $pageType: String
) {
  products(
    search: $search
    filterQuery: $filterQuery
    enableFilter: $enableFilter
    sortOn: $sortOn
    first: $first
    pageNo: $pageNo
    pageSize: $pageSize
    after: $after
    pageType: $pageType
  ) {
    sort_on {
      display
      is_selected
      logo
      name
      value
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
    items {
      color
      item_code
      item_type
      has_variant
      uid
      attributes
      custom_config
      description
      discount
      highlights
      image_nature
      is_dependent
      name
      product_group_tag
      product_online_date
      rating
      rating_count
      short_description
      similars
      slug
      tags
      teaser_tag
      tryouts
      type
      identifiers
      sizes
      sellable
      country_of_origin
      is_tryout
      channel
    }
  }
}`;

export const BLOGS = `query ApplicationContent(
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
        id
        slug
        title
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
}`;

export const COLLECTIONS = `query collections($pageNo: Int,$pageSize: Int) {
    collections(pageNo: $pageNo, pageSize: $pageSize) {
      items {
        uid
        name
        description
        slug
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

 export const CATEGORIES_LISTING = `query Categories($department: String) {
    categories(department: $department) {
      data {
        department
        items {
          _custom_json
          action {
            page {
              params
              query
              type
            }
            type
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
          childs {
            _custom_json
            childs {
              _custom_json
              childs {
                _custom_json
                name
                slug
                uid
                priority
              }
              name
              slug
              uid
              priority
              action {
                page {
                  params
                  query
                  type
                }
                type
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
            }
            name
            slug
            uid
            priority
            action {
              page {
                params
                query
                type
              }
              type
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
                meta {
                  source
                }
                type
                url
              }
            }
          }
          name
          slug
          uid
          priority
        }
      }
      departments {
        slug
        uid
      }
    }
  }`;