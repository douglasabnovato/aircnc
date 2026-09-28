/* Login do dev: e-mail, senha e tecnologias de interesse; pula direto para a lista se já houver sessão */
import { useEffect, useState } from "react";
import { View, KeyboardAvoidingView, Platform, Image, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, splitTechs } from "../lib/api";
import logo from "../assets/logo.png";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [techs, setTechs] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(["token", "techs"]).then(([[, token], [, saved]]) => {
      if (token && saved) navigation.replace("List");
    });
  }, [navigation]);

  /* Valida, cria a sessão e guarda token e tecnologias */
  async function handleSubmit() {
    const list = splitTechs(techs);
    if (!list.length) return setError("Informe ao menos uma tecnologia.");
    setError("");
    setBusy(true);
    try {
      const { token } = await api("/sessions", { method: "POST", body: { email, password } });
      await AsyncStorage.multiSet([["token", token], ["techs", list.join(",")]]);
      navigation.replace("List");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Image source={logo} accessibilityLabel="AirCnC" />
      <View style={styles.form}>
        <Text style={styles.label} nativeID="lbl-email">SEU E-MAIL *</Text>
        <TextInput style={styles.input} accessibilityLabelledBy="lbl-email" accessibilityLabel="Seu e-mail" placeholder="Seu e-mail"
          placeholderTextColor="#767676" keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
          value={email} onChangeText={setEmail} />
        <Text style={styles.label} nativeID="lbl-senha">SENHA * (mín. 8; no primeiro acesso cria a conta)</Text>
        <TextInput style={styles.input} accessibilityLabelledBy="lbl-senha" accessibilityLabel="Senha" placeholder="Sua senha"
          placeholderTextColor="#767676" secureTextEntry autoCapitalize="none" autoComplete="password" autoCorrect={false}
          value={password} onChangeText={setPassword} />
        <Text style={styles.label} nativeID="lbl-techs">TECNOLOGIAS *</Text>
        <TextInput style={styles.input} accessibilityLabelledBy="lbl-techs" accessibilityLabel="Tecnologias de interesse, separadas por vírgula"
          placeholder="Ex.: React, Node" placeholderTextColor="#767676" autoCapitalize="words" autoCorrect={false}
          value={techs} onChangeText={setTechs} />
        {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        <TouchableOpacity onPress={handleSubmit} style={styles.button} disabled={busy} accessibilityRole="button" accessibilityState={{ busy }}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Encontrar spots</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  form: { alignSelf: "stretch", paddingHorizontal: 30, marginTop: 30 },
  label: { fontWeight: "bold", color: "#444", marginBottom: 8 },
  input: { borderWidth: 1, borderColor: "#767676", paddingHorizontal: 20, fontSize: 16, color: "#444", height: 48, marginBottom: 20, borderRadius: 2 },
  error: { color: "#b3261e", marginBottom: 12 },
  button: { height: 48, backgroundColor: "#c7383a", justifyContent: "center", alignItems: "center", borderRadius: 2 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
/* Fim de Login.js */
