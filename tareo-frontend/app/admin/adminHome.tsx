import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import LogoutModal from "../../components/LogoutModal";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalDoctors: number;
    totalSessions: number;
    newUsers?: number;
    averageRating?: number;
    completionRate?: number;
  };
}

export default function AdminHome() {
  const router = useRouter();
  const { logout } = useAuth();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/analytics/system");
      setStats(res.data.data);
    } catch (err) {
      console.log("Analytics error:", err);
    } finally {
      setLoading(false);
    }
  };

  const overview = stats?.overview;

  const maxValue = useMemo(() => {
    return Math.max(
      overview?.totalUsers || 0,
      overview?.totalDoctors || 0,
      overview?.totalSessions || 0,
    );
  }, [overview]);

  const menuItems = [
    {
      title: "Manage Users",
      icon: "people-outline",
      route: "/admin/adminUsers",
      colors: ["#06B6D4", "#0EA5E9"],
    },
    {
      title: "View Feedback",
      icon: "star-outline",
      route: "/admin/adminFeedback",
      colors: ["#F59E0B", "#FBBF24"],
    },
    {
      title: "Knowledge Base",
      icon: "book-outline",
      route: "/admin/adminKnowledge",
      colors: ["#6366F1", "#8B5CF6"],
    },
    {
      title: "Settings",
      icon: "settings-outline",
      route: "/admin/adminSettings",
      colors: ["#EF4444", "#F87171"],
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.replace("/auth/login");
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>
            Manage your system with confidence
          </Text>
        </View>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <StatCard label="Users" value={overview?.totalUsers || 0} />
        <StatCard label="Doctors" value={overview?.totalDoctors || 0} />
        <StatCard label="Sessions" value={overview?.totalSessions || 0} />
      </View>

      {/* MINI INSIGHTS */}
      <View style={styles.insightBox}>
        <Text style={styles.insightTitle}>System Insights</Text>

        <Text style={styles.insightText}>
          Completion Rate: {overview?.completionRate?.toFixed(1) || 0}%
        </Text>

        <Text style={styles.insightText}>
          Avg Rating: {overview?.averageRating?.toFixed(1) || 0} ⭐
        </Text>
      </View>

      {/* SIMPLE CHART */}
      <View style={styles.chartBox}>
        <Text style={styles.chartTitle}>Overview Chart</Text>

        <Bar
          label="Users"
          value={overview?.totalUsers || 0}
          max={maxValue}
          color="#06B6D4"
        />
        <Bar
          label="Doctors"
          value={overview?.totalDoctors || 0}
          max={maxValue}
          color="#8B5CF6"
        />
        <Bar
          label="Sessions"
          value={overview?.totalSessions || 0}
          max={maxValue}
          color="#F59E0B"
        />
      </View>

      {/* MENU */}
      <ScrollView contentContainerStyle={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            activeOpacity={0.85}
            onPress={() => router.push(item.route)}
          >
            <LinearGradient colors={item.colors} style={styles.card}>
              <View style={styles.cardLeft}>
                <Ionicons name={item.icon as any} size={24} color="#fff" />
                <Text style={styles.cardText}>{item.title}</Text>
              </View>
              <MaterialIcons name="arrow-forward-ios" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LOGOUT */}
      <TouchableOpacity
        style={styles.logout}
        onPress={() => setShowLogoutModal(true)}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <LogoutModal
        visible={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
      />
    </View>
  );
}

/* ================= SMALL COMPONENTS ================= */

const StatCard = ({ label, value }: any) => (
  <View style={styles.statCard}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const Bar = ({ label, value, max, color }: any) => {
  const width = max ? (value / max) * 100 : 0;

  return (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${width}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.dark,
  },

  subtitle: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
  },

  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 15,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },

  statLabel: {
    fontSize: 12,
    color: Colors.gray,
  },

  insightBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
  },

  insightTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },

  insightText: {
    fontSize: 12,
    color: Colors.gray,
  },

  chartBox: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 15,
  },

  chartTitle: {
    fontWeight: "700",
    marginBottom: 10,
  },

  barLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: Colors.gray,
  },

  barBackground: {
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    overflow: "hidden",
  },

  barFill: {
    height: "100%",
    borderRadius: 10,
  },

  menu: {
    paddingBottom: 20,
  },

  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
  },

  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cardText: {
    color: "#fff",
    fontWeight: "600",
  },

  logout: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EF4444",
  },

  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
  },
});
