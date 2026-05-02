import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

type Props = {
  visible: boolean;
  onClose: () => void;
  article: any;
};

export default function ArticleModal({ visible, onClose, article }: Props) {
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
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <TouchableOpacity style={styles.close} onPress={onClose}>
          <Ionicons name="close" size={24} color={Colors.dark} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {article?.image && (
            <Image source={{ uri: article.image }} style={styles.image} />
          )}

          <Text style={styles.title}>{article?.title}</Text>

          <Text style={styles.date}>
            {formatDate(article?.createdAt)} • {formatTime(article?.createdAt)}
          </Text>

          <Text style={styles.content}>{article?.content}</Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  close: {
    alignSelf: "flex-end",
    padding: 16,
  },

  image: {
    width: "100%",
    height: 220,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    padding: 16,
    color: Colors.dark,
  },

  date: {
    fontSize: 12,
    color: Colors.gray,
    paddingHorizontal: 16,
    marginBottom: 10,
  },

  content: {
    fontSize: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
    color: Colors.gray,
    paddingBottom: 40,
  },
});
