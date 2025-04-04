import React, { useEffect, useState } from "react";
import { 
  View, Text, Image, FlatList, StyleSheet, TouchableOpacity, Alert, 
  Modal,
  Button
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeItemFromCart, subscribeToCart, updateCartQuantity} from "../../store/Slices/cartSlice";

const CartScreen = () => {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.cartItems);
   const userid = useSelector((state) => state.auth.user?.uid);
   const [modalVisible, setModalVisible] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);
   const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToCart(userid, dispatch);
    return () => unsubscribe(); // Cleanup on unmount
  }, [dispatch]);

  const handleRemoveItem = (productId) => {
    Alert.alert("Remove Item", "Are you sure you want to remove this item?", [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", onPress: () => dispatch(removeItemFromCart({ userId: userid, productId })) },
    ]);
  };

  
  const calculateTotal = () => {
    return Array.isArray(cartItems) && cartItems.length > 0
      ? cartItems.reduce((total, item) => total + (item.productData.price * item.quantity), 0).toFixed(2)
      : "0.00";
  };
  
    const handleItemPress = (item) => {
      setSelectedItem(item);
      setQuantity(item.quantity);
    setModalVisible(true);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleUpdateQuantity = () => {
    dispatch(updateCartQuantity({ userId: userid, productId: selectedItem.productId, selectedQuantity: quantity }));
    setModalVisible(false);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.productId}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleItemPress(item)}>

          <View style={styles.cartItem}>
            <Image source={{ uri: item.productData.imageIDs[0] }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productTitle}>{item.productData.name}</Text>
              <Text style={styles.productPrice}>${item.productData.price}</Text>
              <Text style={styles.productQuantity}>Quantity: {item.quantity}</Text>
              <TouchableOpacity onPress={() => handleRemoveItem(item.productId)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
          </TouchableOpacity>
        )}
      />
      <View style={styles.footer}>
        <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedItem && (
              <>
                <Image source={{ uri: selectedItem.productData.imageIDs[0] }} style={styles.modalImage} />
                <Text style={styles.modalTitle}>{selectedItem.productData.name}</Text>
                <Text style={styles.modalPrice}>${selectedItem.productData.price}</Text>
                <View style={styles.quantityControls}>
                  <TouchableOpacity onPress={() => handleQuantityChange(quantity - 1)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{quantity}</Text>
                  <TouchableOpacity onPress={() => handleQuantityChange(quantity + 1)} style={styles.quantityButton}>
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Button title="Update Quantity" onPress={handleUpdateQuantity} />
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 15,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  productInfo: {
    marginLeft: 10,
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productPrice: {
    fontSize: 14,
    color: "#ff5733",
    marginVertical: 2,
  },
  productQuantity: {
    fontSize: 14,
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  checkoutButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  removeText: {
    color: "red",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },
  modalPrice: {
    fontSize: 16,
    color: "#007BFF",
    marginBottom: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quantityButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
});

export default CartScreen;
