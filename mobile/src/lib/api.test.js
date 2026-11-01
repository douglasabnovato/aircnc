/* Testes das funções puras do cliente da API */
import { splitTechs, priceLabel, dateBR } from "./api";

jest.mock("@react-native-async-storage/async-storage", () => ({ getItem: jest.fn() }));

test("splitTechs remove vazios e duplicados", () => {
  expect(splitTechs("React, react, , Node")).toEqual(["React", "Node"]);
});

test("priceLabel formata o preço ou mostra GRATUITO", () => {
  expect(priceLabel(50)).toBe("R$ 50,00/dia");
  expect(priceLabel(0)).toBe("GRATUITO");
});

test("dateBR converte a data", () => {
  expect(dateBR("2026-10-05")).toBe("05/10/2026");
});
/* Fim de api.test.js */
