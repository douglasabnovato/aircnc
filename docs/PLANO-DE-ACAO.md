# Plano de ação — AirCnC

Timebox: 60 min.

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | Credenciais fora do código (D1) | Alto | Baixo | ✅ (trocar a senha no Atlas: ação sua) |
| Must | Token assinado, dono aprova, POST (D2, D3, D6) | Alto | Médio | ✅ |
| Must | Reserva e aprovação funcionando (D4, D5, D7) | Alto | Baixo | ✅ |
| Must | Upload seguro (D8) | Alto | Baixo | ✅ |
| Should | Pedidos pendentes persistentes | Médio | Baixo | ✅ |
| Should | Web em Vite + acessibilidade (D10) | Médio | Médio | ✅ axe 0 |
| Should | Mobile compatível com Expo atual (D9) | Médio | Médio | ✅ código; ⏳ validar no celular |
| Should | Testes API + web | Médio | Médio | ✅ 17 |
| Could | Login com link mágico por e-mail | Alto | Médio | **Decisão sua** |
| Could | Imagens no Cloudinary (disco do Render é efêmero) | Médio | Médio | **Decisão sua** |
| Could | Dev ver o histórico das próprias reservas no app | Médio | Baixo | Próximo ciclo |

## Riscos

- No Render Free o disco é apagado a cada deploy: imagens enviadas somem. Para uso real, adote Cloudinary (grátis) ou outro storage.
- Reservas antigas gravadas com o campo `data` não têm data; ficam fora da lista de pendentes somente se já respondidas.
