import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import LogoutModal from "../../components/LogoutModal";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";

const Settings = () => {
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
  {user?.profileImage ? (
    <Image
      source={{ uri: user.profileImage }}
      style={styles.avatarImage}
    />
  ) : (
    <Text style={styles.avatarText}>
      {user?.firstName?.charAt(0) || "U"}
    </Text>
  )}
</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.email}>{user?.email}</Text>
            <TouchableOpacity onPress={() => router.push("./profile")}>
              <Text style={styles.viewProfile}>View Profile →</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("./session-history")}
        >
          <View style={styles.itemLeft}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <View>
              <Text style={styles.itemTitle}>Session History</Text>
              <Text style={styles.itemSubtitle}>View previous sessions</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("./privacy-security")}
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
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("./analytics")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="bar-chart-outline"
              size={20}
              color={Colors.primary}
            />
            <View>
              <Text style={styles.itemTitle}>Analytics</Text>
              <Text style={styles.itemSubtitle}>Usage & activity insights</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("./help-support")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <View>
              <Text style={styles.itemTitle}>Help & Support</Text>
              <Text style={styles.itemSubtitle}>FAQ, contact us</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.lightGray} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.item}
          onPress={() => router.push("./aboutScreen")}
        >
          <View style={styles.itemLeft}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={Colors.primary}
            />
            <View>
              <Text style={styles.itemTitle}>About TAREO</Text>
              <Text style={styles.itemSubtitle}>Version 1.0.0</Text>
            </View>
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
};

export default Settings;

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
  avatarImage: {
  width: "100%",
  height: "100%",
  borderRadius: 14,
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
  itemSubtitle: { fontSize: 12, color: Colors.gray },
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
