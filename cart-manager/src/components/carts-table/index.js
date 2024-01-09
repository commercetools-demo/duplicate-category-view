import { lazy } from 'react';

const CartsTable = lazy(() =>
  import('./carts-table' /* webpackChunkName: "carts-table" */)
);

export default CartsTable;
