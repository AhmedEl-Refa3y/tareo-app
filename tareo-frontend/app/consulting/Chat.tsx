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
import { useEffect, useState, useRef } from "react";
import EndSessionModal from "../../components/EndSessionModal";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import socketService from "../../services/socket";
import { Colors } from "../../constants/colors";

interface Message {
  _id: string;
  content: string;
  senderId?: any;
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

  useEffect(() => {
    // ❌ OLD
    // createSession();

    // ✅ NEW
    loadLatestSession();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // ✅ NEW: Load latest saved session when opening Text Chat
  const loadLatestSession = async () => {
    try {
      setIsLoading(true);
      setInputText("");

      const res = await api.get("/ai/latest-session");

      setSessionId(res.data.session._id);
      setMessages(res.data.messages || []);
    } catch (error: any) {
      console.error(
        "Failed to load latest session:",
        error?.response?.data || error,
      );

      setMessages([
        {
          _id: Date.now().toString(),
          content: "Error: لم أستطع تحميل آخر محادثة.",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: Start chat through Backend → Knowledge Base → MongoDB
  const startNewAIChat = async () => {
    try {
      setIsLoading(true);
      setMessages([]);
      setInputText("");
      setSessionId(null);

      const res = await api.post("/ai/start");

      console.log("✅ AI START RESPONSE:", res.data);

      setSessionId(res.data.session._id);
      setMessages(res.data.messages || []);
    } catch (error: any) {
      console.error(
        "❌ Failed to start AI chat:",
        error?.response?.data || error,
      );

      setMessages([
        {
          _id: Date.now().toString(),
          content:
            "Error: لم أستطع بدء جلسة الذكاء الاصطناعي. راجع backend terminal.",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ❌ OLD: old backend/socket session
  /*
  const createSession = async () => {
    try {
      const response = await api.post("/sessions", { type: "chat" });
      const newSessionId = response.data.data._id;
      setSessionId(newSessionId);

      socketService.connect();
      socketService.joinSession(newSessionId);

      socketService.onNewMessage((data) => {
        setMessages((prev) => [...prev, data.message]);
      });

      socketService.onUserTyping((data) => {
        setIsTyping(data.isTyping);
      });

      await fetchMessages(newSessionId);
    } catch (error) {
      console.error("Failed to create session:", error);
    } finally {
      setIsLoading(false);
    }
  };
  */

  // ❌ OLD
  /*
  const fetchMessages = async (id: string) => {
    try {
      const response = await api.get(`/messages/${id}`);
      setMessages(response.data.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };
  */

  // ✅ NEW: Send message to Backend, Backend sends to KB and saves in MongoDB
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userText = inputText;

    const tempUserMessage: Message = {
      _id: Date.now().toString(),
      content: userText,
      senderType: "patient",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setInputText("");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    if (!sessionId) {
      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 1).toString(),
          content:
            "Error: لا توجد جلسة نشطة. جرّب اضغط New Chat أو راجع backend terminal.",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
      return;
    }

    try {
      setIsTyping(true);

      const res = await api.post("/ai/message", {
        sessionId,
        message: userText,
      });

      console.log("✅ AI MESSAGE RESPONSE:", res.data);

      setTimeout(() => {
        setMessages((prev) => [...prev, res.data.doctorMessage]);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }, 2000);
    } catch (error: any) {
      console.error(
        "❌ Failed to send AI message:",
        error?.response?.data || error,
      );

      setMessages((prev) => [
        ...prev,
        {
          _id: (Date.now() + 2).toString(),
          content: "Error: الرسالة لم تصل للـ AI. راجع backend terminal.",
          senderType: "doctor",
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  // ❌ OLD
  /*
  const handleSend = async () => {
    if (!inputText.trim() || !sessionId) return;

    try {
      const response = await api.post("/messages", {
        sessionId,
        content: inputText,
      });

      socketService.sendMessage(sessionId, response.data.data);
      setInputText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };
  */

  // ✅ NEW: local typing only
  const handleTyping = (text: string) => {
    setInputText(text);
  };

  // ❌ OLD
  /*
  const handleTyping = (text: string) => {
    setInputText(text);
    socketService.emitTyping(sessionId!, text.length > 0);
  };
  */

  // ✅ NEW: New chat saves old session and starts fresh one
  const handleNewChat = async () => {
    try {
      setIsLoading(true);

      const res = await api.post("/ai/new-chat", {
        oldSessionId: sessionId,
      });

      setSessionId(res.data.session._id);
      setMessages(res.data.messages);
      setInputText("");

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } catch (error) {
      console.error("Failed to create new chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ NEW: End chat through backend then open rating
  const handleEndChat = async () => {
    try {
      await api.post("/ai/end", {
        sessionId,
      });

      setShowEndModal(false);

      router.push({
        pathname: "/rating/feedback",
        params: { sessionId: sessionId || "" },
      });
    } catch (error) {
      console.error("Failed to end chat:", error);
    }
  };

  // ❌ OLD
  /*
  const handleEndChat = async () => {
    if (sessionId) {
      await api.put(`/sessions/${sessionId}/end`);
    }
    setShowEndModal(false);
    router.push({
      pathname: "/rating/feedback",
      params: { sessionId: sessionId || "" },
    });
  };
  */

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser =
      item.senderType === (user?.role === "doctor" ? "doctor" : "patient");

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

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Dr. TAREO</Text>
          <Text style={styles.headerSub}>Online</Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity style={styles.newChatBtn} onPress={handleNewChat}>
            <Text style={styles.newChatText}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.endBtn}
            onPress={() => setShowEndModal(true)}
          >
            <Text style={styles.endText}>End</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.chat}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        />

        {isTyping && (
          <View style={styles.typingWrapper}>
            <Text style={styles.typingText}>Dr. TAREO is typing...</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.micBtn}>
            <Ionicons name="mic-outline" size={22} color={Colors.lightGray} />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            placeholder="Type a message..."
            style={styles.input}
            value={inputText}
            onChangeText={handleTyping}
            onSubmitEditing={handleSend}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color={Colors.white} />
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

  headerCenter: { flex: 1, marginLeft: 12 },

  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },

  headerSub: {
    fontSize: 12,
    color: Colors.success,
  },

  newChatBtn: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 8,
  },

  newChatText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "500",
  },

  endBtn: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  endText: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
  },

  chat: {
    padding: 16,
    paddingBottom: 10,
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

  typingWrapper: {
    paddingHorizontal: 16,
    marginBottom: 6,
  },

  typingText: {
    fontSize: 12,
    color: Colors.gray,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    gap: 10,
  },

  micBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  input: {
    flex: 1,
    height: 42,
    borderRadius: 21,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    fontSize: 14,
    color: Colors.dark,
  },

  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
