/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Category duplicate',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
    },
    production: {
      customViewId: '${env:CUSTOM_VIEW_ID}',
      url: '${env:APPLICATION_URL}',
    },
  },
  additionalEnv: {
    testURL: '${env:TEST_URL}',
  },
  oAuthScopes: {
    view: ['view_categories', 'view_products'],
    manage: ['manage_categories', 'manage_products'],
  },
  type: 'CustomPanel',
  typeSettings: {
    size: 'LARGE',
  },
  locators: ['categories.category_details.general', 'categories.category_details.products', 'categories.category_details.external_search'],
};

export default config;
