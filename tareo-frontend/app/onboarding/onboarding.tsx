import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/colors";

const { width } = Dimensions.get("window");

const slides = [
  {
    title: "Welcome to TAREO",
    highlight: "Your AI-Powered Therapeutic Assistant",
    description:
      "Experience personalized mental health support through advanced AI technology.",
    icon: "leaf-outline",
    button: "Continue",
  },
  {
    title: "Text Conversations",
    highlight: "Chat Anytime, Anywhere",
    description:
      "Have meaningful conversations with your AI assistant through secure text messaging.",
    icon: "chatbubble-outline",
    button: "Continue",
  },
  {
    title: "Video Sessions",
    highlight: "Face-to-Face Support",
    description:
      "Connect through video calls for deeper understanding and support.",
    icon: "videocam-outline",
    button: "Get Started",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const playAnimation = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.95);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (index < slides.length - 1) {
      flatRef.current?.scrollToOffset({
        offset: (index + 1) * width,
        animated: true,
      });
      setIndex(index + 1);
      playAnimation();
    } else {
      router.replace("/pages/home");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        onMomentumScrollEnd={(e) => {
          const slideIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(slideIndex);
          playAnimation();
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Animated.View
              style={[
                styles.content,
                { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
              ]}
            >
              <View style={styles.iconWrapper}>
                <View style={styles.iconBox}>
                  <Ionicons
                    name={item.icon as any}
                    size={28}
                    color={Colors.primary}
                  />
                </View>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.highlight}>{item.highlight}</Text>
              <Text style={styles.desc}>{item.description}</Text>
              <View style={styles.dots}>
                {slides.map((_, i) => (
                  <View
                    key={i}
                    style={[styles.dot, index === i && styles.activeDot]}
                  />
                ))}
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.button}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>{item.button}</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </TouchableOpacity>
              {index < slides.length - 1 && (
                <TouchableOpacity onPress={() => router.replace("/pages/home")}>
                  <Text style={styles.skip}>Skip</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  slide: {
    width,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 120,
  },
  content: { alignItems: "center", width: "100%" },
  iconWrapper: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: "#ECFEFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: Colors.dark,
  },
  highlight: { color: Colors.primary, fontWeight: "600", marginBottom: 16 },
  desc: {
    textAlign: "center",
    color: Colors.gray,
    lineHeight: 22,
    marginBottom: 32,
  },
  dots: { flexDirection: "row", marginBottom: 32 },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    marginHorizontal: 4,
  },
  activeDot: { width: 18, backgroundColor: Colors.primary },
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 56,
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 28,
    justifyContent: "center",
    marginBottom: 12,
  },
  buttonText: { color: Colors.white, fontSize: 16, fontWeight: "600" },
  skip: { color: Colors.lightGray },
});
