/* Pedido de reserva: data em DD/MM/AAAA validada pela API, com mensagens na tela */
import { useState } from "react";
import { Alert, StyleSheet, TextInput, TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { api } from "../lib/api";

/* Máscara simples DD/MM/AAAA enquanto o usuário digita */
function maskDate(text) {
  const d = text.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
}

export default function Book({ route, navigation }) {
  const { id, company } = route.params;
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  /* Envia o pedido e volta para a lista */
  async function handleSubmit() {
    setError("");
    setBusy(true);
    try {
      await api(`/spots/${id}/bookings`, { method: "POST", body: { date } });
      Alert.alert("Pedido enviado", `A empresa ${company} vai responder em breve.`);
      navigation.goBack();
    } catch (err) {
      if (err.status === 401) navigation.replace("Login");
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Text style={styles.title}>{company}</Text>
      <Text style={styles.label} nativeID="lbl-date">DATA DE INTERESSE *</Text>
      <TextInput style={styles.input} accessibilityLabelledBy="lbl-date" accessibilityLabel="Data de interesse, dia, mês e ano"
        placeholder="DD/MM/AAAA" placeholderTextColor="#767676" keyboardType="number-pad" value={date} onChangeText={(t) => setDate(maskDate(t))} />
      {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
      <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={busy} accessibilityRole="button">
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Solicitar reserva</Text>}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, styles.cancelButton]} accessibilityRole="button">
        <Text style={styles.cancelText}>Cancelar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  label: { fontWeight: "bold", color: "#444", marginBottom: 8, marginTop: 30 },
  input: { borderWidth: 1, borderColor: "#767676", paddingHorizontal: 20, fontSize: 16, color: "#444", height: 48, marginBottom: 20, borderRadius: 2 },
  error: { color: "#b3261e", marginBottom: 12 },
  button: { height: 48, backgroundColor: "#c7383a", justifyContent: "center", alignItems: "center", borderRadius: 2 },
  cancelButton: { backgroundColor: "#e6e6e6", marginTop: 10 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  cancelText: { color: "#333", fontWeight: "bold", fontSize: 16 },
});
/* Fim de Book.js */
