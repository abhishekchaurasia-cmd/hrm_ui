# Redux Slice Creation Guide

Use this prompt to generate a new Redux Toolkit slice that mirrors the structure and conventions of our codebase (modeled after `src/store/slices/partner-locator` and `src/store/slices/insights`), but WITHOUT any transformers. It must include the same file layout, endpoint-constant pattern, axios cancel tokens, and `condition` guards on thunks.

````text
You are generating a new Redux Toolkit slice for a Next.js/TypeScript project. Follow these exact conventions from our codebase. Create the slice in the slices folder:

  src/store/slices/<slice-name>/

Create exactly these files (inside the slice's directory):
  1) interface.ts
  2) requests.ts
  3) extra-reducers.ts
  4) index.ts

General rules:
- Use TypeScript and Redux Toolkit.
- Import `service, { HttpMethod }` from `@/services/http` and use it for all API calls.
- Put API endpoint constants at the TOP of `requests.ts` and name them in UPPER_SNAKE_CASE.
- Every async thunk uses axios CancelToken and a `condition` guard to prevent concurrent calls if a corresponding `isLoading*` flag is true.
- Handle axios errors via `thunkAPI.rejectWithValue` with the same message fallback pattern.
- No transformer imports or logic. Assign payloads to state directly.
- State shape rules by HTTP method:
  - GET endpoints: maintain three states per entity — data, `isLoading<Entity>`, `error<Entity>`.
  - POST/PUT endpoints: maintain only `isLoading<Action>` flags (no success data or error flags in state).
  - Keep selected filters and simple pagination where relevant.
  - Group state by API in both the interface and initialState, and separate groups with a blank line for readability. Example:
    - GET /<slice-name>/entities
      - `entities: []`, `isLoadingEntities: false`, `errorEntities: null`
    - GET /<slice-name>/entities/active
      - `activeEntities: []`, `isLoadingActiveEntities: false`, `errorActiveEntities: null`
    - POST/PUT actions
      - `isLoadingCreateEntity: false`, `isLoadingUpdateEntity: false`
- Export thunks from `requests.ts` via the slice `index.ts` in the same directory.
- Export action creators from `index.ts` for updating selections and pagination.
- Import and mount the reducer in `src/store/slices/index.ts` under a sensible key.

Naming placeholders (replace everywhere):
- <SliceNamePascal>  e.g., `SiteInsights`
- <sliceNameCamel>  e.g., `siteInsights`
- <slice-name-kebab> e.g., `site-insights`
- <ENTITY_A>, <ENTITY_B> represent your domain pieces (e.g., `metrics`, `sites`).

--------------------------------------------------------------------------------
File: interface.ts (types and state)
--------------------------------------------------------------------------------
- Define request/response interfaces for each endpoint.
- Define the slice state interface with:
  - For GET endpoints: data buckets (nullable or arrays), boolean loading flags `isLoading<Entity>`, and nullable error fields `error<Entity>`.
  - For POST/PUT endpoints: only boolean loading flags `isLoading<Action>`.
  - selection fields (e.g., `selectedFoo`) as needed
  - `uiPagination: { currentPage: number; limit: number }` if pagination is needed
  - Order and group the fields by API, keeping a blank line between API groups.

Example skeleton (customize names/fields, keep shapes):
```ts
// State and API interfaces for <SliceNamePascal> slice

// API Request/Response Interfaces
export interface Fetch<EntityA>Params {
  [key: string]: string | undefined;
  required_param: string;
}

export interface <EntityA>Response {
  success: boolean;
  message: string;
  data: {
    /* shape from API */
  };
}

export interface UiPagination {
  currentPage: number;
  limit: number;
}

// Slice State Interface
export interface <SliceNamePascal>State {
  // GET /<slice-name-kebab>/entity-a
  entityA: <EntityA>Response | null;
  isLoadingEntityA: boolean;
  errorEntityA: string | null;

  // GET /<slice-name-kebab>/entity-b
  entityB: unknown | null;
  isLoadingEntityB: boolean;
  errorEntityB: string | null;

  // POST/PUT actions (loading flags only)
  isLoadingCreateEntity: boolean;
  isLoadingUpdateEntity: boolean;

  // UI State
  selectedFoo: string | null;
  uiPagination: UiPagination;
}
````

---

## File: requests.ts (thunks with endpoint constants and condition guards)

- Import: `createAsyncThunk` from `@reduxjs/toolkit`, `axios` from `axios`, and `service, { HttpMethod }` from `@/services/http`.
- Import `RootState` from `@/store/slices` and types from `./interface`.
- Put endpoint constants at the top, e.g.:

```ts
const GET_ENTITY_A_ENDPOINT = '/service/api/v1/<slice-name-kebab>/entity-a';
const GET_ENTITY_B_ENDPOINT = '/service/api/v1/<slice-name-kebab>/entity-b';
const CREATE_ENTITY_ENDPOINT = '/service/api/v1/<slice-name-kebab>/create';
```

- For each thunk:
  - Create a cancel token and hook `thunkAPI.signal` to cancel.
  - Call `service({ method: HttpMethod.GET, url: CONST, params, cancelToken })`.
  - Return `resp.data` on success.
  - On error, use `thunkAPI.rejectWithValue(error.response?.data?.message ?? error.response?.data?.error ?? error.message)`.
  - Add a `condition` that reads the appropriate `isLoading*` flag from `(getState() as RootState).<sliceNameCamel>` and returns `!flag`.

Example GET thunk (customize names/params):

```ts
import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

