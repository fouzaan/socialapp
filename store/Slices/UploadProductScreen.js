import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { storage, db, realtimeDb } from "../../firebaseinit";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, writeBatch, collection, getDocs, getDoc } from "firebase/firestore";
import { ref as dbRef, set } from "firebase/database";
import uuid from "react-native-uuid";

// **1️⃣ Create Product & Upload Images**
export const createProduct = createAsyncThunk("products/createProduct", async ({ productData, images }, thunkAPI) => {
  try {
    console.log("Starting product creation...");

    const state = thunkAPI.getState();
    const userId = state.auth.user?.uid; // Get the stored userId from authSlice
    console.log("User ID:", userId);

    if (!userId) {
      console.error("User not authenticated.");
      throw new Error("User not authenticated.");
    }

    const productId = uuid.v4();
    console.log("Generated Product ID:", productId);
    const imageURLs = [];

    // Upload images to Firebase Storage & Get URLs
    for (let i = 0; i < images.length; i++) {
      try {
        console.log(`Uploading image ${i + 1}...`);
        const imageRef = ref(storage, `products/${productId}/image_${i}`);

        const response = await fetch(images[i]);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${images[i]}`);
        }

        const blob = await response.blob();
        await uploadBytes(imageRef, blob);
        const downloadURL = await getDownloadURL(imageRef);
        console.log(`Image ${i + 1} uploaded successfully:`, downloadURL);
        imageURLs.push(downloadURL);
      } catch (imageError) {
        console.error(`Error uploading image ${i + 1}:`, imageError);
        return thunkAPI.rejectWithValue(`Image upload failed: ${imageError.message}`);
      }
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

    console.log("Updated product data:", updatedProductData);

    // Batch write to Firestore
    const batch = writeBatch(db);

    // **1️⃣ Store only product ID inside the user's collection**
    batch.set(doc(db, `users/${userId}/Products/${productId}`), { productID: productId });

    // **2️⃣ Store full product details inside "products" collection**
    batch.set(doc(db, `products/${productId}`), updatedProductData);

    try {
      console.log("Committing batch to Firestore...");
      await batch.commit();
      console.log("Firestore batch commit successful.");
    } catch (batchError) {
      console.error("Firestore batch commit failed:", batchError);
      return thunkAPI.rejectWithValue(`Firestore commit failed: ${batchError.message}`);
    }

    // **3️⃣ Save quantity in Realtime Database**
    try {
      console.log("Saving quantity in Realtime Database...");
      await set(dbRef(realtimeDb, `products/${productId}/quantity`), productData.quantity);
      console.log("Quantity saved successfully.");
    } catch (realtimeDbError) {
      console.error("Realtime Database update failed:", realtimeDbError);
      return thunkAPI.rejectWithValue(`Realtime Database update failed: ${realtimeDbError.message}`);
    }

    console.log("Product creation successful.");
    return { productId, imageURLs };
  } catch (error) {
    console.error("Product creation failed:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, updatedData, images }, thunkAPI) => {
    try {
      console.log("Starting product update for:", productId);

      const state = thunkAPI.getState();
      const userId = state.auth.user?.uid; // Get user ID
      if (!userId) {
        throw new Error("User not authenticated.");
      }

      let imageURLs = updatedData.imageIDs || [];

      // Upload new images if provided
      if (images && images.length > 0) {
        imageURLs = [];
        for (let i = 0; i < images.length; i++) {
          const imageRef = ref(storage, `products/${productId}/image_${i}`);
          const response = await fetch(images[i]);
          if (!response.ok) throw new Error(`Failed to fetch image: ${images[i]}`);
          const blob = await response.blob();
          await uploadBytes(imageRef, blob);
          const downloadURL = await getDownloadURL(imageRef);
          imageURLs.push(downloadURL);
        }
      }

      const updatedProductData = {
        ...updatedData,
        imageIDs: imageURLs,
        updatedAt: new Date().toISOString(),
      };

      // Update in Firestore
      const batch = writeBatch(db);
      batch.update(doc(db, `products/${productId}`), updatedProductData);
      batch.update(doc(db, `users/${userId}/Products/${productId}`), { productID: productId });

      await batch.commit();
      console.log("Product updated successfully.");

      return { productId, updatedProductData };
    } catch (error) {
      console.error("Product update failed:", error);
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
// **2️⃣ Fetch Random Products**
export const fetchRandomProducts = createAsyncThunk("products/fetchRandomProducts", async (_, thunkAPI) => {
  try {
    console.log("Fetching random products...");
    const querySnapshot = await getDocs(collection(db, "products"));
    
    if (querySnapshot.empty) {
      console.warn("No products found in Firestore.");
    }

    const productsArray = [];
    querySnapshot.forEach((doc) => {
      console.log("Fetched product:", doc.id, doc.data());
      productsArray.push(doc.data());
    });

    // Shuffle & return up to 10 products
    const shuffled = productsArray.sort(() => 0.5 - Math.random());
    console.log("Returning products:", shuffled.slice(0, 10));
    return shuffled.slice(0, 10);
  } catch (error) {
    console.error("Fetching random products failed:", error);
    return thunkAPI.rejectWithValue(error.message);
  }
});

// Async Thunk for Detailed Database Search
export const detailedProductSearch = createAsyncThunk(
  "products/detailedProductSearch",
  async (searchQuery, { rejectWithValue }) => {
    try {
      const productsRef = collection(db, "products");
      const searchLower = searchQuery.toLowerCase();
      const q = query(productsRef, where("name", ">=", searchLower), where("name", "<=", searchLower + "\uf8ff"));
      const querySnapshot = await getDocs(q);
      
      let results = [];
      querySnapshot.forEach((doc) => {
        results.push({ productID: doc.id, ...doc.data() });
      });
      
      if (results.length === 0) {
        // Fetch random products if no search result is found
        const randomQuerySnapshot = await getDocs(productsRef);
        randomQuerySnapshot.forEach((doc) => {
          if (results.length < 5) results.push({ productID: doc.id, ...doc.data() });
        });
      }
      return results;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


// **3️⃣ Fetch Products Created by the User**
export const fetchUserProducts = createAsyncThunk("products/fetchUserProducts", async (_, thunkAPI) => {
  try {
    console.log("Fetching user products...");
    const state = thunkAPI.getState();
    const userId = state.auth.user?.uid; // Ensure consistency

    if (!userId) {
      console.error("User not authenticated.");
      throw new Error("User not authenticated.");
    }

    // Get user's product IDs
    const querySnapshot = await getDocs(collection(db, `users/${userId}/Products`));

    if (querySnapshot.empty) {
      console.warn("No user products found.");
      return [];
    }

    const userProducts = [];

    for (const docSnapshot of querySnapshot.docs) {
      const productId = docSnapshot.data().productID;
      console.log("Fetching product details for:", productId);

      const productDoc = await getDoc(doc(db, `products/${productId}`));
      if (productDoc.exists()) {
        userProducts.push(productDoc.data());
      } else {
        console.warn(`Product ${productId} does not exist.`);
      }
    }

    console.log("Fetched user products:", userProducts);
    return userProducts;
  } catch (error) {
    console.error("Fetching user products failed:", error);
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
