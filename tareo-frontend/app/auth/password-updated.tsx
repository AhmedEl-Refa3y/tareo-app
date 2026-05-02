import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/colors";

export default function PasswordUpdated() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.dark} />
      </TouchableOpacity>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.iconWrapper}>
          <View style={styles.iconInner}>
            <Ionicons name="checkmark" size={24} color="#22C55E" />
          </View>
        </View>
        <Text style={styles.title}>Password Updated</Text>
        <Text style={styles.subtitle}>
          Your password has been reset successfully. You can now log in with
          your new credentials.
        </Text>
        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => router.replace("/auth/login")}
        >
          <Text style={styles.loginText}>Back to Login</Text>
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
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: "center",
  },
  handle: {
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.dark,
    marginBottom: 32,
  },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#BBF7D0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
    color: Colors.dark,
  },
  subtitle: {
    textAlign: "center",
    color: Colors.gray,
    marginBottom: 32,
    lineHeight: 22,
  },
  loginBtn: {
    height: 56,
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
});
