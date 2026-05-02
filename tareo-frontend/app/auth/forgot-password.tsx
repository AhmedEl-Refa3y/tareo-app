import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import { validateEmail } from "../../services/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSendCode = async () => {
    const emailError = validateEmail(email);

    if (emailError) {
      setError(emailError);
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });

      router.push({
        pathname: "/auth/reset-password",
        params: { email },
      });
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {Platform.OS === "ios" && (
        <SafeAreaView style={{ backgroundColor: Colors.white }} />
      )}

      {/* Back */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.dark} />
      </TouchableOpacity>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.iconWrapper}>
          <Ionicons name="key-outline" size={22} color={Colors.primary} />
        </View>

        <Text style={styles.title}>Forgot Password?</Text>

        <Text style={styles.subtitle}>
          Enter your email address to receive a reset link.
        </Text>

        {/* EMAIL INPUT */}
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.lightGray}
          style={[styles.input, error && styles.inputError]}
          value={email}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={(value) => {
            setEmail(value);
            if (error) setError("");
          }}
          onBlur={() => {
            const emailError = validateEmail(email);
            setError(emailError || "");
          }}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={handleSendCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.sendText}>Send Reset Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
  },

  back: {
    padding: 20,
  },

  sheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.dark,
    alignSelf: "center",
    marginBottom: 24,
  },

  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F9FC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.dark,
  },

  subtitle: {
    color: Colors.gray,
    marginBottom: 24,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.dark,
    marginBottom: 12,
  },

  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 16,
    marginLeft: 4,
  },

  sendBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  sendText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
