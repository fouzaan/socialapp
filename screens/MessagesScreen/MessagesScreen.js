import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import { subscribeToChatRooms } from "../../store/Slices/chatSlice";

const ChatListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { chatRooms, messages, loading, error } = useSelector((state) => state.chat);

  const currentUserUid = getAuth().currentUser?.uid;

  useEffect(() => {
    if (currentUserUid) {
      dispatch(subscribeToChatRooms({ currentUserUid }));
    }
  }, [dispatch, currentUserUid]);

  // Convert chatRooms object { friendId: chatId } into list with latest messages
  const chatList = Object.entries(chatRooms).map(([friendId, chatId]) => {
    const msgList = messages[chatId] || [];
    const lastMsg = msgList[msgList.length - 1];

    return {
      id: friendId,
      chatRoomId: chatId,
      receiverName: lastMsg?.senderName || "Friend",
      receiverProfilePic: lastMsg?.senderPhotoURL || "https://placehold.co/100x100",
      lastMessage: lastMsg?.text || "Say hi 👋",
      timestamp: lastMsg?.timestamp || 0,
    };
  });

  // Search filter
  const filteredChats = chatList.filter(chat =>
    chat.receiverName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Messages</Text>
        <Ionicons name="chatbox-ellipses-outline" size={24} color="black" />
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search chats..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {loading && (
        <View style={styles.center}>
          <Text>Loading chats...</Text>
        </View>
      )}

      {error && (
        <View style={styles.center}>
          <Text style={{ color: "red" }}>Error: {error}</Text>
        </View>
      )}

      <FlatList
        data={filteredChats.sort((a, b) => b.timestamp - a.timestamp)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate("ChatScreen", { chatRoomId: item.chatRoomId })}
          >
            <Image source={{ uri: item.receiverProfilePic }} style={styles.profilePic} />
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>{item.receiverName}</Text>
              <Text style={styles.lastMessage}>{item.lastMessage}</Text>
            </View>
            <Text style={styles.timestamp}>{formatTimestamp(item.timestamp)}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (now - date < 86400000) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString();
  }
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 10 },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10
  },
  header: { fontSize: 22, fontWeight: "bold" },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10
  },
  chatItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd"
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10
  },
  chatInfo: { flex: 1 },
  chatName: { fontSize: 16, fontWeight: "bold" },
  lastMessage: { color: "#666", marginTop: 2 },
  timestamp: { color: "#999", fontSize: 12 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});

export default ChatListScreen;