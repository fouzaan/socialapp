import React, { useState, useEffect, use } from "react";
import { 
  View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, 
  Alert
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById } from "../../store/Slices/userSlice";
import { addItemToCart } from "../../store/Slices/cartSlice";
import { addRecentlyViewedProduct, incrementProductAddedToCart, incrementProductViews } from "../../store/Slices/insightsSlice";


const ProductDetailsScreenCompenent = ({ route }) => {
    const { product } = route.params;
    const [loadingImages, setLoadingImages] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const dispatch = useDispatch();
    
    const seller = useSelector((state) => state.user.userData);
    const sellerLoading = useSelector((state) => state.user.loading);
    const userid = useSelector((state) => state.auth.user?.uid);
  
    useEffect(() => {
      if (product.CreatedBYID) {
        dispatch(fetchUserById(product.CreatedBYID));
      }
    }, [dispatch, product.CreatedBYID]);
  
    useEffect(() => {
        if (product?.productID) {
            dispatch(incrementProductViews(product.productID));
        }
        if (userid && product?.productID) {
            dispatch(addRecentlyViewedProduct({ userId: userid, productId: product.productID }));
        }
    }, [dispatch, product?.productID, userid]);

    const isOutOfStock = product.quantity <= 0;
    const isQuantityExceeded = quantity > product.quantity;
  
    const handleAddToCart = () => {
        console.log("userid", userid);
        
        dispatch(addItemToCart({ userId: userid, productId: product.productID, selectedQuantity: quantity }))
          .unwrap() // This ensures proper promise handling
          .then(() => {
            dispatch(incrementProductAddedToCart(product.productID)); 
            Alert.alert("Success", "Item added to cart successfully");
          })
          .catch((error) => {
            console.error("Add to cart failed:", error);
            Alert.alert("Error", "Failed to add item to cart");
          });
    };
    
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{product.name}</Text>
        
        <ScrollView horizontal style={styles.imageScroll}>
          {product.imageIDs.map((image, index) => (
            <View key={index} style={styles.imageWrapper}>
              {loadingImages && <ActivityIndicator size="small" color="#007BFF" />}
              <Image
                source={{ uri: image }}
                style={styles.productImage}
                onLoadEnd={() => setLoadingImages(false)}
              />
            </View>
          ))}
        </ScrollView>
  
        <Text style={styles.price}>${product.price}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.label}>Category: {product.category.join(", ")}</Text>
        <Text style={styles.label}>Brand: {product.brand}</Text>
        <Text style={styles.label}>Subcategory: {product.subcategory?.join(", ")}</Text>
        <Text style={styles.label}>Attributes: {product.attributes}</Text>
       
        <Text style={styles.stock}>Available Stock: {product.quantity}</Text>
  
        <View style={styles.sellerInfoContainer}>
          <Text style={styles.sellerTitle}>Seller Information</Text>
          {sellerLoading ? (
            <ActivityIndicator size="small" color="#007BFF" />
          ) : seller ? (
            <>
              <Text style={styles.sellerText}>Name: {seller.name}</Text>
              <Text style={styles.sellerText}>Email: {seller.email}</Text>
            </>
          ) : (
            <Text style={styles.sellerText}>Seller information not available</Text>
          )}
        </View>
        
        <View style={styles.quantityContainer}>
          <Text style={styles.label}>Quantity:</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              disabled={isOutOfStock}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity((prev) => (prev < product.quantity ? prev + 1 : prev))}
              disabled={isOutOfStock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
          </View>
          {isQuantityExceeded && <Text style={styles.errorText}>Not enough stock available</Text>}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.buyButton, (isOutOfStock || isQuantityExceeded) && styles.disabledButton]} disabled={isOutOfStock || isQuantityExceeded}>
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cartButton, (isOutOfStock || isQuantityExceeded) && styles.disabledButton]} disabled={isOutOfStock || isQuantityExceeded} onPress={handleAddToCart}>
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
        {isOutOfStock && <Text style={styles.errorText}>This product is out of stock</Text>}
      </ScrollView>
    );
  };

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  imageScroll: {
    marginVertical: 10,
  },
  imageWrapper: {
    width: 300,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  stock: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc3545",
    marginVertical: 5,
  },
  errorText: {
    color: "#dc3545",
    fontSize: 16,
    marginTop: 5,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  productImage: {
    width: 300,
    height: 300,
    resizeMode: "cover",
    borderRadius: 10,
    marginRight: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007BFF",
    textAlign: "center",
    marginVertical: 10,
  },
  description: {
    fontSize: 16,
    textAlign: "justify",
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 5,
  },
  sellerInfoContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  sellerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  sellerText: {
    fontSize: 16,
    color: "#555",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  buyButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cartButton: {
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 10,
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProductDetailsScreenCompenent;
