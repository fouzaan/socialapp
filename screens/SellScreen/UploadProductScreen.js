import React, { useState, useEffect } from "react";
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { useDispatch } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { createProduct, updateProduct } from "../../store/Slices/UploadProductScreen";

const UploadProductScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const product = route.params?.product;  // Get product data if editing

  const [productName, setProductName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [description, setDescription] = useState(product?.description || "");
  const [category, setCategory] = useState(product?.category?.join(", ") || "");
  const [subcategory, setSubcategory] = useState(product?.subcategory?.join(", ") || "");
  const [tags, setTags] = useState(product?.tags?.join(", ") || "");
  const [brand, setBrand] = useState(product?.brand || "");
  const [price, setPrice] = useState(product?.price || "");
  const [attributes, setAttributes] = useState(product?.attributes || "");
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || "");
  const [selectedImages, setSelectedImages] = useState(product?.imageIDs || []);
  const [loading, setLoading] = useState(false);

  const handleImagePick = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission Denied", "You need to allow access to the media library.");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      const images = result.assets.map((asset) => asset.uri);
      setSelectedImages([...selectedImages, ...images]);
    }
  };

  const handleSubmit = async () => {
    if (!productName || !price || !quantity || selectedImages.length === 0) {
      Alert.alert("Error", "Please fill all fields and select at least one image.");
      return;
    }
    setLoading(true);

    const productData = {
      name: productName,
      slug,
      description,
      category: category.split(",").map((item) => item.trim()),
      subcategory: subcategory.split(",").map((item) => item.trim()),
      tags: tags.split(",").map((item) => item.trim()),
      brand,
      price,
      attributes,
      quantity: parseInt(quantity, 10),
    };

    if (product) {
      dispatch(updateProduct({ productId: product.productID, updatedData: productData, images: selectedImages }))
        .then(() => {
          setLoading(false);
          Alert.alert("Success", "Product updated successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
        })
        .catch((error) => {
          setLoading(false);
          Alert.alert("Error", error.message);
        });
    } else {
      dispatch(createProduct({ productData, images: selectedImages }))
        .then(() => {
          setLoading(false);
          Alert.alert("Success", "Product uploaded successfully!", [{ text: "OK", onPress: () => navigation.goBack() }]);
        })
        .catch((error) => {
          setLoading(false);
          Alert.alert("Error", error.message);
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{product ? "Update Product" : "Upload Product"}</Text>
      <TextInput style={styles.input} placeholder="Product Name" value={productName} onChangeText={setProductName} />
      <TextInput style={styles.input} placeholder="Slug" value={slug} onChangeText={setSlug} />
      <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <TextInput style={styles.input} placeholder="Category (comma-separated)" value={category} onChangeText={setCategory} />
      <TextInput style={styles.input} placeholder="Subcategory (comma-separated)" value={subcategory} onChangeText={setSubcategory} />
      <TextInput style={styles.input} placeholder="Tags (comma-separated)" value={tags} onChangeText={setTags} />
      <TextInput style={styles.input} placeholder="Brand" value={brand} onChangeText={setBrand} />
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Attributes" value={attributes} onChangeText={setAttributes} />
      <TextInput style={styles.input} placeholder="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
      <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
        <Text style={styles.buttonText}>Select Images</Text>
      </TouchableOpacity>
      <ScrollView horizontal style={styles.imagePreview}>
        {selectedImages.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.image} />
        ))}
      </ScrollView>
      {loading ? (
        <ActivityIndicator size="large" color="#007BFF" />
      ) : (
        <TouchableOpacity style={styles.uploadButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>{product ? "Update Product" : "Upload Product"}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: "#f4f4f4", alignItems: "center" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: { width: "100%", height: 50, borderColor: "#ccc", borderWidth: 1, borderRadius: 10, paddingLeft: 15, marginBottom: 15, backgroundColor: "#fff" },
  imageButton: { width: "100%", height: 50, backgroundColor: "#ff8c00", justifyContent: "center", alignItems: "center", borderRadius: 10, marginBottom: 15 },
  uploadButton: { width: "100%", height: 50, backgroundColor: "#007BFF", justifyContent: "center", alignItems: "center", borderRadius: 10, marginTop: 20 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  imagePreview: { flexDirection: "row", marginTop: 10, marginBottom: 10 },
  image: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
});

export default UploadProductScreen;
