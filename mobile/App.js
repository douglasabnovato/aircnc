/* Raiz do app: navegação em pilha (Login → Lista → Reserva) com React Navigation 7 */
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import Login from "./src/pages/Login";
import List from "./src/pages/List";
import Book from "./src/pages/Book";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="List" component={List} options={{ title: "Spots", headerBackVisible: false }} />
        <Stack.Screen name="Book" component={Book} options={{ title: "Solicitar reserva" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
/* Fim de App.js */
