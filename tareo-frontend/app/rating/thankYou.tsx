import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Colors } from "../../constants/colors";

export default function ThankYou() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/pages/home");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient colors={["#11C5D9", "#001F24"]} style={styles.container}>
      <View style={styles.circle}>
        <Ionicons name="checkmark" size={36} color={Colors.white} />
      </View>
      <Text style={styles.title}>Thank You</Text>
      <Text style={styles.subtitle}>Your feedback helps improve TAREO.</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    marginBottom: 6,
  },
  subtitle: { fontSize: 13, color: "#D1D5DB", textAlign: "center" },
});
