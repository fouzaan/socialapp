import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, updateDoc, increment, setDoc, collection, arrayUnion } from "firebase/firestore";
import { db } from "../../firebaseinit";

// Increment product view count
export const incrementProductViews = createAsyncThunk(
  "statistics/incrementProductViews",
  async (productId, { rejectWithValue }) => {
    try {
      const insightsRef = doc(db, `products/${productId}/insights`);
      await setDoc(insightsRef, { views: increment(1) }, { merge: true });
      console.log("Product viewed:", productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Increment product added-to-cart count
export const incrementProductAddedToCart = createAsyncThunk(
  "statistics/incrementProductAddedToCart",
  async (productId, { rejectWithValue }) => {
    try {
      const insightsRef = doc(db, `products/${productId}/insights`);
      await setDoc(insightsRef, { addedToCart: increment(1) }, { merge: true });
      console.log("Product added to cart:", productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add product to recently viewed list
export const addRecentlyViewedProduct = createAsyncThunk(
  "statistics/addRecentlyViewedProduct",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const recentRef = doc(db, `users/${userId}/recentlyViewed`);
      await setDoc(recentRef, { products: arrayUnion(productId) }, { merge: true });
      console.log("Product added to recently viewed:", productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const extractingStatisticsSlice = createSlice({
  name: "statistics",
  initialState: {
    viewedProducts: [],
    cartAdditions: [],
    recentlyViewed: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(incrementProductViews.pending, (state) => {
        state.loading = true;
      })
      .addCase(incrementProductViews.fulfilled, (state, action) => {
        state.loading = false;
        state.viewedProducts.push(action.payload);
      })
      .addCase(incrementProductViews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(incrementProductAddedToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(incrementProductAddedToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartAdditions.push(action.payload);
      })
      .addCase(incrementProductAddedToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addRecentlyViewedProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(addRecentlyViewedProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.recentlyViewed.push(action.payload);
      })
      .addCase(addRecentlyViewedProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

const extractingStatisticsReducer = extractingStatisticsSlice.reducer;
export default extractingStatisticsReducer;