import service, { HttpMethod } from '@/services/http';

import type { RootState } from '@/store/slices';
import type {
  Fetch<EntityA>Params,
  <EntityA>Response,
} from './interface';

const GET_ENTITY_A_ENDPOINT = '/service/api/v1/<slice-name-kebab>/entity-a';
const GET_ENTITY_B_ENDPOINT = '/service/api/v1/<slice-name-kebab>/entity-b';

export const fetch<EntityA> = createAsyncThunk<
  <EntityA>Response,
  Fetch<EntityA>Params,
  { state: RootState }
>(
  GET_ENTITY_A_ENDPOINT,
  async (payload: Fetch<EntityA>Params, thunkAPI) => {
    const source = axios.CancelToken.source();
    thunkAPI.signal.addEventListener('abort', () => {
      source.cancel();
    });

    try {
      const resp = await service({
        method: HttpMethod.GET,
        url: GET_ENTITY_A_ENDPOINT,
        params: payload,
        cancelToken: source.token,
      });
      return resp.data as <EntityA>Response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ??
            error.response?.data?.error ??
            error.message
        );
      }
      return thunkAPI.rejectWithValue(error);
    }
  },
  {
    condition: (_payload, { getState }) => {
      const state = getState();
      return !state.<sliceNameCamel>.isLoadingEntityA;
    },
  }
);
```

Example POST thunk:

```ts
export const create<Entity> = createAsyncThunk<
  Create<Entity>Response,
  Create<Entity>Payload,
  { state: RootState }
>(
  CREATE_ENTITY_ENDPOINT,
  async (payload: Create<Entity>Payload, thunkAPI) => {
    const source = axios.CancelToken.source();
    thunkAPI.signal.addEventListener('abort', () => {
      source.cancel();
    });

    try {
      const resp = await service({
        method: HttpMethod.POST,
        url: CREATE_ENTITY_ENDPOINT,
        data: payload,
        cancelToken: source.token,
      });
      return resp.data as Create<Entity>Response;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        return thunkAPI.rejectWithValue(
          error.response?.data?.message ??
            error.response?.data?.error ??
            error.message
        );
      }
      return thunkAPI.rejectWithValue(error);
    }
  },
  {
    condition: (_payload, { getState }) => {
      const state = getState();
      return !state.<sliceNameCamel>.isLoadingCreateEntity;
    },
  }
);
```

---

## File: extra-reducers.ts (builder handlers only; no transformers)

- Import `ActionReducerMapBuilder` and `PayloadAction` from `@reduxjs/toolkit`.
- Import your thunks from `./requests` and state/response types from `./interface`.
- For GET thunks, add three handlers:
  - pending: set `isLoading* = true`, `error* = null`
  - fulfilled: set loading false, error null, assign `state.<data> = action.payload`
  - rejected: set loading false, error = action.payload as string
- For POST/PUT thunks, add two handlers:
  - pending: set `isLoading* = true`
  - fulfilled/rejected: set loading false

Example GET handler function (repeat per thunk):

```ts
import type { ActionReducerMapBuilder, PayloadAction } from '@reduxjs/toolkit';

import type {
  <SliceNamePascal>State,
  <EntityA>Response,
} from './interface';
import {
  fetch<EntityA>,
  fetch<EntityB>,
  create<Entity>,
} from './requests';

