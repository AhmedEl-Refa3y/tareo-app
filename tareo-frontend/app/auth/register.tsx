import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  ValidationErrors,
} from "../../services/validation";

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  /* ---------------- UPDATE FIELD ---------------- */
  const updateField = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    let error: string | null = null;

    switch (field) {
      case "firstName":
        error = validateName(value, "First name");
        break;
      case "lastName":
        error = validateName(value, "Last name");
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "phone":
        error = validatePhone(value);
        break;
      case "password":
        error = validatePassword(value);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(updated.password, value);
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [field]: error || undefined,
    }));

    // recheck confirm password when password changes
    if (field === "password" && formData.confirmPassword) {
      const confirmError = validateConfirmPassword(
        value,
        formData.confirmPassword,
      );

      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmError || undefined,
      }));
    }
  };

  /* ---------------- VALIDATE FORM ---------------- */
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const firstNameError = validateName(formData.firstName, "First name");
    if (firstNameError) newErrors.firstName = firstNameError;

    const lastNameError = validateName(formData.lastName, "Last name");
    if (lastNameError) newErrors.lastName = lastNameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validateConfirmPassword(
      formData.password,
      formData.confirmPassword,
    );
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- REGISTER ---------------- */
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "patient",
      });

      router.push({
        pathname: "/auth/verify-code",
        params: { email: formData.email },
      });
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.message ||
        "Something went wrong";

      Alert.alert("Registration Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />

      <Text style={styles.title}>Get Started</Text>
      <Text style={styles.subtitle}>Create your secure account</Text>

      {/* NAME */}
      <View style={styles.row}>
        <View style={styles.halfInputContainer}>
          <TextInput
            placeholder="First Name"
            placeholderTextColor={Colors.lightGray}
            style={[styles.input, errors.firstName && styles.inputError]}
            value={formData.firstName}
            onChangeText={(v) => updateField("firstName", v)}
          />
          {errors.firstName && (
            <Text style={styles.errorText}>{errors.firstName}</Text>
          )}
        </View>

        <View style={styles.halfInputContainer}>
          <TextInput
            placeholder="Last Name"
            placeholderTextColor={Colors.lightGray}
            style={[styles.input, errors.lastName && styles.inputError]}
            value={formData.lastName}
            onChangeText={(v) => updateField("lastName", v)}
          />
          {errors.lastName && (
            <Text style={styles.errorText}>{errors.lastName}</Text>
          )}
        </View>
      </View>

      {/* EMAIL */}
      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors.lightGray}
        style={[styles.input, errors.email && styles.inputError]}
        value={formData.email}
        onChangeText={(v) => updateField("email", v)}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

      {/* PHONE */}
      <TextInput
        placeholder="Phone"
        placeholderTextColor={Colors.lightGray}
        style={[styles.input, errors.phone && styles.inputError]}
        value={formData.phone}
        onChangeText={(v) => updateField("phone", v)}
        keyboardType="phone-pad"
      />
      {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

      {/* PASSWORD */}
      <View>
        <TextInput
          placeholder="Password"
          placeholderTextColor={Colors.lightGray}
          secureTextEntry={!showPassword}
          style={[styles.input, errors.password && styles.inputError]}
          value={formData.password}
          onChangeText={(v) => updateField("password", v)}
        />

        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowPassword((p) => !p)}
        >
          <Text style={styles.showText}>{showPassword ? "Hide" : "Show"}</Text>
        </TouchableOpacity>

        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* CONFIRM PASSWORD */}
      <View>
        <TextInput
          placeholder="Confirm Password"
          placeholderTextColor={Colors.lightGray}
          secureTextEntry={!showConfirm}
          style={[styles.input, errors.confirmPassword && styles.inputError]}
          value={formData.confirmPassword}
          onChangeText={(v) => updateField("confirmPassword", v)}
        />

        <TouchableOpacity
          style={styles.showBtn}
          onPress={() => setShowConfirm((p) => !p)}
        >
          <Text style={styles.showText}>{showConfirm ? "Hide" : "Show"}</Text>
        </TouchableOpacity>

        {errors.confirmPassword && (
          <Text style={styles.errorText}>{errors.confirmPassword}</Text>
        )}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.createText}>Create Account</Text>
        )}
      </TouchableOpacity>

      {/* LOGIN */}
      <Text style={styles.haveAccount}>
        Have an account?{" "}
        <Text
          style={styles.signIn}
          onPress={() => router.replace("/auth/login")}
        >
          Sign in
        </Text>
      </Text>
    </ScrollView>
  );
}

/* ---------------- STYLES ---------------- */
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
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInputContainer: {
    flex: 1,
  },
  input: {
    height: 54,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
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
    marginTop: -10,
    marginBottom: 12,
    marginLeft: 4,
  },
  createBtn: {
    height: 56,
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 24,
  },
  createText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  haveAccount: {
    textAlign: "center",
    color: Colors.lightGray,
  },
  signIn: {
    color: Colors.primary,
    fontWeight: "600",
  },
  showBtn: {
    position: "absolute",
    right: 16,
    top: 18,
  },
  showText: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
