import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface Feedback {
  _id: string;
  userId: { firstName: string; lastName: string; role: string };
  rating: number;
  comment: string;
  category: string;
  status: string;
  createdAt: string;
}

export default function AdminFeedback() {
  const router = useRouter();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      const response = await api.get("/feedback/all");
      setFeedbacks(response.data.data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= count ? "star" : "star-outline"}
          size={16}
          color="#FBBF24"
        />,
      );
    }
    return stars;
  };

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
        <Text style={styles.headerTitle}>Feedback</Text>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {feedbacks.map((fb) => (
          <View key={fb._id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.name}>
                {fb.userId.firstName} {fb.userId.lastName}
              </Text>
              <Text style={styles.role}>{fb.userId.role}</Text>
            </View>
            <View style={styles.rating}>{renderStars(fb.rating)}</View>
            <Text style={styles.comment}>{fb.comment}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.date}>
                {new Date(fb.createdAt).toLocaleDateString()}
              </Text>
              <Text
                style={[
                  styles.status,
                  fb.status === "reviewed" ? styles.reviewed : styles.pending,
                ]}
              >
                {fb.status}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 12,
    color: Colors.dark,
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  name: { fontSize: 16, fontWeight: "600", color: Colors.dark },
  role: { fontSize: 12, color: Colors.gray },
  rating: { flexDirection: "row", marginBottom: 8 },
  comment: { fontSize: 14, color: "#374151", marginBottom: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 12, color: Colors.lightGray },
  status: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pending: { color: "#F59E0B", backgroundColor: "#FEF3C7" },
  reviewed: { color: Colors.success, backgroundColor: "#DCFCE7" },
});
