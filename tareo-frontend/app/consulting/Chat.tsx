import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef, useCallback } from "react";
import EndSessionModal from "../../components/EndSessionModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";

interface Message {
  _id: string;
  content: string;
  senderType: string;
  createdAt: string;
}

export default function Chat() {
  const router = useRouter();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    loadLatestSession();
    return () => {
      isMounted.current = false;
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const loadLatestSession = async () => {
    try {
      const res = await api.get("/ai/latest-session");

      if (!isMounted.current) return;

      setSessionId(res.data.session?._id || null);
      setMessages(res.data.messages || []);
    } catch (err) {
      setMessages([
        {
          _id: Date.now().toString(),
          content: "حصل مشكلة في تحميل الشات 😢",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    const userMsg: Message = {
      _id: Date.now().toString(),
      content: inputText,
      senderType: "patient",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    scrollToBottom();

    try {
      setIsTyping(true);

      const res = await api.post("/ai/message", {
        sessionId,
        message: userMsg.content,
      });

      if (!isMounted.current) return;

      setMessages((prev) => [...prev, res.data.doctorMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 1).toString(),
          content: "فشل إرسال الرسالة ❌",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleNewChat = async () => {
    try {
      setIsLoading(true);

      const res = await api.post("/ai/new-chat", {
        oldSessionId: sessionId,
      });

      if (!isMounted.current) return;

      setSessionId(res.data.session._id);
      setMessages(res.data.messages || []);
      setInputText("");
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  const handleEndChat = async () => {
    await api.post("/ai/end", { sessionId });

    setShowEndModal(false);

    router.push({
      pathname: "/rating/feedback",
      params: { sessionId: sessionId || "" },
    });
  };

  const renderItem = useCallback(({ item }: { item: Message }) => {
    const isUser =
      item.senderType === (user?.role === "doctor" ? "doctor" : "patient");

    return (
      <View
        style={[styles.messageRow, isUser ? styles.userRow : styles.botRow]}
      >
        <View
          style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}
        >
          <Text style={[styles.text, isUser && { color: "#fff" }]}>
            {item.content}
          </Text>

          <Text style={[styles.time, isUser && { color: "#ddd" }]}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Dr. TAREO</Text>
          <Text style={styles.online}>Online</Text>
        </View>

        <TouchableOpacity onPress={handleNewChat}>
          <Ionicons name="refresh" size={20} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowEndModal(true)}>
          <Ionicons name="close" size={22} color="red" />
        </TouchableOpacity>
      </View>

      {/* CHAT */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
          onContentSizeChange={scrollToBottom}
        />

        {isTyping && (
          <View style={styles.typing}>
            <Text style={{ color: "#666" }}>Typing...</Text>
          </View>
        )}

        {/* INPUT */}
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            value={inputText}
            onChangeText={setInputText}
            placeholder="اكتب رسالة..."
            style={styles.input}
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity style={styles.send} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <EndSessionModal
        visible={showEndModal}
        onCancel={() => setShowEndModal(false)}
        onConfirm={handleEndChat}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    gap: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  headerCenter: { flex: 1 },

  title: { fontWeight: "bold", fontSize: 16 },

  online: { color: "green", fontSize: 12 },

  messageRow: {
    marginVertical: 6,
    flexDirection: "row",
  },

  userRow: { justifyContent: "flex-end" },
  botRow: { justifyContent: "flex-start" },

  bubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 16,
  },

  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },

  botBubble: {
    backgroundColor: "#E5E7EB",
    borderBottomLeftRadius: 4,
  },

  text: { fontSize: 14 },

  time: {
    fontSize: 10,
    marginTop: 4,
    color: "#666",
    alignSelf: "flex-end",
  },

  typing: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },

  inputWrapper: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 15,
    height: 45,
  },

  send: {
    backgroundColor: "#007AFF",
    marginLeft: 10,
    padding: 12,
    borderRadius: 25,
  },
});
