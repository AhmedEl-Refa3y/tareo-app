import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import api from "../../services/api";
import { Colors } from "../../constants/colors";
import {
  validatePassword,
  validateConfirmPassword,
  ValidationErrors,
} from "../../services/validation";

export default function ChangePassword() {
  const router = useRouter();

  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    if (field === "current") setCurrent(value);
    if (field === "password") setPassword(value);
    if (field === "confirm") setConfirm(value);

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!current.trim()) {
      newErrors.current = "Current password is required";
    }

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(password, confirm);
    if (confirmError) newErrors.confirm = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.put("/auth/change-password", {
        currentPassword: current,
        newPassword: password,
      });

      Alert.alert("Success", "Password updated successfully");
      router.back();
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
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Change Password</Text>
        </View>

        {/* CURRENT */}
        <TextInput
          placeholder="Current Password"
          secureTextEntry
          style={[styles.input, errors.current && styles.inputError]}
          value={current}
          onChangeText={(v) => updateField("current", v)}
        />
        {errors.current && (
          <Text style={styles.errorText}>{errors.current}</Text>
        )}

        {/* NEW PASSWORD */}
        <TextInput
          placeholder="New Password"
          secureTextEntry
          style={[styles.input, errors.password && styles.inputError]}
          value={password}
          onChangeText={(v) => updateField("password", v)}
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}

        {/* CONFIRM */}
        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          style={[styles.input, errors.confirm && styles.inputError]}
          value={confirm}
          onChangeText={(v) => updateField("confirm", v)}
        />
        {errors.confirm && (
          <Text style={styles.errorText}>{errors.confirm}</Text>
        )}

        {/* BUTTON */}
        <TouchableOpacity
          style={styles.button}
          disabled={isLoading}
          onPress={handleUpdate}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.buttonText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  container: {
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },

  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
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

  button: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  buttonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 16,
  },
});
