import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useMemo } from 'react';
import FetchCategoryQuery from './fetch-category.ctp.graphql';
import StoreCategoryMutation from './store-category.ctp.graphql';
import StoreProductMutation from './update-product.ctp.graphql';
import FetchCategoryProductsQuery from './fetch-category-products.ctp.graphql';

export const useCategory = ({ categoryId }) => {
  const [
    storeCategory,
    { error: storeCategoryError, loading: storeCategoryLoading },
  ] = useMcMutation(StoreCategoryMutation);
  const [
    updateProduct,
    { error: updateProductError, loading: updateProductLoading },
  ] = useMcMutation(StoreProductMutation);
  const {
    data: categoryData,
    error: categoryDataFetchError,
    loading: categoryDataFetchLoading,
  } = useMcQuery(FetchCategoryQuery, {
    variables: {
      categoryId,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const {
    data: categoryProductData,
    error: categoryProductDataFetchError,
    loading: categoryProductDataFetchLoading,
  } = useMcQuery(FetchCategoryProductsQuery, {
    variables: {
      where: `masterData(current(categories(id="${categoryId}")))`,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const addCategory = async (categoryDraft) => {
    return storeCategory({
      variables: categoryDraft,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    }).then((response) => {
      return response.data.createCategory;
    })
  };

  const updateProducts = async (products, categoryId) => {
    const productUpdateVariables = products.map((product) => ({
      id: product.id,
      version: product.version,
      categoryId: categoryId,
    }));
    return Promise.all(productUpdateVariables.map((updateDraftVariables) => updateProduct({
      variables: updateDraftVariables,
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    })));
  };

  const category = useMemo(() => {
    if (!categoryDataFetchLoading && !!categoryData.category) {
      return categoryData.category;
    }
    return null;
  }, [categoryDataFetchLoading, categoryData, categoryId]);

  const products = useMemo(() => {
    if (!categoryProductDataFetchLoading && !!categoryProductData.products) {
      return categoryProductData.products.results;
    }
    return null;
  }, [categoryProductDataFetchLoading, categoryProductData, categoryId]);

  return {
    category,
    products,
    updateProducts,
    addCategory,
    categoryDataFetchError,
    categoryDataFetchLoading,
    storeCategoryError,
  };
};
