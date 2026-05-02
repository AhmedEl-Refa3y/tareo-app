import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import EndSessionModal from "../../components/EndSessionModal";
import api from "../../services/api";
import { Colors } from "../../constants/colors";

export default function Video() {
  const router = useRouter();
  const [showEndModal, setShowEndModal] = useState(false);
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    createSession();
  }, []);

  const createSession = async () => {
    try {
      const response = await api.post("/sessions", { type: "video" });
      setSessionId(response.data.data._id);
    } catch (error) {
      console.error("Failed to create video session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndCall = async () => {
    if (sessionId) {
      await api.put(`/sessions/${sessionId}/end`);
    }
    setShowEndModal(false);
    router.push({
      pathname: "/rating/feedback",
      params: { sessionId: sessionId || "" },
    });
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
      <View style={styles.avatarWrapper}>
        <Image
          source={require("../../assets/avatar.png")}
          style={styles.avatar}
        />
      </View>
      <Text style={styles.name}>Dr. TAREO</Text>
      <Text style={styles.status}>In session...</Text>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setMuted(!muted)}
        >
          <Ionicons
            name={muted ? "mic-off" : "mic"}
            size={24}
            color={Colors.dark}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.endCall}
          onPress={() => setShowEndModal(true)}
        >
          <Ionicons name="call" size={26} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={() => setCameraOff(!cameraOff)}
        >
          <Ionicons
            name={cameraOff ? "videocam-off" : "videocam"}
            size={24}
            color={Colors.dark}
          />
        </TouchableOpacity>
      </View>

      <EndSessionModal
        visible={showEndModal}
        title="End Session"
        description="Are you sure you want to end this session?"
        onCancel={() => setShowEndModal(false)}
        onConfirm={handleEndCall}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    paddingTop: 80,
  },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: { width: "100%", height: "100%", resizeMode: "contain" },
  name: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
    color: Colors.dark,
  },
  status: { fontSize: 14, color: Colors.gray, marginBottom: 40 },
  controls: { flexDirection: "row", alignItems: "center", gap: 20 },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  endCall: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
});
