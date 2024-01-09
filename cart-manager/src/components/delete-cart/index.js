import { lazy } from 'react';

const DeleteCart = lazy(() =>
  import('./delete-cart' /* webpackChunkName: "delete-cart" */)
);

export default DeleteCart;
