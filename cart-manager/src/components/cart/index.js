import { lazy } from 'react';

const Cart = lazy(() => import('./cart' /* webpackChunkName: "cart" */));

export default Cart;
