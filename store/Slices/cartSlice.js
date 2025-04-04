import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, writeBatch, collection, getDocs, getDoc, onSnapshot, deleteDoc } from "firebase/firestore";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import { db } from "../../firebaseinit";

const storage = getStorage();

// Async Thunk to Add Item to Cart
export const addItemToCart = createAsyncThunk(
  "cart/addItem",
  async ({ userId, productId, selectedQuantity }, { rejectWithValue }) => {
    try {
      const batch = writeBatch(db);
      const cartRef = doc(db, `users/${userId}/cart/${productId}`);
      batch.set(cartRef, { productId, quantity: selectedQuantity });
      await batch.commit();
      return { productId, quantity: selectedQuantity };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateCartQuantity = createAsyncThunk(
    "cart/updateQuantity",
    async ({ userId, productId, quantity }, { rejectWithValue }) => {
      try {
        const cartRef = doc(db, `users/${userId}/cart/${productId}`);
        await updateDoc(cartRef, { quantity });
        return { productId, quantity };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  

// Function to listen for real-time cart updates with product images
export const subscribeToCart = (userId, dispatch) => {
  const cartRef = collection(db, `users/${userId}/cart`);
  return onSnapshot(cartRef, async (snapshot) => {
    const cartItems = [];
    for (const docSnap of snapshot.docs) {
      const cartItem = docSnap.data();
      const productRef = doc(db, `products/${cartItem.productId}`);
      const productSnap = await getDoc(productRef);
      
      if (productSnap.exists()) {
        let productData = productSnap.data();
        console.log("Product Data:", productData);
        const imageRef = ref(storage, `products/${cartItem.productId}`);
        try {
          const imageUrl = await getDownloadURL(imageRef);
          productData.image = imageUrl;
        } catch (error) {
          productData.image = null;
        }
        cartItems.push({
          ...cartItem,
          productData,
        });
      }
    }
    dispatch(updateCart(cartItems));
  });
};

// Async Thunk to Remove Item from Cart
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItem",
  async ({ userId, productId }, { rejectWithValue }) => {
    try {
      const cartRef = doc(db, `users/${userId}/cart/${productId}`);
      await deleteDoc(cartRef);
      return productId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartItems: [],
    loading: false,
    error: null,
  },
  reducers: {
    updateCart: (state, action) => {
      state.cartItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems.push(action.payload);
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = state.cartItems.filter(item => item.productId !== action.payload);
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateCart } = cartSlice.actions;
const cartReducer = cartSlice.reducer;
export default cartReducer;