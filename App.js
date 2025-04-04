import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import NavigationScreen from './navigation/NavigationScreen';
import { Provider, useDispatch } from 'react-redux';
import { store } from './store';
import { checkAuthState, loadUser } from './store/Slices/authSlice';
import { useEffect, useState } from 'react';

const InitUser = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuthState = async () => {
      await dispatch(checkAuthState()); // ✅ Try restoring session
      setIsLoading(false);
    };

    initializeAuthState();
  }, [dispatch]);

  if (isLoading) return null; // Prevent rendering until auth state is ready

  return null;
};

export default function App() {
  return (
    <Provider store={store}>
<InitUser/>
      <NavigationScreen/>
    </Provider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
