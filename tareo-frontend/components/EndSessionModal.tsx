import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { Colors } from "../constants/colors";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
};

export default function EndSessionModal({
  visible,
  onCancel,
  onConfirm,
  title = "End Session",
  description = "Are you sure you want to end this session?",
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.text}>{description}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, styles.cancel]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.end]}
              onPress={onConfirm}
            >
              <Text style={styles.endText}>End</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "80%",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: Colors.dark,
  },
  text: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
    color: "#4B5563",
  },
  buttons: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 10, alignItems: "center" },
  cancel: { backgroundColor: "#F3F4F6" },
  end: { backgroundColor: "#EF4444" },
  cancelText: { color: Colors.dark, fontWeight: "500" },
  endText: { color: Colors.white, fontWeight: "500" },
});
