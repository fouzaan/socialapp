import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./store/Slices/authSlice";
import productsReducer from "./store/Slices/UploadProductScreen";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
    },
})