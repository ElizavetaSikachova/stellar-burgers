import { configureStore } from '@reduxjs/toolkit';
import { reducers } from '@slices';
import {
  TypedUseSelectorHook,
  useDispatch as dispatchHook,
  useSelector as selectorHook
} from 'react-redux';

// ✅ ДИАГНОСТИКА - проверяем каждый reducer
console.log('=== REDUX DIAGNOSTICS START ===');
console.log(' reducers object:', reducers);
console.log(' reducers keys:', Object.keys(reducers));

// Проверяем каждый reducer
Object.entries(reducers).forEach(([key, reducer]) => {
  console.log(` Checking reducer "${key}":`, {
    isFunction: typeof reducer === 'function',
    reducer
  });

  // Проверяем, что reducer не возвращает undefined при инициализации
  try {
    const initState = reducer(undefined, { type: '@@INIT' });
    console.log(` Reducer "${key}" init state:`, initState);

    if (initState === undefined) {
      console.error(` REDUCER "${key}" RETURNED UNDEFINED ON INIT!`);
    }
  } catch (error) {
    console.error(` REDUCER "${key}" THREW ERROR ON INIT:`, error);
  }
});

console.log('=== END DIAGNOSTICS ===');

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
