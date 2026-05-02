import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

export default function Profile() {
  const router = useRouter();
  const { user, updateProfile } = useAuth();
  const [image, setImage] = useState<string | null>(user?.profileImage || null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Allow access to photos");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setIsLoading(true);
      try {
        setImage(result.assets[0].uri);
        await updateProfile({ profileImage: result.assets[0].uri });
      } catch (error) {
        Alert.alert("Error", "Failed to update profile image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatar}>
            {image ? (
              <Image source={{ uri: image }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.firstName?.charAt(0) || "U"}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.cameraBtn}
            onPress={pickImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="camera" size={18} color={Colors.white} />
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        {user?.role === "doctor" && user?.doctorId && (
          <Text style={styles.doctorId}>ID: {user.doctorId}</Text>
        )}

        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="person-outline" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.label}>Full Name</Text>
              <Text style={styles.value}>
                {user?.firstName} {user?.lastName}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.item}>
          <View style={styles.itemLeft}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/auth/change-password")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={Colors.primary}
            />
            <View>
              <Text style={styles.value}>Change Password</Text>
              <Text style={styles.subValue}>Update your password</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { padding: 20 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },
  avatarWrapper: { alignItems: "center", marginBottom: 16 },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { fontSize: 36, fontWeight: "700", color: Colors.white },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.white,
  },
  name: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
    color: Colors.dark,
  },
  doctorId: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 24,
  },
  sectionTitle: { fontSize: 13, color: Colors.lightGray, marginBottom: 10 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  itemLeft: { flexDirection: "row", gap: 12, flex: 1 },
  label: { fontSize: 12, color: Colors.lightGray },
  value: { fontSize: 14, fontWeight: "500", color: Colors.dark },
  subValue: { fontSize: 12, color: Colors.gray },
});
