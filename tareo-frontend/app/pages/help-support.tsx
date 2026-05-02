import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
  Linking,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Colors } from "../../constants/colors";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const faqs = [
  {
    q: "How does TAREO work?",
    a: "TAREO provides AI-powered therapeutic support through secure text and video sessions tailored to your needs.",
  },
  {
    q: "Is my data secure?",
    a: "Yes. All conversations are encrypted and your personal data is fully protected.",
  },
  {
    q: "Can I change my password?",
    a: "You can change your password anytime from Profile > Change Password.",
  },
  {
    q: "Is TAREO free?",
    a: "TAREO offers both free and premium features depending on your subscription.",
  },
];

const HelpSupport = () => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    LayoutAnimation.easeInEaseOut();
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleEmailSupport = () => {
    Linking.openURL("mailto:support@tareo.app");
  };

  const handleLiveChat = () => {
    Alert.alert(
      "Live Chat",
      "Our support team is available 24/7. Start a conversation?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Start Chat", onPress: () => console.log("Start live chat") },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.dark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
        </View>

        <View style={styles.hero}>
          <Ionicons
            name="help-circle-outline"
            size={36}
            color={Colors.primary}
          />
          <Text style={styles.heroTitle}>How can we help you?</Text>
          <Text style={styles.heroDesc}>
            Find answers or reach out to our support team.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        {faqs.map((item, index) => {
          const isOpen = activeIndex === index;
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={0.9}
              onPress={() => toggleFAQ(index)}
              style={styles.faqCard}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.question}>{item.q}</Text>
                <Ionicons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.primary}
                />
              </View>
              {isOpen && <Text style={styles.answer}>{item.a}</Text>}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>
          Contact Support
        </Text>

        <TouchableOpacity style={styles.item} onPress={handleEmailSupport}>
          <Ionicons name="mail-outline" size={20} color={Colors.primary} />
          <View>
            <Text style={styles.itemTitle}>Email us</Text>
            <Text style={styles.itemSub}>support@tareo.app</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={handleLiveChat}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={20}
            color={Colors.primary}
          />
          <View>
            <Text style={styles.itemTitle}>Live Chat</Text>
            <Text style={styles.itemSub}>Chat with our support team</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupport;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: 20, paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },
  hero: { alignItems: "center", marginBottom: 32 },
  heroTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
    color: Colors.dark,
  },
  heroDesc: { textAlign: "center", color: Colors.gray, marginTop: 6 },
  sectionTitle: { fontSize: 13, color: Colors.lightGray, marginBottom: 12 },
  faqCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  question: { fontWeight: "600", color: Colors.dark, flex: 1, marginRight: 10 },
  answer: { marginTop: 10, fontSize: 13, color: Colors.gray, lineHeight: 18 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  itemTitle: { fontWeight: "500", color: Colors.dark },
  itemSub: { fontSize: 12, color: Colors.gray },
});
