/* eslint-disable guard-for-in */
/* eslint-disable camelcase */
export const getProps = (schema, props = {}) => {
  // check schema props available
  const isSchemaProps = schema && schema.props && schema.props.length;

  // check page props available
  const isPageProps = props && props.props;

  if (isSchemaProps && isPageProps) {
    // iterate over schema props and if page props does not have key , then add it
    for (let i = 0; i < schema.props.length; i += 1) {
      // if page props already have key continue
      // eslint-disable-next-line no-prototype-builtins
      if (props.props.hasOwnProperty([schema.props[i].id])) {
        // eslint-disable-next-line no-continue
        continue;
      }

      // add key in page props with default value
      // eslint-disable-next-line no-param-reassign
      props.props[schema.props[i].id] = schema.props[i].default;
    }
  }
  return props;
};

export const getThemeGlobalConfig = (theme_config) => {
  if (theme_config) {
    const { current_list, global_schema } = theme_config;

    // Check if global_schema is defined
    if (global_schema) {
      if (current_list && current_list.global_config) {
        // Return the properties by calling getProps with global_schema and custom global config
        return getProps(global_schema, current_list.global_config.custom);
      }
      // If global_config is not defined, return the properties with default empty props
      return getProps(global_schema, { props: {} });
    }
  }
  return { props: {} };
};

// eslint-disable-next-line consistent-return
export function getThemePageConfig(theme_config, current_page) {
  if (theme_config) {
    const { current_list } = theme_config;
    if (current_page) {
      let pageConfig = null;
      if (current_list && current_list.page) {
        // Find the configuration for the current page from the current_list.page array
        pageConfig = current_list.page.find(
          (it) => it.page === current_page.value
        );
      }

      // Use the current_page object as pageSchemaConfig
      const pageSchemaConfig = current_page;

      // If pageConfig is found, return the props by calling getProps with pageSchemaConfig and pageConfig.settings
      if (pageConfig) {
        return getProps(pageSchemaConfig, pageConfig.settings);
      }
      // If pageConfig is not found, return the props by calling getProps with pageSchemaConfig and default empty props
      return getProps(pageSchemaConfig, { props: {} });
    }
    return { props: {} };
  }
}

export function filterSocialLink(appInfo) {
  const arrSocialLinks = [];

  // Extract social_links from appInfo, defaulting to an empty object if not provided
  const socialLinks = appInfo.social_links || {};

  // Iterate over each entry in socialLinks
  Object.entries(socialLinks).forEach(([key, item]) => {
    const { icon, link, title } = item;
    if (icon && link && title) {
      // Add the item to the arrSocialLinks array if all required fields are present
      arrSocialLinks.push(item);
    }
  });

  return arrSocialLinks;
}
