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

const About = () => {
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
          <Text style={styles.headerTitle}>About</Text>
        </View>

        <View style={styles.logo}>
          <Text style={styles.logoText}>T</Text>
        </View>

        <Text style={styles.title}>TAREO</Text>
        <Text style={styles.subtitle}>
          Therapeutic Assistant for Real-time{"\n"}
          Evaluation and Optimization
        </Text>
        <Text style={styles.version}>Version 1.0.0</Text>

        <Text style={styles.sectionTitle}>Legal</Text>

        <TouchableOpacity style={styles.item}>
          <Ionicons
            name="document-text-outline"
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.itemText}>Terms of Service</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color={Colors.primary}
          />
          <Text style={styles.itemText}>Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item}>
          <Ionicons name="document-outline" size={20} color={Colors.primary} />
          <Text style={styles.itemText}>Licenses</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>© 2026 TAREO. All rights reserved.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default About;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  container: { paddingHorizontal: 20, paddingBottom: 40, alignItems: "center" },
  header: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
    color: Colors.dark,
  },
  logo: {
    width: 96,
    height: 96,
    borderRadius: 26,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoText: { color: Colors.white, fontSize: 42, fontWeight: "700" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
    color: Colors.dark,
  },
  subtitle: { textAlign: "center", color: Colors.gray, lineHeight: 20 },
  version: {
    marginTop: 10,
    marginBottom: 32,
    color: Colors.primary,
    fontWeight: "500",
  },
  sectionTitle: {
    width: "100%",
    fontSize: 13,
    color: Colors.lightGray,
    marginBottom: 10,
  },
  item: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 12,
  },
  itemText: { fontSize: 14, fontWeight: "500", color: Colors.dark },
  footer: { marginTop: 40, fontSize: 12, color: Colors.lightGray },
});
