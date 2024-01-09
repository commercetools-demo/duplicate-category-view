import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import TextField from '@commercetools-uikit/text-field';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import LocalizedMultilineTextField from '@commercetools-uikit/localized-multiline-text-field';
import { useIntl } from 'react-intl';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import { useCategory } from '../../hooks/use-category-connector';
import { Formik, setIn } from 'formik';
import { CustomFormMainPage } from '@commercetools-frontend/application-components';
import NumberField from '@commercetools-uikit/number-field';
import ProductTable from '../product-table';
import { useEffect, useState } from 'react';

const docLocalizedArrayToLocalizedString = (localizedArray, postfix = '') => {
  return Array.isArray(localizedArray)
    ? localizedArray.reduce((prev, curr) => {
        prev[curr.locale] = postfix ? `${curr.value}${postfix}` : curr.value;
        return prev;
      }, {})
    : {};
};
const formLocalizedArrayToLocalizedString = (localizedObject) => {
  return Object.keys(localizedObject).map((item) => ({
    locale: item,
    value: localizedObject[item],
  }));
};

const docToForm = (category) => ({
  // Keeping the id in the form values ensures data is not mixed accidentally
  id: category.id,
  version: category.version,
  key: `${category.key}_copy`,
  description:
    docLocalizedArrayToLocalizedString(category.descriptionAllLocales) || {},
  name: docLocalizedArrayToLocalizedString(category.nameAllLocales) || {},
  slug: docLocalizedArrayToLocalizedString(category.slugAllLocales, '_copy') || {},
  orderHint: (parseFloat(category.orderHint) || 0) + 0.001,
});

const formToDoc = (formValues) => {
  return {
    key: formValues.key,
    description: formLocalizedArrayToLocalizedString(formValues.description),
    name: formLocalizedArrayToLocalizedString(formValues.name),
    slug: formLocalizedArrayToLocalizedString(formValues.slug),
    orderHint: formValues.orderHint.toString(),
  };
};
const Category = () => {
  const intl = useIntl();

  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const { env, testURL } = useApplicationContext(
    (context) => context.environment
  );

  const { hostUrl, dataLocale } = useCustomViewContext((context) => context);
  const currentUrl = env === 'development' ? testURL : hostUrl;

  const [_, categoryId] = currentUrl.match('/categories/([^/]+)/.*');

  const {
    addCategory,
    updateProducts,
    category,
    products,
    categoryDataFetchLoading,
    storeCategoryError,
  } = useCategory({
    categoryId,
  });

  const submission = async (formValues) => {
    const categoryDraft = formToDoc(formValues);
    if (category.parent) {
      categoryDraft.parent = {
        typeId: 'category',
        id: category.parent.id,
      };
    }
    if (category.custom) {
      categoryDraft.custom = {
        type: {
          id: category.custom.typeRef.id,
          typeId: 'type',
        },
        fields:
          category.custom.customFieldsRaw?.map(({ name, value }) => ({
            name,
            value: value.toString(),
          })) || [],
      };
    }
    const {id} = await addCategory(categoryDraft);
    await updateProducts(products, id);
    setInfo(intl.formatMessage(messages.success));
  };

  useEffect(() => {
    if (storeCategoryError) {
      setError(storeCategoryError);
      return () => {
        setTimeout(() => {
          setError('');
        }, 5000);
      };
    }
  }, [storeCategoryError]);

  useEffect(() => {
    if (info) {
      return () => {
        setTimeout(() => {
          setInfo('');
        }, 5000);
      };
    }
  }, [info]);

  if (!categoryDataFetchLoading && !category) {
    return (
      <ContentNotification type="info">
        <Text.Body>{intl.formatMessage(messages.noResults)}</Text.Body>
      </ContentNotification>
    );
  }

  return (
    <>
      {!!info && (
        <ContentNotification type="success">
          <Text.Body>{info}</Text.Body>
        </ContentNotification>
      )}
      {!!error && (
        <ContentNotification type="error">
          <Text.Body>{getErrorMessage(error)}</Text.Body>
        </ContentNotification>
      )}
      {categoryDataFetchLoading && <LoadingSpinner />}

      {!!category ? (
        <Formik initialValues={docToForm(category)} onSubmit={submission}>
          {(formik) => (
            <CustomFormMainPage
              title={intl.formatMessage(messages.title)}
              formControls={
                <CustomFormMainPage.FormPrimaryButton
                  onClick={formik.handleSubmit}
                />
              }
            >
              <Spacings.Stack
                scale="xl"
                alignItems="stretch"
                justifyContent="space-between"
                data-test="innier-form"
              >
                <TextField
                  title="Key"
                  name="key"
                  value={formik.values.key}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isDisabled={formik.isSubmitting}
                  touched={formik.touched.key}
                  errors={formik.errors.key}
                />
                <Spacings.Inline>
                  <LocalizedTextField
                    title="Name"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    selectedLanguage={dataLocale}
                    onBlur={formik.handleBlur}
                    onFocus={formik.handleFocus}
                    isDisabled={formik.isSubmitting}
                    errors={formik.errors.name}
                  />
                  <LocalizedMultilineTextField
                    title="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    selectedLanguage={dataLocale}
                    onBlur={formik.handleBlur}
                    onFocus={formik.handleFocus}
                    isDisabled={formik.isSubmitting}
                    errors={formik.errors.description}
                  />
                </Spacings.Inline>
                <Spacings.Inline>
                  <NumberField
                    title="Order hint"
                    name="orderHint"
                    value={formik.values.orderHint}
                    onChange={formik.handleChange}
                    selectedLanguage={dataLocale}
                    onBlur={formik.handleBlur}
                    onFocus={formik.handleFocus}
                    isDisabled={formik.isSubmitting}
                    errors={formik.errors.orderHint}
                  />

                  <LocalizedTextField
                    title="Slug"
                    name="slug"
                    value={formik.values.slug}
                    onChange={formik.handleChange}
                    selectedLanguage={dataLocale}
                    onBlur={formik.handleBlur}
                    onFocus={formik.handleFocus}
                    isDisabled={formik.isSubmitting}
                    errors={formik.errors.slug}
                  />
                </Spacings.Inline>
                <ProductTable items={products} />
              </Spacings.Stack>
            </CustomFormMainPage>
          )}
        </Formik>
      ) : (
        <Spacings.Stack scale="s">
          <Text.Headline intlMessage={messages.noResults} />
        </Spacings.Stack>
      )}
    </>
  );
};
Category.displayName = 'Category';

export default Category;
