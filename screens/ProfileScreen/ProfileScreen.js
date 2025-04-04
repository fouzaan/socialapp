import React from "react";
import { View, Text, Image, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useSelector } from "react-redux";

const ProfilePage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const { userProducts, loading, error } = useSelector((state) => state.products);

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.productImage}
      />
      <Text style={styles.productTitle}>{item.name}</Text>
      <Text style={styles.productPrice}>${item.price}</Text>
      <Text style={styles.productDesc}>{item.description?.slice(0, 60)}...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Profile Info */}
      <View style={styles.profileCard}>
        <Image
          source={{ uri: currentUser?.photoURL || "https://via.placeholder.com/100" }}
          style={styles.avatar}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{currentUser?.name || "No Name"}</Text>
          <Text style={styles.userEmail}>{currentUser?.email}</Text>
          <Text style={styles.userDate}>
            Member since: {new Date(currentUser?.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      {/* Product List */}
      <Text style={styles.sectionTitle}>Items You're Selling</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
      ) : userProducts?.length === 0 ? (
        <Text style={styles.emptyText}>You haven’t listed any products yet.</Text>
      ) : (
        <FlatList
          data={userProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
        />
      )}
    </View>
  );
};

export default ProfilePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F3F4F6",
  },
  profileCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
    elevation: 3,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: "#e5e7eb",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  userEmail: {
    color: "#6B7280",
    marginTop: 4,
  },
  userDate: {
    marginTop: 6,
    color: "#9CA3AF",
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#1F2937",
  },
  productCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    width: "48%",
  },
  productImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  productPrice: {
    color: "#2563EB",
    marginBottom: 4,
  },
  productDesc: {
    color: "#6B7280",
    fontSize: 12,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
  emptyText: {
    color: "#6B7280",
    fontSize: 16,
    textAlign: "center",
  },
});