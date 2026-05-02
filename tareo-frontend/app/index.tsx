import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ActivityIndicator,
} from "react-native";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

export default function SplashScreen() {
  const router = useRouter();
  const { token, user, isLoading } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (token && user) {
          if (user.role === "admin") {
            router.replace("/admin/adminHome");
          } else {
            router.replace("/pages/home");
          }
        } else {
          router.replace("/auth/login");
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, token, user]);

  return (
    <LinearGradient
      colors={["#0FA3B1", "#0B6E77", "#042F35"]}
      style={styles.container}
    >
      <StatusBar style="light" />
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>TAREO</Text>
        <ActivityIndicator
          size="small"
          color="#FFFFFF"
          style={{ marginTop: 28 }}
        />
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  logo: { width: 90, height: 90, marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
});
