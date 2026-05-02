import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../../constants/colors";

const PrivacySecurity = () => {
  const router = useRouter();

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
          <Text style={styles.headerTitle}>Privacy & Security</Text>
        </View>

        <View style={styles.hero}>
          <Ionicons
            name="shield-checkmark-outline"
            size={36}
            color={Colors.primary}
          />
          <Text style={styles.heroTitle}>Your privacy matters</Text>
          <Text style={styles.heroDesc}>
            We take your data protection and security seriously.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Privacy</Text>

        <View style={styles.card}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={Colors.primary}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Data Encryption</Text>
            <Text style={styles.cardText}>
              All your conversations and personal data are encrypted end-to-end
              to ensure maximum privacy.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="eye-off-outline" size={20} color={Colors.primary} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>No Data Sharing</Text>
            <Text style={styles.cardText}>
              We never share your personal information with third parties
              without your consent.
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>Security</Text>

        <View style={styles.card}>
          <Ionicons name="key-outline" size={20} color={Colors.primary} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Account Protection</Text>
            <Text style={styles.cardText}>
              Secure login methods and continuous monitoring help keep your
              account safe.
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Ionicons name="refresh-outline" size={20} color={Colors.primary} />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Password Management</Text>
            <Text style={styles.cardText}>
              You can update your password anytime to maintain full control over
              your account security.
            </Text>
          </View>
        </View>

        <Text style={styles.footerText}>
          If you have any questions about privacy or security, please contact
          our support team.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacySecurity;

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
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  cardContent: { flex: 1 },
  cardTitle: { fontWeight: "600", color: Colors.dark, marginBottom: 4 },
  cardText: { fontSize: 13, color: Colors.gray, lineHeight: 18 },
  footerText: {
    marginTop: 24,
    fontSize: 12,
    color: Colors.lightGray,
    textAlign: "center",
  },
});
