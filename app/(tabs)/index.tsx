import { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://text-readability-app.onrender.com";

export default function HomeScreen() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const predictReadability = async () => {
    if (!text.trim()) {
      setResult("Please enter some text first.");
      return;
    }

    const wordCount = text.trim().split(/\s+/).length;

    if (wordCount < 100) {
      setResult("Please enter at least 100 words.");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction failed.");
      }

      const data = await response.json();

      setResult(data.bt_easiness.toFixed(3));
    } catch (error) {
      console.error(error);

      setResult(
        "Unable to connect to the readability model."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Text Readability</Text>

          <Text style={styles.subtitle}>
            Paste a text below to predict its readability level.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Text</Text>

          <TextInput
            style={styles.input}
            multiline
            value={text}
            onChangeText={setText}
            placeholder="Paste your text here..."
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>
            {text.length} characters
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={predictReadability}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading
                ? "Predicting..."
                : "Predict Readability"}
            </Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              Predicted BT Easiness
            </Text>

            <Text style={styles.result}>
              {result}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },

  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 32,
  },

  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#172033",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#667085",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 15,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    elevation: 3,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#344054",
    marginBottom: 10,
  },

  input: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: "#D0D5DD",
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#101828",
    backgroundColor: "#FFFFFF",
  },

  characterCount: {
    marginTop: 8,
    marginBottom: 18,
    textAlign: "right",
    fontSize: 13,
    color: "#98A2B3",
  },

  button: {
    backgroundColor: "#5982A3",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  resultCard: {
    marginTop: 24,
    backgroundColor: "#EAF2F8",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
  },

  resultLabel: {
    fontSize: 14,
    color: "#667085",
    marginBottom: 8,
  },

  result: {
    fontSize: 28,
    fontWeight: "700",
    color: "#365F7D",
  },
});