export const USER_DATA_QUERY = `query User {
  user {
    logged_in_user {
      id
      account_type
      active
      dob
      first_name
      gender
      last_name
      profile_pic_url
      user_id
      username
      emails {
        active
        email
        primary
        verified
      }
      phone_numbers {
        active
        country_code
        phone
        primary
        verified
      }
    }
    has_password {
        result
    }
  }
  followedListing(
    collectionType: "products"
  ) {
    items{
      uid
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

export const THEME_DATA = `query Theme($themeId: String!, $pageValue: String!){
  theme(themeId: $themeId) {
    theme_page_detail(pageValue: $pageValue) {
      id
      path
      props
      sections {
        label
        name
        id
        custom_css
        source {
          type
          id
          bundle_name
        }
        assets {
          js
          css
        }
        blocks
        predicate {
          zones
          route {
            exact_url
            query
            selected
          }
          screen {
            desktop
            mobile
            tablet
          }

          user {
            anonymous
            authenticated
          }
        }
        props
        preset {
          blocks {
            type
            name
            props 
          }
        }
      }
      sections_meta {
        attributes
      }
      seo {
        description
        title
      }
      text
      theme
      type
      value
    }
  }
}`;

export const GLOBAL_DATA = `query ApplicationConfiguration {
  platformConfig {
    id
    active
    created_at
    delete_account_consent {
      consent_text
    }
    delete_account_day
    delete_account_reasons {
      reason_id
      reason_text
      show_text_area
    }
    desktop_image
    display
    flash_card {
      background_color
      text
      text_color
    }
    forgot_password
    login {
      otp
      password
    }
    look_and_feel {
      background_color
      card_position
    }
    meta {
      fynd_default
    }
    mobile_image
    name
    register
    register_required_fields {
      email {
        is_required
        level
      }
      mobile {
        is_required
        level
      }
    }
    required_fields {
      email {
        is_required
        level
      }
      mobile {
        is_required
        level
      }
    }
    skip_captcha
    skip_login

    subtext
    updated_at
  }
  applicationConfiguration {
    app_currencies {
      default_currency {
        code  
      }
    }
    integration_tokens {
      id
      application
      created_at
      updated_at
      tokens {
        fynd_rewards {
          credentials {
            public_key
          }
        }
        google_map {
          credentials {
            api_key
          }
        }
      }
    }
    contact_info {
      id
      address {
        address_line
        city
        country
        loc {
          coordinates
          type
        }
        phone {
          code
          number
        }
        pincode
      }
      business_highlights {
        id
        icon
        sub_title
        title
      }
      application
      support {
        email {
          key
          value
        }
        phone {
          code
          key
          number
        }
        timing
      }
      social_links {
        blog_link {
          icon
          link
          title
        }
        facebook {
          icon
          link
          title
        }
        google_plus {
          icon
          link
          title
        }
        instagram {
          icon
          link
          title
        }
        linked_in {
          icon
          link
          title
        }
        pinterest {
          icon
          link
          title
        }
        twitter {
          icon
          link
          title
        }
        vimeo {
          icon
          link
          title
        }
        youtube {
          icon
          link
          title
        }
      }
      links {
        link
        title
      }
      copyright_text
      created_at
      updated_at
      version
    }
    app_details {
      id
      banner {
        secure_url
      }
      description
      domains {
        id
        is_predefined
        is_primary
        is_shortlink
        name
        verified
      }
      favicon {
        secure_url
      }
      logo {
        secure_url
      }
      mobile_logo {
        secure_url
      }
      name
      app_type
      auth {
        enabled
      }
      cache_ttl
      channel_type
      company_id
      cors {
        domains
      }
      is_active
      is_internal
      token
      website {
        basepath
        enabled
      }
    }
    features {
      id
      app
      buybox {
        show_name
        enable_selection
        is_seller_buybox_enabled
      }
      common {
        listing_price {
          sort
          value
        }
        international_shipping {
          enabled
        }
      }
      landing_page {
        continue_as_guest
        launch_page {
          page_type
          params
          query
        }
        login_btn_text
        show_domain_textbox
        show_register_btn
      }
      product_detail {
        request_product
        seller_selection
        similar
        update_product_meta
      }
      cart {
        google_map
        gst_input
        placing_for_customer
        revenue_engine_coupon
        staff_selection
      }
    }
  }
  applicationContent {
    seo_configuration {
      id
      cannonical_enabled
      robots_txt
      sitemap_enabled
      additonal_sitemap
      custom_meta_tags{
        content
        name
      }
      details {
        description
        image_url
        title
      }
    }
    legal_information {
      id
      application
      policy
      returns
      shipping
      tnc
    }
    support_information {
      id
      application
      created
      created_at
      updated_at
      contact {
        email {
          active
          email {
            key
            value
          }
        }
        phone {
          active
          phone {
            code
            key
            number
            phone_type
          }
        }
      }
    }
    tags {
      id
      attributes
      content
      name
      pages
      position
      sub_type
      type
      url
      compatible_engines
    }
    navigations {
      items {
        id
        archived
        name
        navigation {
          action {
            page {
              params
              query
              type
              url
            }
            type
          }
          active
          display
          image
          sort_order
          sub_navigation {
            active
            display
            image
            sort_order
            tags
            type
            action {
              page {
                params
                query
                type
                url
              }
              popup {
                params
                query
                type
                url
              }
              type
            }
            sub_navigation {
              acl
              active
              display
              image
              sort_order
              tags
              type
              action {
                page {
                  params
                  query
                  type
                  url
                }
                type
              }
            }
          }
          tags
          type
        }
        orientation {
          landscape
          portrait
        }
        platform
        slug
        version
      }
    }
  }
}`;

export const INTERNATIONAL = `query International {
  applicationConfiguration {
    app_currencies {
      supported_currency {
        id
        code
        created_at
        decimal_digits
        is_active
        name
        symbol
        updated_at
        country_name
        country_code
      }
    }
  }
  allCountries {
    results {
      display_name
      is_active
      name
      uid
      meta {
        country_code
        isd_code
      }
    }
  }
}`;