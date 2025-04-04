import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { doc, writeBatch, collection, getDocs, getDoc } from "firebase/firestore";
import { db } from "../../firebaseinit";

// Async Thunk to Retrieve User Data
export const fetchUserById = createAsyncThunk(
    "user/fetchUserById",
    async (userId, { rejectWithValue }) => {
      try {
        const userRef = doc(db, `users/${userId}`);
        const userDoc = await getDoc(userRef);
        if (!userDoc.exists()) {
          throw new Error("User not found");
        }
        return { userId, userData: userDoc.data() };
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );
  
  const userSlice = createSlice({
    name: "user",
    initialState: {
      userData: null,
      loading: false,
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(fetchUserById.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchUserById.fulfilled, (state, action) => {
          state.loading = false;
          state.userData = action.payload.userData;
        })
        .addCase(fetchUserById.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

const userReducer = userSlice.reducer;
export default userReducer;