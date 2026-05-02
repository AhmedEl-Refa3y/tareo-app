import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";
import {
  validateEmail,
  validatePassword,
  ValidationErrors,
} from "../../services/validation";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(email, password);
      router.replace("/pages/home");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Authenticate to continue</Text>

      {/* Email */}
      <View>
        <TextInput
          placeholder="Email"
          placeholderTextColor={Colors.lightGray}
          style={[styles.input, errors.email && styles.inputError]}
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          onBlur={() => {
            const error = validateEmail(email);
            setErrors((prev) => ({ ...prev, email: error || undefined }));
          }}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password */}
      <View>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            placeholderTextColor={Colors.lightGray}
            secureTextEntry={!showPassword}
            style={[
              styles.input,
              { flex: 1 },
              errors.password && styles.inputError,
            ]}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            onBlur={() => {
              const error = validatePassword(password);
              setErrors((prev) => ({ ...prev, password: error || undefined }));
            }}
          />

          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            style={styles.showBtn}
          >
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Forgot */}
      <TouchableOpacity onPress={() => router.push("/auth/forgot-password")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.signInBtn}
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.signInText}>Sign In</Text>
        )}
      </TouchableOpacity>

      {/* Role Switch */}
      <View style={styles.roleContainer}>
        <TouchableOpacity style={[styles.roleBtn, styles.activeRole]}>
          <Text style={styles.activeRoleText}>Patient</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.roleBtn}
          onPress={() => router.push("/auth/doctor-login")}
        >
          <Text style={styles.roleText}>Doctor</Text>
        </TouchableOpacity>
      </View>

      {/* Register */}
      <Text style={styles.newHere}>
        New here?{" "}
        <Text
          style={styles.create}
          onPress={() => router.push("/auth/register")}
        >
          Create account
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 6,
    color: Colors.dark,
  },
  subtitle: {
    color: Colors.gray,
    marginBottom: 32,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
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
    marginTop: 6,
    marginBottom: 10,
    marginLeft: 4,
  },
  forgot: {
    textAlign: "right",
    color: Colors.gray,
    marginBottom: 24,
    marginTop: 10,
  },
  signInBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 28,
  },
  signInText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  showBtn: {
    position: "absolute",
    right: 16,
    height: 54,
    justifyContent: "center",
  },
  showText: {
    color: Colors.primary,
    fontWeight: "600",
  },

  roleContainer: {
    flexDirection: "row",
    backgroundColor: "#E6F9FC",
    borderRadius: 30,
    padding: 4,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
  },
  activeRole: {
    backgroundColor: Colors.primary,
  },
  roleText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  activeRoleText: {
    color: Colors.white,
    fontWeight: "600",
  },

  newHere: {
    textAlign: "center",
    color: Colors.lightGray,
  },
  create: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
