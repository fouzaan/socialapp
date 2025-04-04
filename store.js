import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./store/Slices/authSlice";
import productsReducer from "./store/Slices/UploadProductScreen";
import userdataReducer from "./store/Slices/userSlice";
import cartReducer from "./store/Slices/cartSlice";
import insights from "./store/Slices/insightsSlice";
import chatReducer from "./store/Slices/chatSlice";
import FriendReducer from "./store/Slices/managefriendSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        products: productsReducer,
        chat: chatReducer,
        user: userdataReducer,
        cart: cartReducer,
        insights: insights,
        friends: FriendReducer,
    },
})