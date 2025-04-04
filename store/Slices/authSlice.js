import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, signInWithCustomToken } from "firebase/auth";
import { auth, db } from "../../firebaseinit";
import { doc, writeBatch } from "firebase/firestore";
import uuid from "react-native-uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Function to sanitize Firebase user data
const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || "",
    emailVerified: user.emailVerified,
    phoneNumber: user.phoneNumber || "",
    photoURL: user.photoURL || "",
  };
};

// ✅ Login User
export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password }, thunkAPI) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken(true); // ✅ Get Firebase ID token

    // ✅ Store user details + token in AsyncStorage
    await AsyncStorage.setItem("user", JSON.stringify({ ...sanitizeUser(user), token }));

    return sanitizeUser(user);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ firstName, lastName, email, password, address, phoneNumber }, thunkAPI) => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userId = user.uid; // Use Firebase-generated UID

      // Firestore batch operation
      const batch = writeBatch(db);
      const userDocRef = doc(db, "users", userId); // Use UID as the document ID

      batch.set(userDocRef, {
        userId, // Store the same UID in Firestore
        firstName,
        lastName,
        email,
        address,
        phoneNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      await batch.commit();
      return sanitizeUser(user); // Ensure `sanitizeUser` correctly formats the response
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// ✅ Logout User
export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, thunkAPI) => {
  try {
    await signOut(auth);
    return null;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

// ✅ Listen for Firebase Auth state changes
export const checkAuthState = () => async (dispatch) => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      dispatch(setUser(sanitizeUser(user)));
      console.log("✅ Firebase authenticated user:", sanitizeUser(user));
    } else {
      console.log("⚠️ Firebase returned null user, attempting to restore session...");

      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const token = parsedUser.token;

        if (token) {
          try {
            // ✅ Re-authenticate using stored Firebase token
            const userCredential = await signInWithCustomToken(auth, token);
            const reAuthenticatedUser = sanitizeUser(userCredential.user);
            dispatch(setUser(reAuthenticatedUser));
            console.log("✅ Session restored using Firebase token:", reAuthenticatedUser);
          } catch (error) {
            console.error("❌ Token expired or invalid. User must log in again.");
            await AsyncStorage.removeItem("user"); // Clear old session
            dispatch(setUser(null));
          }
        }
      }
    }
  });
};

// ✅ Load persisted user on app start
export const loadUser = () => async (dispatch) => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      dispatch(setUser(parsedUser));
      console.log("User loaded from storage:", parsedUser); // ✅ Debugging log
    } else {
      console.log("No user found in storage.");
    }
  } catch (error) {
    console.error("Error loading user from storage:", error);
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, status: "idle", error: null },
  reducers: {
    setUser: (state, action) => {
      console.log("🛠 Redux setUser action triggered:", action.payload);
      state.user = action.payload;
      state.status = action.payload ? "succeeded" : "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "succeeded";
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;