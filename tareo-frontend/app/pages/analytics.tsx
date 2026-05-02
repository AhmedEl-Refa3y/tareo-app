import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface AnalyticsData {
  totalSessions: number;
  completedSessions?: number;
  totalDuration?: number;
  averageRating?: number;
  uniquePatients?: number;
  sessionsByType?: { chat: number; video: number };
}

const Analytics = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const endpoint =
        user?.role === "doctor" ? "/analytics/doctor" : "/analytics/user";
      const response = await api.get(endpoint);
      setData(response.data.data);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerTitle}>Analytics</Text>
        </View>

        <View style={styles.hero}>
          <Ionicons name="bar-chart-outline" size={36} color={Colors.primary} />
          <Text style={styles.heroTitle}>Your Activity Overview</Text>
          <Text style={styles.heroDesc}>
            Insights about your usage and engagement
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data?.totalSessions || 0}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {data?.completedSessions || data?.totalSessions || 0}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        <View style={styles.statCardFull}>
          <Text style={styles.statValue}>{data?.totalDuration || 0} min</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>

        {data?.averageRating && (
          <View style={styles.statCardFull}>
            <View style={styles.ratingRow}>
              <Text style={styles.statValue}>
                {data.averageRating.toFixed(1)}
              </Text>
              <Ionicons name="star" size={24} color="#FBBF24" />
            </View>
            <Text style={styles.statLabel}>Average Rating</Text>
          </View>
        )}

        {data?.sessionsByType && (
          <View style={styles.statCardFull}>
            <View style={styles.typeRow}>
              <Text style={styles.typeValue}>
                Chat: {data.sessionsByType.chat}
              </Text>
              <Text style={styles.typeValue}>
                Video: {data.sessionsByType.video}
              </Text>
            </View>
            <Text style={styles.statLabel}>Sessions by Type</Text>
          </View>
        )}

        {user?.role === "doctor" && data?.uniquePatients && (
          <View style={styles.statCardFull}>
            <Text style={styles.statValue}>{data.uniquePatients}</Text>
            <Text style={styles.statLabel}>Unique Patients</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Analytics;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  hero: { alignItems: "center", marginBottom: 32 },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    color: Colors.dark,
  },
  heroDesc: { textAlign: "center", color: Colors.gray, marginTop: 6 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  statCardFull: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: { fontSize: 22, fontWeight: "700", color: Colors.dark },
  statLabel: { fontSize: 12, color: Colors.gray, marginTop: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeRow: { flexDirection: "row", gap: 16 },
  typeValue: { fontSize: 16, fontWeight: "600", color: Colors.dark },
});
