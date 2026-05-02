import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import LogoutModal from "../../components/LogoutModal";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";

export default function AdminSettings() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.firstName?.charAt(0) || "A"}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity onPress={() => router.push("/pages/profile")}>
              <Text style={styles.viewProfile}>View Profile →</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/pages/privacy-security")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.itemTitle}>Privacy & Security</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Support</Text>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/pages/help-support")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.itemTitle}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("/pages/aboutScreen")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.itemTitle}>About App</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logout}
          onPress={() => setShowLogoutModal(true)}
        >
          <Ionicons name="log-out-outline" size={20} color="#E63946" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F6FA",
    padding: 16,
    borderRadius: 18,
    marginBottom: 28,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: Colors.white, fontSize: 18, fontWeight: "700" },
  name: { fontWeight: "600", color: Colors.dark },
  email: { fontSize: 12, color: Colors.gray },
  viewProfile: { fontSize: 12, color: Colors.primary, marginTop: 4 },
  sectionTitle: { fontSize: 13, color: Colors.lightGray, marginBottom: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  itemTitle: { fontSize: 14, fontWeight: "500", color: Colors.dark },
  logout: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 10,
  },
  logoutText: { color: "#E63946", fontWeight: "600", fontSize: 14 },
});
