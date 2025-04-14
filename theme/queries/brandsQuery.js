export const DEPARTMENT_LIST = `query Departments {
    departments {
      logo {
        alt
        meta {
          source
        }
        type
        url
      }
      name
      priority_order
      slug
      uid
    }
  }`;

export const BRAND_LISTING = `query Brands($pageNo: Int, $pageSize: Int) {
    brands(pageNo: $pageNo, pageSize: $pageSize) {
      items {
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
        description
        logo {
          alt
          meta {
            source
          }
          type
          url
        }
        name
        uid
        action {
          page {
            params
            query
            type
          }
          type
        }
        departments
        discount
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

export const BRAND_DETAILS = `query brand($slug: String!) {
  brand(slug: $slug) {
    description
    banners{
      landscape{
      type
      url
      }
      portrait{
      type
      url
      }
    }
    logo {
      alt
      type
      url
    }
    name
    slug
  }
}
`;
