import React, { useState } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as Speech from "expo-speech";
import * as Audio from "expo-av";

const SearchBar = ({ placeholder = "Search here..." }) => {
  const [searchText, setSearchText] = useState("");
  const [isListening, setIsListening] = useState(false);

  const startListening = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Microphone permission is required to use voice input.");
      return;
    }

    // Simulate a voice-to-text process (replace with a real API if needed)
    setIsListening(true);
    setTimeout(() => {
      // Mock result - replace this with real speech-to-text API
      const result = "Example voice input";
      setSearchText(result);
      setIsListening(false);
      Alert.alert("Voice Input", `Recognized text: "${result}"`);
    }, 2000); // Simulate processing delay
  };

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color="#aaa" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#aaa"
        value={searchText}
        onChangeText={(text) => setSearchText(text)}
      />
      <Ionicons
        name={isListening ? "mic-off" : "mic"}
        size={20}
        color={isListening ? "red" : "#aaa"}
        style={styles.micIcon}
        onPress={startListening}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 8,
  },
  micIcon: {
    marginLeft: 10,
  },
});

export default SearchBar;