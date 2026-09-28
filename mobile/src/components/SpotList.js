/* Lista horizontal de spots de uma tecnologia, com estados de carregando, vazio e erro */
import { useEffect, useState } from "react";
import { View, StyleSheet, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api, priceLabel } from "../lib/api";

export default function SpotList({ tech }) {
  const navigation = useNavigation();
  const [spots, setSpots] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let alive = true;
    api(`/spots?tech=${encodeURIComponent(tech)}`)
      .then((list) => { if (alive) { setSpots(list); setStatus("ok"); } })
      .catch(() => alive && setStatus("error"));
    return () => { alive = false; };
  }, [tech]);

  return (
    <View style={styles.container}>
      <Text style={styles.title} accessibilityRole="header">Empresas que usam <Text style={styles.bold}>{tech}</Text></Text>
      {status === "loading" && <Text style={styles.info}>Carregando…</Text>}
      {status === "error" && <Text style={styles.info}>Não foi possível carregar. Puxe para tentar de novo mais tarde.</Text>}
      {status === "ok" && spots.length === 0 && <Text style={styles.info}>Nenhum spot com {tech} por enquanto.</Text>}
      <FlatList
        style={styles.list}
        data={spots}
        keyExtractor={(spot) => spot._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Image style={styles.thumbnail} source={{ uri: item.thumbnail_url }} accessibilityIgnoresInvertColors />
            <Text style={styles.company}>{item.company}</Text>
            <Text style={styles.price}>{priceLabel(item.price)}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Book", { id: item._id, company: item.company })} style={styles.button}
              accessibilityRole="button" accessibilityLabel={`Solicitar reserva em ${item.company}`}>
              <Text style={styles.buttonText}>Solicitar reserva</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 30 },
  title: { fontSize: 20, color: "#444", paddingHorizontal: 20, marginBottom: 15 },
  bold: { fontWeight: "bold" },
  info: { color: "#555", paddingHorizontal: 20 },
  list: { paddingHorizontal: 20 },
  listItem: { marginRight: 15 },
  thumbnail: { width: 200, height: 120, resizeMode: "cover", borderRadius: 2, backgroundColor: "#eee" },
  company: { fontSize: 24, fontWeight: "bold", color: "#333", marginTop: 10 },
  price: { fontSize: 15, color: "#666", marginTop: 5 },
  button: { height: 44, backgroundColor: "#c7383a", justifyContent: "center", alignItems: "center", borderRadius: 2, marginTop: 15 },
  buttonText: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
});
/* Fim de SpotList.js */
