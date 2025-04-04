import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getFirestore,
  getDocs,
  collection,
  doc,
  writeBatch
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set
} from 'firebase/database';
import uuid from 'react-native-uuid';

// 🔁 Get all existing friends
export const getFriends = createAsyncThunk(
  'users/getFriends',
  async (currentUserUid) => {
    const db = getFirestore();
    const snapshot = await getDocs(collection(db, `users/${currentUserUid}/friends`));
    const friends = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return friends;
  }
);

// 🔍 Search users excluding friends
export const searchUsers = createAsyncThunk(
    'users/searchUsers',
    async ({ query, currentUserUid }) => {
      const db = getFirestore();
      const searchText = query.toLowerCase();
  
      // 🔁 Get all users
      const usersSnapshot = await getDocs(collection(db, 'users'));
  
      // 🔁 Get current user's friends
      const friendsSnapshot = await getDocs(collection(db, `users/${currentUserUid}/friends`));
      const friendIds = friendsSnapshot.docs.map(doc => doc.id);
  
      const results = [];
  
      usersSnapshot.forEach(docSnap => {
        const data = docSnap.data();
        const uid = docSnap.id;
  
        const isFriend = friendIds.includes(uid);
        const isSelf = uid === currentUserUid;
  
        const matchesQuery = data.displayName?.toLowerCase().includes(searchText)
          || data.firstName?.toLowerCase().includes(searchText)
          || data.lastName?.toLowerCase().includes(searchText)
          || data.email?.toLowerCase().includes(searchText);
  
        // ✅ Exclude self and existing friends
        if (!isSelf && !isFriend && matchesQuery) {
          results.push({ id: uid, ...data });
        }
      });
  
      return results;
    }
  );

// ➕ Add a friend and create chat
export const addFriend = createAsyncThunk(
    'users/addFriend',
    async ({ currentUser, selectedUser }) => {
      const firestore = getFirestore();
      const rtdb = getDatabase();
      const chatId = uuid.v4();
  
      const batch = writeBatch(firestore);
  
      // ✅ Normalize names
      const currentName = currentUser.displayName || `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
      const selectedName = selectedUser.displayName || `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim();
  
      const currentPhoto = currentUser.photoURL || '';
      const selectedPhoto = selectedUser.photoURL || '';
  
      // ✅ Add each other to Firestore
      batch.set(doc(firestore, `users/${currentUser.uid}/friends/${selectedUser.id}`), {
        displayName: selectedName,
        email: selectedUser.email,
        photoURL: selectedPhoto,
        chatId
      });
  
      batch.set(doc(firestore, `users/${selectedUser.id}/friends/${currentUser.uid}`), {
        displayName: currentName,
        email: currentUser.email,
        photoURL: currentPhoto,
        chatId
      });
  
      // ✅ Also create chat under friends/.../chats/chatId
      batch.set(doc(firestore, `users/${currentUser.uid}/friends/${selectedUser.id}/chats/${chatId}`), {
        createdAt: Date.now()
      });
  
      batch.set(doc(firestore, `users/${selectedUser.id}/friends/${currentUser.uid}/chats/${chatId}`), {
        createdAt: Date.now()
      });
  
      // ✅ Realtime DB chat
      await set(ref(rtdb, `chats/${chatId}`), {
        messages: {
          [Date.now()]: {
            text: 'hi',
            senderId: currentUser.uid,
            timestamp: Date.now()
          }
        }
      });
  
      await batch.commit();
      return { selectedUserId: selectedUser.id };
    }
  );

// 🧠 State
const initialState = {
  friends: [],
  searchResults: [],
  loading: false,
  error: null,
  addedFriendId: null
};

// 🎯 Slice
const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearAddedFriend: (state) => {
      state.addedFriendId = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getFriends.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.friends = action.payload;
      })
      .addCase(getFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(addFriend.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFriend.fulfilled, (state, action) => {
        state.loading = false;
        state.addedFriendId = action.payload.selectedUserId;
      })
      .addCase(addFriend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { clearAddedFriend, clearSearchResults } = usersSlice.actions;
export default usersSlice.reducer;