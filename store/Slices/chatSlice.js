import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getFirestore,
  collection,
  onSnapshot
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  onValue,
  push,
  set
} from 'firebase/database';

// 1️⃣ Subscribe to Firestore to get all chatrooms from friends
export const subscribeToChatRooms = createAsyncThunk(
  'chat/subscribeToChatRooms',
  async ({ currentUserUid }, { dispatch }) => {
    const firestore = getFirestore();

    // 🔁 Subscribe to user's friends list
    onSnapshot(collection(firestore, `users/${currentUserUid}/friends`), snapshot => {
      snapshot.forEach(friendDoc => {
        const friendId = friendDoc.id;
        const data = friendDoc.data();
        const chatId = data.chatId;

        if (chatId) {
          dispatch(addChatRoom({ friendId, chatId }));
          dispatch(subscribeToMessages(chatId));
        }
      });
    });
  }
);

// 2️⃣ Subscribe to messages in a Realtime DB chatroom
export const subscribeToMessages = createAsyncThunk(
  'chat/subscribeToMessages',
  async (chatId, { dispatch }) => {
    const rtdb = getDatabase();

    // 🔁 Subscribe to chat messages
    onValue(ref(rtdb, `chats/${chatId}/messages`), snapshot => {
      const messages = snapshot.val() || {};

      const parsedMessages = Object.entries(messages).map(([key, value]) => ({
        id: key,
        ...value
      }));

      // Sort by timestamp (optional)
      parsedMessages.sort((a, b) => a.timestamp - b.timestamp);

      dispatch(updateChatMessages({ chatId, messages: parsedMessages }));
    });
  }
);

// 3️⃣ Send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, text, senderId }) => {
    const rtdb = getDatabase();
    const msgRef = push(ref(rtdb, `chats/${chatId}/messages`));

    await set(msgRef, {
      text,
      senderId,
      timestamp: Date.now()
    });
  }
);

// 🧠 State
const initialState = {
  chatRooms: {},  // { [friendId]: chatId }
  messages: {},   // { [chatId]: [msg1, msg2, ...] }
  loading: false,
  error: null
};

// 💬 Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addChatRoom: (state, action) => {
      const { friendId, chatId } = action.payload;
      state.chatRooms[friendId] = chatId;
    },
    updateChatMessages: (state, action) => {
      const { chatId, messages } = action.payload;
      state.messages[chatId] = messages;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

// ✅ Exports
export const { addChatRoom, updateChatMessages } = chatSlice.actions;
export default chatSlice.reducer;