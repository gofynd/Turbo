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
