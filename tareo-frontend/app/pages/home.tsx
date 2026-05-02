import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Modal,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await api.get("/knowledge");
      setArticles(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openArticle = (item: any) => {
    setSelectedArticle(item);
    setModalVisible(true);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ================= HEADER ================= */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Welcome 👋</Text>
            <Text style={styles.username}>{user?.firstName || "User"}</Text>
          </View>

          <TouchableOpacity
            style={styles.settings}
            onPress={() => router.push("./settings")}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* ================= INTRO ================= */}
        <View style={styles.intro}>
          <Ionicons name="sparkles-outline" size={18} color={Colors.primary} />
          <Text style={styles.introText}>
            Choose how you'd like to connect today
          </Text>
        </View>

        {/* ================= CHAT + VIDEO ================= */}
        <View style={styles.cards}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, styles.chatCard]}
            onPress={() => router.push("/consulting/Chat")}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
            </View>

            <Text style={styles.cardTitle}>Text Chat</Text>
            <Text style={styles.cardDesc}>
              Talk instantly with a doctor in real-time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.card, styles.videoCard]}
            onPress={() => router.push("/consulting/video")}
          >
            <View style={styles.cardIcon}>
              <Ionicons name="videocam" size={26} color="#fff" />
            </View>

            <Text style={styles.cardTitle}>Video Call</Text>
            <Text style={styles.cardDesc}>
              Face-to-face consultation with doctors
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= KNOWLEDGE ================= */}
        <View style={{ marginTop: 25 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Knowledge</Text>
            <TouchableOpacity onPress={() => router.push("/pages/knowledge")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : (
            articles.slice(0, 5).map((item: any) => (
              <TouchableOpacity
                key={item._id}
                style={styles.articleCard}
                activeOpacity={0.85}
                onPress={() => openArticle(item)}
              >
                <Image
                  source={{
                    uri:
                      item.image ||
                      "https://via.placeholder.com/400x250.png?text=Knowledge",
                  }}
                  style={styles.articleImage}
                />

                <View style={styles.articleContent}>
                  <Text style={styles.articleTitle} numberOfLines={2}>
                    {item.title}
                  </Text>

                  <View style={styles.dateRow}>
                    <Ionicons
                      name="calendar-outline"
                      size={14}
                      color={Colors.gray}
                    />
                    <Text style={styles.dateText}>
                      {formatDate(item.createdAt)} •{" "}
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ================= ARTICLE MODAL ================= */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={Colors.dark} />
            </TouchableOpacity>

            {selectedArticle && (
              <>
                <Image
                  source={{
                    uri:
                      selectedArticle.image ||
                      "https://via.placeholder.com/600x400.png?text=Article",
                  }}
                  style={styles.modalImage}
                />

                <Text style={styles.modalTitle}>{selectedArticle.title}</Text>

                <View style={styles.modalDate}>
                  <Ionicons name="time-outline" size={14} color={Colors.gray} />
                  <Text style={styles.modalDateText}>
                    {formatDate(selectedArticle.createdAt)} •{" "}
                    {formatTime(selectedArticle.createdAt)}
                  </Text>
                </View>

                <Text style={styles.modalContent}>
                  {selectedArticle.content}
                </Text>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  welcome: { color: Colors.gray, fontSize: 14 },
  username: { fontSize: 22, fontWeight: "700", color: Colors.primary },

  settings: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F0F9FB",
    justifyContent: "center",
    alignItems: "center",
  },

  /* INTRO */
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 20,
  },

  introText: {
    fontSize: 13,
    color: Colors.gray,
  },

  /* CARDS */
  cards: {
    gap: 14,
  },

  card: {
    height: 170,
    borderRadius: 24,
    padding: 20,
    justifyContent: "center",
  },

  chatCard: {
    backgroundColor: "#EFF6FB",
  },

  videoCard: {
    backgroundColor: "#F8FAFC",
  },

  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark,
  },

  cardDesc: {
    fontSize: 13,
    color: Colors.gray,
    marginTop: 4,
  },

  /* KNOWLEDGE */
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },

  seeAll: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "600",
  },

  articleCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    elevation: 2,
  },

  articleImage: {
    width: "100%",
    height: 140,
  },

  articleContent: {
    padding: 12,
  },

  articleTitle: {
    fontWeight: "700",
    fontSize: 14,
    color: Colors.dark,
  },

  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },

  dateText: {
    fontSize: 12,
    color: Colors.gray,
  },

  /* MODAL */
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },

  closeBtn: {
    alignSelf: "flex-end",
    padding: 16,
  },

  modalImage: {
    width: "100%",
    height: 220,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    padding: 16,
  },

  modalDate: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
  },

  modalDateText: {
    fontSize: 12,
    color: Colors.gray,
  },

  modalContent: {
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
    color: Colors.gray,
  },
});
