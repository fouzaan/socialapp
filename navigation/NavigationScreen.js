import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Ionicons from "react-native-vector-icons/Ionicons";
import ShopScreen from "../screens/ShopScreen/ShopScreen";
import SellScreen from "../screens/SellScreen/SellScreen";
import CartScreen from "../screens/CartScreen/CartScreen";
import ProfileScreen from "../screens/ProfileScreen/ProfileScreen";
import MessagesScreen from "../screens/MessagesScreen/MessagesScreen";
import MessageDetailScreen from "../screens/MessagesScreen/MessageDetailScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";
import LoginScreen from "../screens/AuthScreens.js/LoginScreen";
import SignupScreen from "../screens/AuthScreens.js/SignupScreen";
import UploadProductScreen from "../screens/SellScreen/UploadProductScreen";
import ProductDetailsScreen from "../screens/ShopScreen/ProductDetailsScreen";
import ProductDetailsScreenCompenent from "../screens/Components/ProductDetailScreenCompenent";
import FriendsManascreens from "../screens/MessagesScreen/FriendsManascreens";


const ListScreen = () => (
  <View style={styles.screen}>
    <Text>List Screen</Text>
  </View>
);

const ShopStack = createNativeStackNavigator();

function ShopStackNavigator() {
  return (
    <ShopStack.Navigator>
      <ShopStack.Screen name="ShopMain" component={ShopScreen} options={{ headerShown: false }} />
      <ShopStack.Screen name="ProductDetails" component={ProductDetailsScreenCompenent} options={{ title: "Product Details" }} />
    </ShopStack.Navigator>
  );
}

const SellScreenStack = createNativeStackNavigator();

function SellStackNavigator() {
    return (
        <SellScreenStack.Navigator>
            <SellScreenStack.Screen name="SellMain" component={SellScreen} options={{ headerShown: false }} />
            <SellScreenStack.Screen name="CreateProduct" component={UploadProductScreen} options={{ title: "Upload Product" }} />
        </SellScreenStack.Navigator>
    );
}

const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="ShopTab"
        component={ShopStackNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? <Ionicons name="cart" size={size} color={color} /> : <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Sell"
        component={SellStackNavigator}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? <Ionicons name="cash" size={size} color={color} /> : <Ionicons name="cash-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? <Ionicons name="basket" size={size} color={color} /> : <Ionicons name="basket-outline" size={size} color={color} />,
        }}
      />
      
    </Tab.Navigator>
  );
}

const Drawer = createDrawerNavigator();

function AuthStack() {
  const AuthStack = createNativeStackNavigator();
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
    </AuthStack.Navigator>
  );
}


const friendstabbar = createBottomTabNavigator();

function FriendsTabNavigator() {
  return (
    <friendstabbar.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <friendstabbar.Screen
        name="ChatScreen"
        component={MessagesScreenStack}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? <Ionicons name="cart" size={size} color={color} /> : <Ionicons name="cart-outline" size={size} color={color} />,
        }}
      />
      <friendstabbar.Screen
        name="Managefrinedstack"
        component={ManageFrinedsScreenStack}
        options={{
          tabBarIcon: ({ focused, color, size }) =>
            focused ? <Ionicons name="cash" size={size} color={color} /> : <Ionicons name="cash-outline" size={size} color={color} />,
        }}
      />
      </friendstabbar.Navigator>
  );
}


function MessagesScreenStack() {
  const MessagesStack = createNativeStackNavigator();
  return (
    <MessagesStack.Navigator>
      <MessagesStack.Screen name="MessagesMain" component={MessagesScreen} options={{ headerShown: false }} />
      <MessagesStack.Screen name="ChatScreen" component={MessageDetailScreen} options={{ title: "Chat" }} />
    </MessagesStack.Navigator>
  );
} 

function ManageFrinedsScreenStack() {
  const ManageFrinedsStack = createNativeStackNavigator();
  return (
    <ManageFrinedsStack.Navigator>
      <ManageFrinedsStack.Screen name="ManageFrinedsMain" component={FriendsManascreens} options={{ headerShown: false }} />
    </ManageFrinedsStack.Navigator>
  );
}

export default function App() {
  const user = useSelector((state) => state.auth.user);
console.log("User state in NavigationScreen:", user);
  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator
          screenOptions={({ navigation, route }) => ({
            headerLeft: () => (
              <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ paddingHorizontal: 15 }}>
                <Ionicons name="menu" size={25} color="black" />
              </TouchableOpacity>
            ),
            headerTitle: route.name || "App",
          })}
        >
          <Drawer.Screen name="Home" component={TabNavigator} options={{ title: "Home" }} />
          <Drawer.Screen name="Messages" component={FriendsTabNavigator} options={{ title: "Messages" }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: "Profile" }} />
        </Drawer.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
