import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { storage, db, realtimeDb } from "../../firebaseinit";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, writeBatch, collection, getDocs } from "firebase/firestore";
import { ref as dbRef, set } from "firebase/database";
import uuid from "react-native-uuid";

// **1️⃣ Create Product & Upload Images**
export const createProduct = createAsyncThunk("products/createProduct", async ({ productData, images }, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const userId = state.auth.user?.userId; // Get the stored userId from authSlice

    if (!userId) {
      throw new Error("User not authenticated.");
    }

    const productId = uuid.v4();
    const imageURLs = [];

    // Upload images to Firebase Storage & Get URLs
    for (let i = 0; i < images.length; i++) {
      const imageRef = ref(storage, `products/${productId}/image_${i}`);
      const response = await fetch(images[i]);
      const blob = await response.blob();
      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);
      imageURLs.push(downloadURL);
    }

    // Update product data with image URLs and timestamps
    const updatedProductData = {
      ...productData,
      imageIDs: imageURLs,
      productID: productId,
      CreatedBYID: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Batch write to Firestore
    const batch = writeBatch(db);

    // **1️⃣ Store only product ID inside the user's collection**
    batch.set(doc(db, `users/${userId}/Products/${productId}`), { productID: productId });

    // **2️⃣ Store full product details inside "products" collection**
    batch.set(doc(db, `products/${productId}`), updatedProductData);

    await batch.commit();

    // **3️⃣ Save quantity in Realtime Database**
    await set(dbRef(realtimeDb, `products/${productId}/quantity`), productData.quantity);

    return { productId, imageURLs };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// **2️⃣ Fetch Random Products**
export const fetchRandomProducts = createAsyncThunk("products/fetchRandomProducts", async (_, thunkAPI) => {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const productsArray = [];

    querySnapshot.forEach((doc) => {
      productsArray.push(doc.data());
    });

    // Shuffle & return up to 10 products
    const shuffled = productsArray.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 10);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// **3️⃣ Fetch Products Created by the User**
export const fetchUserProducts = createAsyncThunk("products/fetchUserProducts", async (_, thunkAPI) => {
  try {
    const state = thunkAPI.getState();
    const userId = state.auth.user?.userId; // Get the stored userId from authSlice

    if (!userId) {
      throw new Error("User not authenticated.");
    }

    // Query the products collection specific to the user
    const querySnapshot = await getDocs(collection(db, `users/${userId}/Products`));
    const userProducts = [];

    querySnapshot.forEach((doc) => {
      userProducts.push(doc.data());
    });

    return userProducts;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// **4️⃣ Product Slice**
const productSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    userProducts: [], // Store the user's products here
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Random Products
      .addCase(fetchRandomProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRandomProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchRandomProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch User's Products
      .addCase(fetchUserProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.userProducts = action.payload;
      })
      .addCase(fetchUserProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;
