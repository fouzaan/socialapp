import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";

const ProductDetailsScreen = ({ route }) => {
  const { product } = route.params;
  const [loadingImages, setLoadingImages] = useState(true);

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

      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
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
  productImage: {
    width: 300,
    height: 300,
    resizeMode: "cover",
    borderRadius: 10,
    marginRight: 10,
  },
  price: {
    fontSize: 20,
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
  buyButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  buyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProductDetailsScreen;