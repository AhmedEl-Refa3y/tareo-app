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
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { Colors } from "../../constants/colors";

export default function DoctorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !isLoading) {
      if (user.role === "admin" || user.role === "doctor") {
        router.replace("/admin/adminHome");
      } else {
        router.replace("/pages/home");
      }
    }
  }, [user, isLoading, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.response?.data?.message || "Invalid credentials",
      );
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Doctor Portal</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={Colors.lightGray}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={Colors.lightGray}
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

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

      <View style={styles.switchContainer}>
        <TouchableOpacity
          style={styles.switchBtn}
          onPress={() => router.push("/auth/login")}
        >
          <Text style={styles.switchText}>Patient</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.switchActive}>
          <Text style={styles.switchActiveText}>Doctor</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 16,
    fontSize: 16,
    color: Colors.dark,
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
  switchContainer: {
    flexDirection: "row",
    backgroundColor: Colors.primary,
    borderRadius: 30,
    padding: 4,
    alignSelf: "center",
    width: "70%",
  },
  switchBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  switchActive: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 26,
    alignItems: "center",
    backgroundColor: Colors.primary,
  },
  switchText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  switchActiveText: {
    color: Colors.white,
    fontWeight: "600",
  },
});
