import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  doctorId?: string;
  isActive: boolean;
}

export default function AdminUsers() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/users/${id}/toggle-status`, {
        isActive: !currentStatus,
      });
      setUsers(
        users.map((u) =>
          u._id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );
      Alert.alert(
        "Success",
        `User ${!currentStatus ? "activated" : "deactivated"}`,
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update user status");
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.firstName.toLowerCase().includes(search.toLowerCase()) ||
      u.lastName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Users</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={Colors.lightGray} />
        <TextInput
          placeholder="Search users..."
          placeholderTextColor={Colors.lightGray}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <View key={user._id} style={styles.userCard}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {user.firstName.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.name}>
                    {user.firstName} {user.lastName}
                  </Text>
                  <Text style={styles.email}>{user.email}</Text>
                  <View style={styles.badgeContainer}>
                    <Text
                      style={[
                        styles.role,
                        user.role === "admin" && styles.adminRole,
                      ]}
                    >
                      {user.role}
                    </Text>
                    {!user.isActive && (
                      <Text style={styles.inactiveBadge}>Inactive</Text>
                    )}
                  </View>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handleToggleStatus(user._id, user.isActive)}
                >
                  <Ionicons
                    name={user.isActive ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={Colors.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noUsers}>No users found.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F3F4F6", padding: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
    color: Colors.dark,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: { marginLeft: 8, flex: 1, fontSize: 14, color: Colors.dark },
  list: { paddingBottom: 20 },
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  userInfo: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: Colors.white, fontWeight: "700", fontSize: 18 },
  name: { fontWeight: "600", fontSize: 15, color: Colors.dark },
  email: { fontSize: 12, color: Colors.gray },
  badgeContainer: { flexDirection: "row", gap: 8, marginTop: 4 },
  role: {
    fontSize: 10,
    color: Colors.success,
    fontWeight: "500",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  adminRole: { color: "#7C3AED", backgroundColor: "#EDE9FE" },
  inactiveBadge: {
    fontSize: 10,
    color: "#EF4444",
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: "hidden",
  },
  actions: { flexDirection: "row", gap: 16 },
  noUsers: { textAlign: "center", color: Colors.gray, marginTop: 40 },
});
