import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import { validateVerificationCode } from "../../services/validation";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyCode() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const { setSession } = useAuth(); // 🔥 مهم جدًا

  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const getFullCode = () => code.join("").replace(/\s/g, "").trim();

  const isComplete = code.every((c) => c !== "");

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];

    // paste support
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").split("").slice(0, 6);
      digits.forEach((d, i) => (newCode[i] = d));
      setCode(newCode);
      inputs.current[Math.min(digits.length, 5)]?.focus();
      return;
    }

    newCode[index] = value;
    setCode(newCode);
    setError("");

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (code[index]) {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  const handleVerify = async () => {
    const verificationCode = getFullCode();
    const cleanEmail = (email as string)?.trim().toLowerCase();

    // validation
    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setError(codeError);
      return;
    }

    if (!cleanEmail) {
      Alert.alert("Error", "Email is missing");
      return;
    }

    setIsLoading(true);

    try {
      const res = await api.post("/auth/verify-email", {
        email: cleanEmail,
        code: verificationCode,
      });

      console.log("VERIFY SUCCESS:", res.data);

      // 🔥 أهم سطر في المشروع كله
      await setSession(res.data.token, res.data.user);

      // redirect
      router.replace("/onboarding/onboarding");
    } catch (error: any) {
      console.log("VERIFY ERROR:", error.response?.data);

      const backendError =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message;

      Alert.alert("Verification Failed", backendError || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await api.post("/auth/resend-verification", {
        email: (email as string)?.trim().toLowerCase(),
      });

      Alert.alert("Success", "New code sent successfully");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to resend code",
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.dark} />
      </TouchableOpacity>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.iconWrapper}>
          <Ionicons name="shield-checkmark-outline" size={22} color="#8B5CF6" />
        </View>

        <Text style={styles.title}>Verify Email</Text>

        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{" "}
          <Text style={{ fontWeight: "600" }}>{email}</Text>
        </Text>

        {/* INPUTS */}
        <View style={styles.codeRow}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputs.current[index] = ref)}
              style={[styles.codeInput, error && styles.codeInputError]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(v) => handleChange(v, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resend}>Resend Code</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            (!isComplete || isLoading) && styles.verifyBtnDisabled,
          ]}
          disabled={!isComplete || isLoading}
          onPress={handleVerify}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.verifyText}>Verify Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  back: { padding: 20 },

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
    backgroundColor: "#EDE9FE",
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

  codeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  codeInput: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark,
  },

  codeInputError: {
    borderColor: "#EF4444",
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 16,
  },

  resend: {
    textAlign: "center",
    color: Colors.primary,
    marginBottom: 24,
  },

  verifyBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },

  verifyBtnDisabled: {
    backgroundColor: "#BFEAF3",
  },

  verifyText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
