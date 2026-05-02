import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

interface Message {
  _id: string;
  content: string;
  senderType: "patient" | "doctor";
  createdAt: string;
}

export default function SessionDetails() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSessionMessages();
  }, []);

  const fetchSessionMessages = async () => {
    try {
      const response = await api.get(`/messages/${sessionId}`);
      setMessages(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch session messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.senderType === "patient";

    return (
      <View
        style={[
          styles.messageWrapper,
          isUser ? styles.userAlign : styles.doctorAlign,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.doctorBubble,
          ]}
        >
          <Text style={[styles.messageText, isUser && { color: Colors.white }]}>
            {item.content}
          </Text>
        </View>

        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    );
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

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Session Details</Text>
      </View>

      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="chatbubble-outline"
            size={60}
            color={Colors.lightGray}
          />
          <Text style={styles.emptyText}>No messages found</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.chat}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },

  chat: {
    padding: 16,
    paddingBottom: 30,
  },

  messageWrapper: {
    marginBottom: 14,
    maxWidth: "80%",
  },

  doctorAlign: {
    alignSelf: "flex-start",
  },

  userAlign: {
    alignSelf: "flex-end",
  },

  bubble: {
    borderRadius: 20,
    padding: 12,
  },

  doctorBubble: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 4,
  },

  userBubble: {
    backgroundColor: Colors.primary,
    borderTopRightRadius: 4,
  },

  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.dark,
  },

  time: {
    fontSize: 11,
    color: Colors.lightGray,
    marginTop: 4,
    alignSelf: "flex-end",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.gray,
  },
});