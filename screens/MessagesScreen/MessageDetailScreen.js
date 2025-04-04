import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../store/Slices/chatSlice";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";

const MessageDetailScreen = ({ route }) => {
  const { chatRoomId } = route.params;
  const dispatch = useDispatch();
  const flatListRef = useRef(null);

  const currentUserUid = getAuth().currentUser?.uid;
  const messages = useSelector((state) => state.chat.messages[chatRoomId]) || [];

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      dispatch(sendMessage({
        chatId: chatRoomId,
        text: newMessage,
        senderId: currentUserUid
      }));
      setNewMessage("");
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUserUid;
    return (
      <View style={[styles.messageContainer, isMe ? styles.messageRight : styles.messageLeft]}>
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: null })}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const formatTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f1f1"
  },
  chatContent: {
    padding: 10,
    paddingBottom: 60
  },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 5
  },
  messageLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#e0e0e0",
    borderBottomLeftRadius: 0
  },
  messageRight: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 0
  },
  messageText: {
    color: "#fff",
    fontSize: 16
  },
  timestamp: {
    color: "#ccc",
    fontSize: 10,
    textAlign: "right",
    marginTop: 4
  },
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center"
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 20,
    marginRight: 8
  },
  sendButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 20
  }
});

export default MessageDetailScreen;