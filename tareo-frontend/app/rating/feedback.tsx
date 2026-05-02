import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import {
  validateFeedbackRating,
  validateFeedbackComment,
} from "../../services/validation";

export default function Feedback() {
  const router = useRouter();
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{
    rating?: string;
    comment?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { rating?: string; comment?: string } = {};

    const ratingError = validateFeedbackRating(rating);
    if (ratingError) newErrors.rating = ratingError;

    const commentError = validateFeedbackComment(comment);
    if (commentError) newErrors.comment = commentError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post("/feedback", {
        sessionId: sessionId || null,
        rating,
        comment,
        category: "session",
      });

      router.push("/rating/thankYou");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit feedback",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#11C5D9", "#001F24"]} style={styles.container}>
      <Text style={styles.title}>Session Complete</Text>
      <Text style={styles.subtitle}>How was your experience?</Text>

      {/* ⭐ STARS */}
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            activeOpacity={0.7}
            onPress={() => {
              setRating(star);
              setErrors((prev) => ({ ...prev, rating: undefined }));
            }}
          >
            <Ionicons
              name={star <= rating ? "star" : "star-outline"}
              size={34}
              color="#FBBF24"
              style={{ marginHorizontal: 6 }}
            />
          </TouchableOpacity>
        ))}
      </View>

      {errors.rating && <Text style={styles.errorText}>{errors.rating}</Text>}

      {/* COMMENT */}
      <View style={styles.commentWrapper}>
        <TextInput
          placeholder="Optional feedback..."
          placeholderTextColor={Colors.lightGray}
          multiline
          value={comment}
          onChangeText={(text) => {
            setComment(text);
            setErrors((prev) => ({ ...prev, comment: undefined }));
          }}
          style={styles.commentBox}
        />
      </View>

      {errors.comment && <Text style={styles.errorText}>{errors.comment}</Text>}

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.submitText}>Submit Feedback</Text>
        )}
      </TouchableOpacity>

      {/* SKIP */}
      <TouchableOpacity onPress={() => router.push("/pages/home")}>
        <Text style={styles.skip}>Skip Feedback</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#E5E7EB",
    marginBottom: 24,
  },

  stars: {
    flexDirection: "row",
    marginBottom: 10,
  },

  commentWrapper: {
    width: "100%",
    backgroundColor: Colors.white,
    borderRadius: 18,
    padding: 12,
    marginBottom: 8,
  },

  commentBox: {
    minHeight: 120,
    fontSize: 14,
    color: Colors.dark,
    textAlignVertical: "top",
  },

  errorText: {
    color: "#FEE2E2",
    fontSize: 12,
    marginBottom: 16,
    textAlign: "center",
  },

  submitBtn: {
    width: "100%",
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: "center",
    marginBottom: 16,
  },

  submitText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  skip: {
    color: Colors.lightGray,
    fontSize: 13,
  },
});
