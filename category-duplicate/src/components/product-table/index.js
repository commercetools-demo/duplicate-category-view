import { lazy } from 'react';

const ProductTable = lazy(() =>
  import('./product-table' /* webpackChunkName: "product-table" */)
);

export default ProductTable;
