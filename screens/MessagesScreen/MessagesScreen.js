import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";

const MessagesScreen = ({ navigation }) => {
  const [chatList, setChatList] = useState([
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      time: "2:45 PM",
      avatar: "https://via.placeholder.com/150",
    },
    {
      id: "2",
      name: "Jane Smith",
      lastMessage: "Got your order, thanks!",
      time: "1:15 PM",
      avatar: "https://via.placeholder.com/150",
    },
    {
      id: "3",
      name: "Mike Johnson",
      lastMessage: "Can you send me the details?",
      time: "Yesterday",
      avatar: "https://via.placeholder.com/150",
    },
  ]);

  const handleChatSelect = (chat) => {
    navigation.navigate("ChatScreen", { chat });
  };

  return (
    <View style={styles.screen}>
      <FlatList
        data={chatList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatCard} onPress={() => handleChatSelect(item)}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.chatDetails}>
              <Text style={styles.chatName}>{item.name}</Text>
              <Text style={styles.lastMessage} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <Text style={styles.time}>{item.time}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyMessage}>No messages yet.</Text>}
      />
    </View>
  );
};

export default MessagesScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
  },
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  time: {
    fontSize: 12,
    color: "#aaa",
  },
  emptyMessage: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
    color: "#666",
  },
});