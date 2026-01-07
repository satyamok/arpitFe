import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import pancardReducer from "./slices/pancardSlice";
import documentReducer from "./slices/documentSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pancard: pancardReducer,
    document: documentReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
