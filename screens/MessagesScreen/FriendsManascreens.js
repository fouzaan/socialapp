import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { getFriends, searchUsers, addFriend } from '../../store/Slices/managefriendSlice';
//import { getFriends, searchUsers, addFriend } from '../features/users/usersSlice';

const FriendsScreen = () => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const { friends, searchResults, loading } = useSelector(state => state.friends);
  const userid = useSelector((state) => state.auth.user?.uid); 
  const currentUser = useSelector((state) => state.auth.user);
  useEffect(() => {
    dispatch(getFriends(userid));
  }, [dispatch,friends]);

  useEffect(() => {
    if (query.length > 1) {
      dispatch(searchUsers({ query, currentUserId: userid }));
    }
  }, [query]);

  const handleAdd = (user) => {

    dispatch(addFriend({ currentUser, selectedUser: user }));
  };

  const renderFriend = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.email}>{item.email}</Text>
    </View>
  );

  const renderSearchResult = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.email}>{item.email}</Text>
      </View>
      <TouchableOpacity
  style={styles.addButton}
  onPress={() => {
    console.log('Add button clicked:', item);
    dispatch(addFriend({ currentUser, selectedUser: item }));
  }}
>
        <Text style={styles.addText}>Add Friend</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Your Friends</Text>

      <FlatList
        data={friends}
        keyExtractor={item => item.id}
        renderItem={renderFriend}
        ListEmptyComponent={<Text style={styles.empty}>You have no friends yet.</Text>}
      />

      <Text style={styles.subheading}>Search & Add</Text>

      <TextInput
        style={styles.input}
        placeholder="Search by name or email"
        value={query}
        onChangeText={setQuery}
      />

      {query.length > 1 && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id}
          renderItem={renderSearchResult}
        />
      )}
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 16, backgroundColor: '#FAFAFA'
  },
  heading: {
    fontSize: 22, fontWeight: 'bold', marginBottom: 8, color: '#222'
  },
  subheading: {
    fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 8, color: '#555'
  },
  input: {
    borderWidth: 1, borderColor: '#DDD', borderRadius: 12,
    padding: 10, marginBottom: 16, fontSize: 16, backgroundColor: '#FFF'
  },
  card: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#FFF', borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3, elevation: 2
  },
  name: { fontSize: 16, fontWeight: '500' },
  email: { fontSize: 14, color: '#888' },
  addButton: {
    backgroundColor: '#007AFF', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8
  },
  addText: { color: '#FFF', fontWeight: '600' },
  empty: { textAlign: 'center', color: '#888', marginTop: 12 }
});