import { configureStore } from '@reduxjs/toolkit';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

import { constructorReducer } from './slices/constructor-slice';
import { ingredientsReducer } from './slices/ingredients-slice';
import { feedReducer } from './slices/feed-slice';
import { ordersReducer } from './slices/orders-slice';
import { authReducer } from './slices/auth-slice';

const reducers = {
  burgerConstructor: constructorReducer,
  ingredients: ingredientsReducer,
  feed: feedReducer,
  orders: ordersReducer,
  auth: authReducer
};

const store = configureStore({
  reducer: reducers,
  devTools: true,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: {
        warnAfter: 128,
        ignoredActionPaths: ['meta.arg', 'payload.token'],
        ignoredPaths: []
      }
    })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useDispatch: () => AppDispatch = () => dispatchHook();
export const useSelector: TypedUseSelectorHook<RootState> = selectorHook;

export const useStore = () => store;

export default store;
