import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface Session {
  _id: string;
  type: "chat" | "video";
  status: string;
  duration: number;
  startedAt: string;
  rating?: number;
  feedback?: string;
}

export default function SessionHistory() {
  const router = useRouter();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const endpoint =
        user?.role === "doctor"
          ? "/sessions/doctor-sessions"
          : "/sessions/my-sessions";
      const response = await api.get(endpoint);
      setSessions(response.data.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Session History</Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={Colors.lightGray}
            />
            <Text style={styles.emptyText}>No sessions yet</Text>
            <Text style={styles.emptySubtext}>
              Start a chat or video call to begin
            </Text>
          </View>
        ) : (
          <View style={styles.timeline}>
            <View style={styles.line} />
            {sessions.map((session) => (
              <View key={session._id} style={styles.row}>
                <View style={styles.iconWrapper}>
                  <View
                    style={[
                      styles.icon,
                      session.type === "video" && styles.videoIcon,
                    ]}
                  >
                    <Ionicons
                      name={
                        session.type === "video"
                          ? "videocam-outline"
                          : "chatbubble-outline"
                      }
                      size={16}
                      color={
                        session.type === "video" ? "#7C3AED" : Colors.primary
                      }
                    />
                  </View>
                </View>
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.dateRow}>
                      <Text style={styles.date}>
                        {formatDate(session.startedAt)}
                      </Text>
                      <Text style={styles.time}>
                        {formatTime(session.startedAt)}
                      </Text>
                    </View>
                    {session.rating && (
                      <View style={styles.rating}>
                        <Text style={styles.ratingText}>{session.rating}</Text>
                        <Ionicons name="star" size={14} color="#FBBF24" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.title}>
                    {session.type === "chat"
                      ? "Chat Session"
                      : "Video Consultation"}
                  </Text>
                  <View style={styles.cardFooter}>
                    <View style={styles.duration}>
                      <Ionicons
                        name="time-outline"
                        size={14}
                        color={Colors.lightGray}
                      />
                      <Text style={styles.durationText}>
                        {formatDuration(session.duration)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        router.push({
                          pathname: "/pages/session-details",
                          params: { sessionId: session._id },
                        })
                      }
                    >
                      <Text style={styles.details}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { padding: 20, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
    marginTop: 16,
  },
  emptySubtext: { fontSize: 14, color: Colors.gray, marginTop: 8 },
  timeline: { position: "relative" },
  line: {
    position: "absolute",
    left: 14,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "#E5E7EB",
  },
  row: { flexDirection: "row", marginBottom: 24 },
  iconWrapper: { width: 30, alignItems: "center" },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#E0F7FA",
    justifyContent: "center",
    alignItems: "center",
  },
  videoIcon: { backgroundColor: "#F3E8FF" },
  card: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginLeft: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  dateRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  date: { fontSize: 14, fontWeight: "600", color: Colors.dark },
  time: { fontSize: 12, color: Colors.lightGray },
  rating: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 14, fontWeight: "500", color: Colors.dark },
  title: { fontSize: 13, color: Colors.gray, marginBottom: 10 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  duration: { flexDirection: "row", alignItems: "center", gap: 6 },
  durationText: { fontSize: 12, color: Colors.lightGray },
  details: { fontSize: 12, color: Colors.primary, fontWeight: "500" },
});
