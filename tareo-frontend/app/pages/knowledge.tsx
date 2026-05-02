import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import ArticleModal from "./ArticleModal";

export default function KnowledgeScreen() {
  const router = useRouter();

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const res = await api.get("/knowledge");
      setArticles(res.data.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: any) => {
    setSelected(item);
    setVisible(true);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>

        <Text style={styles.title}>All Articles</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <ScrollView>
          {articles.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.card}
              onPress={() => openModal(item)}
            >
              <Image
                source={{
                  uri: item.image || "https://via.placeholder.com/400x250.png",
                }}
                style={styles.image}
              />

              <Text style={styles.articleTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* 🔥 MODAL */}
      <ArticleModal
        visible={visible}
        onClose={() => setVisible(false)}
        article={selected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    marginBottom: 14,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: 160,
  },

  articleTitle: {
    padding: 10,
    fontWeight: "600",
  },
});
