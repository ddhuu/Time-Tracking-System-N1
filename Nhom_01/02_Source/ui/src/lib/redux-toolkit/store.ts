import userReducer from "@/lib/redux-toolkit/slices/user-slice";
import userListReducer from "@/lib/redux-toolkit/slices/list-user-slice";
import { combineReducers, configureStore } from "@reduxjs/toolkit";

/**
 * @description Create a Redux store with persisted state using Redux Toolkit and Redux Persist
 * @reference https://redux-toolkit.js.org/usage/nextjs, https://redux-toolkit.js.org/usage/usage-guide#use-with-redux-persist
 * @returns {AppStore, RootState, AppDispatch} - Redux store, RootState and AppDispatch
 *
 */

const rootReducer = combineReducers({
  userState: userReducer,
  userListState: userListReducer
});

export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    devTools: process.env.NEXT_PUBLIC_NODE_ENV !== "production",
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"]
        }
      })
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
