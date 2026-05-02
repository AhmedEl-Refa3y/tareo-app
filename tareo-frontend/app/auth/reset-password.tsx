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
import { useState } from "react";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import {
  validatePassword,
  validateConfirmPassword,
  validateResetToken,
  ValidationErrors,
} from "../../services/validation";

export default function ResetPassword() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    if (field === "token") setToken(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const tokenError = validateResetToken(token);
    if (tokenError) newErrors.token = tokenError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password,
        email: email || "",
      });

      router.replace("/auth/password-updated");
    } catch (error: any) {
      Alert.alert(
        "Reset Failed",
        error.response?.data?.message || "Something went wrong",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* BACK */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.dark} />
      </TouchableOpacity>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <Text style={styles.title}>Reset Password</Text>

        <Text style={styles.subtitle}>
          Enter the reset token sent to your email and create a new password.
        </Text>

        {/* TOKEN */}
        <TextInput
          style={[styles.input, errors.token && styles.inputError]}
          placeholder="Reset Token"
          value={token}
          onChangeText={(v) => updateField("token", v)}
          autoCapitalize="none"
        />
        {errors.token && <Text style={styles.errorText}>{errors.token}</Text>}

        {/* PASSWORD */}
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="New Password"
          secureTextEntry
          value={password}
          onChangeText={(v) => updateField("password", v)}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* CONFIRM PASSWORD */}
        <TextInput
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={(v) => updateField("confirmPassword", v)}
        />
        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.updateBtn}
          disabled={isLoading}
          onPress={handleResetPassword}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.updateText}>Reset Password</Text>
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
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 14,
    color: Colors.dark,
  },

  inputError: {
    borderColor: "#EF4444",
    borderWidth: 1.5,
  },

  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginBottom: 12,
    marginLeft: 4,
  },

  updateBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  updateText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
