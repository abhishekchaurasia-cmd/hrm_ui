import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './slices';

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

export type AppStore = ReturnType<typeof makeStore>;
export type AppRootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
