// src/store/index.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slice/authSlice';
import entryReducer from "./slice/entrySlice";
import balanceSheetReducer from './slice/balanceSheetSlice';
import analyticsReducer from './slice/analyticsSlice';
import projectReducer from './slice/projectSlice';
import interiorBillingSlice from "./slice/interiorBillingSlice"
import summaryReducer from './slice/fincialSlice';
import chatReducer from './slice/chatSlice';
import categoryReducer from './slice/categorySlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        entries: entryReducer,
        balanceSheet: balanceSheetReducer,
        analytics: analyticsReducer,
        projects: projectReducer,
        interiorBilling: interiorBillingSlice,
        summary: summaryReducer,
        chat: chatReducer,
        categories: categoryReducer
    },
});

export default store;
