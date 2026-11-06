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

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `master`. Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Empresas querem mostrar o espaço a programadores; programadores querem conhecer a empresa por um dia. O projeto é estudo da Semana Omnistack 9.

**Hipótese e meta.** Uma empresa cadastra um spot e aprova uma reserva sem ajuda. Meta de estudo: o fluxo inteiro roda na tela e nos testes.

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Evitar conflito de agenda é a função central de um sistema de reservas de espaço | Virou a #91: a API recusa aprovar dois pedidos no mesmo spot e data | [Officely: booking system for coworking](https://getofficely.com/blog/booking-system-coworking-spaces), [Clearooms: desk booking features](https://clearooms.com/blog/desk-booking-software-features/) |
| Disponibilidade em tempo real e histórico para quem reserva | O tempo real já existe; o histórico do dev virou a #94 | [Offision: must-have features](https://offision.com/blog/2024/10/15/10-must-have-features-for-desk-booking-software-to-elevate-your-workplace/) |
| No Socket.IO, o middleware confere o token só na conexão; conexões longas passam da validade | Virou a #93: desconectar quando o token vence | [Socket.IO: middlewares](https://socket.io/docs/v4/middlewares/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | CI nos PRs para a `developer` | Alto | Baixo | Este ciclo |
| 2 | Testes de falha de rede (critério 6) | Médio | Baixo | Este ciclo |
| 3 | Tirar código antigo e `yarn.lock` esquecidos | Médio | Baixo | Este ciclo |
| 4 | Dependabot e `zod` no app | Alto | Médio | #90 |
| 5 | Fluxo completo na tela | Alto | Médio | #92 |
| 6 | Bloquear reserva em dobro | Médio | Baixo | #91 |
| 7 | Desconectar socket com token vencido | Médio | Baixo | #93 |
| 8 | Histórico do dev no app | Médio | Médio | #94 |
| 9 | Publicar ou manter só local | Médio | Baixo | Responsável (#88) |
| 10 | Proteger a `master` | Alto | Baixo | Responsável (#89) |

**Fora do escopo.** Pagamento, avaliações, calendário por hora.

### Engenharia

**Arquitetura.** API Express em `backend/src/app.js`, com repositório trocável (`memory.js` nos testes, `mongo.js` com Mongoose). Tempo real em `realtime.js` (Socket.IO com JWT no handshake). Web em Vite + React 18 (`frontend/src`), app em Expo 57 (`mobile/`). Todos falam com a API por um cliente próprio em `lib/api.js`.

**Riscos.**
- O `expo` 57 traz um `zod` com alerta alto; a saída é o Expo 58, que hoje quebra o CI do app (#78, #90).
- Sem proteção na `master`, um push direto entra sem CI (#89).
- O disco do Render é apagado a cada deploy; imagens enviadas somem.

**Qualidade.**
- Testes: 13 na API (`node --test`), 7 no web (Vitest, inclui falha de rede), testes de `mobile/src/lib`.
- CI: agora também em PR e push para `developer/**`.
- Acessibilidade: axe sem violações em 2 telas (ciclo de 02/11).
- Segurança: segredos por `.env`; sem dados pessoais no código.

**Definição de pronto.** `npm ci` e `npm test` em `backend`, `frontend` e `mobile`; `npm run build` no web; CI verde no PR; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.**
1. CI nos PRs e pushes para `developer/**`.
2. Remove `backend/src/routes.js`, `backend/src/controllers`, `backend/src/config`, os arquivos antigos do CRA no web e `mobile/src/{routes.js,services}`, que nada importava, e os três `yarn.lock`. O `docs/DEPLOY.md` já mandava apagar.
3. Testes de falha de rede no login e no painel.
4. `docs/MVP.md` com a régua N1 e o critério 10 em "Parcial"; README com estado e próximos passos.

**Vira issue.** #88 e #89 (responsável); #90 a #94 (agente).
