import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface Article {
  _id: string;
  title: string;
  type: string;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminKnowledge() {
  const router = useRouter();

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await api.get("/knowledge");
      setArticles(response.data.data);
    } catch (error) {
      console.error("Failed to fetch articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleAddArticle = async () => {
    if (!title || !content) {
      Alert.alert("Error", "Title and content required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/knowledge", {
        title,
        content,
        image,
      });

      setArticles([response.data.data, ...articles]);

      setShowModal(false);
      setTitle("");
      setContent("");
      setImage(null);
    } catch (err) {
      Alert.alert("Error", "Failed to add article");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert("Delete Article", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/knowledge/${id}`);
            setArticles(articles.filter((a) => a._id !== id));
          } catch {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
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

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Knowledge Base</Text>

        <TouchableOpacity onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={26} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={styles.list}>
        {articles.map((article) => (
          <View key={article._id} style={styles.card}>
            <Text style={styles.title}>{article.title}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.date}>
                {new Date(article.createdAt).toLocaleDateString()}
              </Text>

              <TouchableOpacity
                onPress={() => handleDelete(article._id, article.title)}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={22}
                  color="#EF4444"
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={showModal} animationType="slide">
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>Add Article</Text>

          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TextInput
            placeholder="Content"
            value={content}
            onChangeText={setContent}
            multiline
            style={[styles.input, { height: 120 }]}
          />

          <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
            <Text>Add Image</Text>
          </TouchableOpacity>

          {image && <Image source={{ uri: image }} style={styles.preview} />}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleAddArticle}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff" }}>Submit</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F3F4F6" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark,
  },

  list: { paddingBottom: 20 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },

  title: { fontWeight: "600", fontSize: 16 },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  date: { fontSize: 12, color: Colors.gray },

  modal: { flex: 1, padding: 20 },

  modalTitle: { fontSize: 20, fontWeight: "700", marginBottom: 10 },

  input: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },

  imageBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
  },

  preview: { height: 120, marginTop: 10, borderRadius: 10 },

  submitBtn: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  cancel: { textAlign: "center", marginTop: 20 },
});
