import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import taskReducer from "./slices/taskSlice";
import routeReducer from "./slices/routeSlice";
import themeReducer from "./slices/themeSlice";
import languageReducer from "./slices/languageSlice";
import syncReducer from "./slices/syncSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    route: routeReducer,
    theme: themeReducer,
    language: languageReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