export function handleFetch<EntityA>(
  builder: ActionReducerMapBuilder<<SliceNamePascal>State>
) {
  builder
    .addCase(fetch<EntityA>.pending, (state: <SliceNamePascal>State) => {
      state.isLoadingEntityA = true;
      state.errorEntityA = null;
    })
    .addCase(
      fetch<EntityA>.fulfilled,
      (state: <SliceNamePascal>State, action: PayloadAction<<EntityA>Response>) => {
        state.isLoadingEntityA = false;
        state.entityA = action.payload;
        state.errorEntityA = null;
      }
    )
    .addCase(
      fetch<EntityA>.rejected,
      (state: <SliceNamePascal>State, action: PayloadAction<unknown>) => {
        state.isLoadingEntityA = false;
        state.errorEntityA = action.payload as string;
      }
    );
}
```

Example POST/PUT handler (loading-only):

```ts
export function handleCreate<Entity>(
  builder: ActionReducerMapBuilder<<SliceNamePascal>State>
) {
  builder
    .addCase(create<Entity>.pending, (state: <SliceNamePascal>State) => {
      state.isLoadingCreateEntity = true;
    })
    .addCase(create<Entity>.fulfilled, (state: <SliceNamePascal>State) => {
      state.isLoadingCreateEntity = false;
    })
    .addCase(create<Entity>.rejected, (state: <SliceNamePascal>State) => {
      state.isLoadingCreateEntity = false;
    });
}
```

---

## File: index.ts (slice, initialState, actions, exports)

- Import `createSlice`, `ActionReducerMapBuilder`, and `PayloadAction` from `@reduxjs/toolkit`.
- Import handler functions from `./extra-reducers`.
- Import types from `./interface` and thunks from `./requests`.
- Define `initialState: <SliceNamePascal>State` with:
  - For GET data buckets: `null` (or empty arrays), loading flags false, error fields null
  - For POST/PUT actions: only loading flags false
  - sensible defaults for selections
  - any `updateSelected*` reducers you need
  - Order and group the initialState fields by API with blank lines between groups for readability.

Example grouped initialState:

```ts
import {
  createSlice,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from '@reduxjs/toolkit';

import type { <SliceNamePascal>State } from './interface';
import {
  handleFetch<EntityA>,
  handleFetch<EntityB>,
  handleCreate<Entity>,
} from './extra-reducers';

const initialState: <SliceNamePascal>State = {
  // GET /<slice-name-kebab>/entity-a
  entityA: null,
  isLoadingEntityA: false,
  errorEntityA: null,

  // GET /<slice-name-kebab>/entity-b
  entityB: null,
  isLoadingEntityB: false,
  errorEntityB: null,

  // POST/PUT loading only
  isLoadingCreateEntity: false,
  isLoadingUpdateEntity: false,

  // UI State
  selectedFoo: null,
  uiPagination: { currentPage: 1, limit: 12 },
};

const <SliceNameCamel>Slice = createSlice({
  name: '<sliceNameCamel>',
  initialState,
  reducers: {
    setSelectedFoo: (state, action: PayloadAction<string | null>) => {
      state.selectedFoo = action.payload;
    },
    setUiPagination: (
      state,
      action: PayloadAction<{ currentPage?: number; limit?: number }>
    ) => {
      if (action.payload.currentPage !== undefined) {
        state.uiPagination.currentPage = action.payload.currentPage;
      }
      if (action.payload.limit !== undefined) {
        state.uiPagination.limit = action.payload.limit;
      }
    },
    resetPagination: state => {
      state.uiPagination = { currentPage: 1, limit: 12 };
    },
    clear<EntityA>Error: state => {
      state.errorEntityA = null;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<<SliceNamePascal>State>) => {
    handleFetch<EntityA>(builder);
    handleFetch<EntityB>(builder);
    handleCreate<Entity>(builder);
  },
});

// Export actions
export const {
  setSelectedFoo,
  setUiPagination,
  resetPagination,
  clear<EntityA>Error,
} = <SliceNameCamel>Slice.actions;

// Export thunks
export {
  fetch<EntityA>,
  fetch<EntityB>,
  create<Entity>,
} from './requests';

// Export types
export type { <SliceNamePascal>State } from './interface';

// Export reducer as default
export default <SliceNameCamel>Slice.reducer;
```

---

## File: src/store/slices/index.ts (wire the reducer)

After creating the slice, add it to the root reducer in `src/store/slices/index.ts`:

```ts
import { combineReducers } from '@reduxjs/toolkit';

import applicationContextReducer from './application-context';
import insightsReducer from './insights';
import partnerLocatorReducer from './partner-locator';
import trackingReducer from './tracking';
import userAuthReducer from './user-auth';
import <sliceNameCamel>Reducer from './<slice-name-kebab>'; // Add this import

const rootReducer = combineReducers({
  applicationContext: applicationContextReducer,
  insights: insightsReducer,
  partnerLocator: partnerLocatorReducer,
  tracking: trackingReducer,
  userAuth: userAuthReducer,
  <sliceNameCamel>: <sliceNameCamel>Reducer, // Add this line
});

export default rootReducer;
export type RootState = ReturnType<typeof rootReducer>;
```

---

## Checklist (must-haves)

- [ ] Directory: `src/store/slices/<slice-name-kebab>/`
- [ ] Files: `interface.ts`, `requests.ts`, `extra-reducers.ts`, `selectors.ts`, `index.ts`
- [ ] Endpoint constants at top of `requests.ts` in UPPER_SNAKE_CASE
- [ ] Each thunk uses axios CancelToken and `condition` guard
- [ ] For GET thunks: Pending/Fulfilled/Rejected handlers set `isLoading*`, `error*`, and data
- [ ] For POST/PUT thunks: only toggle `isLoading*`
- [ ] State groups organized by API with blank lines between groups
- [ ] Error fields use `error<Entity>: string | null` pattern (not `is<Entity>Error: boolean`)
- [ ] `selectors.ts` has base selector and component-specific selectors using `createSelector`
- [ ] `index.ts` exports: actions, reducer (default), thunks, selectors, and types
- [ ] Reducer wired in `src/store/slices/index.ts`

````

---

## Example: Minimal endpoint constants block

```ts
// requests.ts
const GET_LIST_ENDPOINT = '/service/api/v1/<slice-name-kebab>/list';
const GET_DETAIL_ENDPOINT = '/service/api/v1/<slice-name-kebab>/detail';
const CREATE_ITEM_ENDPOINT = '/service/api/v1/<slice-name-kebab>/create';
const UPDATE_ITEM_ENDPOINT = '/service/api/v1/<slice-name-kebab>/update';
````

---

## File: selectors.ts (memoized selectors with createSelector)

Create a `selectors.ts` file to define memoized selectors for your slice. This keeps component `useAppSelector` calls small and focused.

### Why use `createSelector`?

- **Memoization**: Derived state won't recompute when unrelated parts of the store update
- **Focused selectors**: Components only subscribe to the data they need
- **Improved readability**: Selector names describe what data is being accessed
- **Better testability**: Selectors can be unit tested independently

### Rules:

1. **Base selector first**: Always create a base selector that returns the slice state
2. **Component-specific selectors**: Create selectors for each component/hook that needs slice data
3. **Only select what's needed**: Don't return the entire state if only a few fields are used
4. **Export selectors**: Export all selectors from the slice's `index.ts`
5. **Type exports**: Export return types for complex selectors

### Example selectors.ts:

```ts
import { createSelector } from '@reduxjs/toolkit';

import type { RootState } from '@/store';
import type { <SliceNamePascal>State } from './interface';

// Base selector - returns the entire slice state
const select<SliceNamePascal>State = (state: RootState) => state.<sliceNameCamel>;

// Component-specific selector - only returns what the component needs
const select<ComponentA>State = createSelector(
  [select<SliceNamePascal>State],
  (state: <SliceNamePascal>State) => ({
    entityA: state.entityA,
    isLoadingEntityA: state.isLoadingEntityA,
  })
);

// Another component-specific selector
const select<ComponentB>State = createSelector(
  [select<SliceNamePascal>State],
  (state: <SliceNamePascal>State) => ({
    entityB: state.entityB,
    selectedFoo: state.selectedFoo,
    uiPagination: state.uiPagination,
  })
);

// Hook-specific selector with more fields
const select<HookName>State = createSelector(
  [select<SliceNamePascal>State],
  ({
    entityA,
    entityB,
    isLoadingEntityA,
    isLoadingEntityB,
    selectedFoo,
  }: <SliceNamePascal>State) => ({
    entityA,
    entityB,
    isLoadingEntityA,
    isLoadingEntityB,
    selectedFoo,
  })
);

export {
  select<SliceNamePascal>State,
  select<ComponentA>State,
  select<ComponentB>State,
  select<HookName>State,
};

// Export types for complex selectors
export type <HookName>State = ReturnType<typeof select<HookName>State>;
```

### Usage in components:

```tsx
import { select<ComponentA>State } from '@/store/slices/<slice-name-kebab>';

function ComponentA() {
  // ✅ Only subscribes to entityA and isLoadingEntityA
  const { entityA, isLoadingEntityA } = useAppSelector(select<ComponentA>State);

  // ...
}
```

### Update index.ts to export selectors:

```ts
// Export selectors
export {
  select<SliceNamePascal>State,
  select<ComponentA>State,
  select<ComponentB>State,
  select<HookName>State,
} from './selectors';
export type { <HookName>State } from './selectors';
```

---

## Quick Reference: File Structure

```
src/store/slices/<slice-name-kebab>/
├── interface.ts      # Types: Request params, API responses, state shape
├── requests.ts       # Async thunks with endpoint constants
├── extra-reducers.ts # Builder handlers for each thunk
├── selectors.ts      # Memoized selectors with createSelector
└── index.ts          # Slice definition, initialState, actions, exports
```

---

## Adding a New API to an Existing Slice

When adding a new API endpoint to an existing slice, follow these steps:

1. **interface.ts**: Add request/response interfaces and update state interface with new fields
2. **requests.ts**: Add endpoint constant and create new thunk
3. **extra-reducers.ts**: Add handler function for the new thunk
4. **index.ts**:
   - Add new state fields to `initialState`
   - Import and call the new handler in `extraReducers`
   - Export the new thunk
   - Add any new action creators if needed
