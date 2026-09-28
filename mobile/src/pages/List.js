/* Lista de spots por tecnologia; recebe em tempo real a resposta das reservas e permite sair */
import { useEffect, useLayoutEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Image, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import SpotList from "../components/SpotList";
import { API_URL, dateBR } from "../lib/api";
import logo from "../assets/logo.png";

export default function List({ navigation }) {
  const [techs, setTechs] = useState([]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity accessibilityRole="button" onPress={logout}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
      ),
    });
  });

  /* Apaga a sessão e volta ao login */
  async function logout() {
    await AsyncStorage.multiRemove(["token", "techs"]);
    navigation.replace("Login");
  }

  useEffect(() => {
    let socket;
    AsyncStorage.multiGet(["token", "techs"]).then(([[, token], [, saved]]) => {
      setTechs((saved || "").split(",").map((t) => t.trim()).filter(Boolean));
      socket = io(API_URL, { auth: { token } });
      socket.on("booking_response", (b) => {
        Alert.alert("Reserva", `Sua reserva em ${b.spot?.company} para ${dateBR(b.date)} foi ${b.approved ? "APROVADA" : "REJEITADA"}.`);
      });
    });
    return () => socket?.disconnect();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <Image style={styles.logo} source={logo} accessibilityLabel="AirCnC" />
      <ScrollView>
        {techs.map((tech) => <SpotList key={tech} tech={tech} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  logo: { height: 32, resizeMode: "contain", alignSelf: "center", marginTop: 10 },
  logout: { color: "#c7383a", fontWeight: "bold", fontSize: 16, padding: 8 },
});
/* Fim de List.js */
