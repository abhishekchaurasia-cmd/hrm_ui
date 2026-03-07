import { combineReducers } from '@reduxjs/toolkit';

import sidebarReducer from './sidebar';
import themeReducer from './theme';

const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  theme: themeReducer,
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
