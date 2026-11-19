# MVP — aircnc

> Revisto em 09/11/2026 (ciclo de 07/11/2026); critério 9 revisto em 16/11/2026 (14h39), com os alertas do Dependabot e a ADR-06; critérios 8, 9 e 11 revistos em 18/11/2026 (axe no e2e, tempo real encerrado no fim do token e testes do MongoDB, PR #115). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24, no clone da `feature/2026-11-07`. Não houve teste com pessoas nem em aparelho real.

**Resumo:** 10 de 10 aplicáveis atendidos

**Finalizado:** sim — o critério 9 voltou a Atende em 16/11/2026: os 3 alertas do Dependabot no app estão corrigidos na sprint-19 ou cobertos pela [ADR-06](adr/0006-aceitar-alertas-de-desenvolvimento-do-dependabot.md). Publicado em 09/11/2026: <https://aircnc-web.onrender.com> (API: <https://aircnc-api-45yf.onrender.com/health>).

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: empresas oferecem spots para programadores, que pedem reserva. | README, 09/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção "Hipótese"; sem validação com pessoas. | Seção "Hipótese", 09/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: no navegador, a empresa entra, cadastra o spot com imagem, recebe o pedido em tempo real, aprova e vê a recusa da aprovação em dobro. O pedido do dev usa as mesmas chamadas da API que o app faz; a tela do app não foi aberta (sem aparelho). | `npm run test:e2e` em `frontend` (Playwright 1.65, Chromium local, API `npm run demo` em memória, dados de demonstração criados pelo teste): 1 passed, 09/11/2026; job `e2e` no CI |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". | 09/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: erro da API, estado vazio, "Carregando…", falha de rede e aprovação em dobro (409 com aviso, pedido mantido na lista). | `npm test` em `frontend`: 8 passed, 09/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). `aircnc-web.onrender.com` respondeu 404 em 09/11/2026. | `curl`, 09/11/2026; #88 |
| 8 | Acessibilidade básica | axe e teclado | Atende: o teste de ponta a ponta roda o axe (WCAG 2.1 A e AA) no login, no cadastro e no painel com pedido pendente, em largura de desktop e com dados criados pelo teste; falha também com contraste não medido. Login em 375 px com axe e sem rolagem lateral (o app não tem tema escuro). O teste acha os campos pelos rótulos; foco visível conferido no ciclo de 02/11/2026. Sem teste só de teclado. | `npx playwright test` em `frontend` (`@axe-core/playwright` 4.14, Chromium, API de demonstração), 18/11/2026: 2 passed, 0 violações; sem o `alt` do logo, falha com `image-alt`. Job `e2e` no CI do PR #115 (run 44416965358, verde) |
| 9 | Segurança e conformidade | Riscos decididos | Atende: 1 alerta aberto do Dependabot, 0 sem decisão. #1204 `minimatch` 10.2.6 (médio, via `expo` → `@expo/fingerprint`, em `mobile/package-lock.json`): na [ADR-06](adr/0006-aceitar-alertas-de-desenvolvimento-do-dependabot.md), porque não entra no bundle do app. #1175 `glob`: corrigido na `master` em 16/11/2026 (PR #112). #1163 `deepmerge`: o aviso foi retirado pelo GitHub (API 410). API e web sem alertas. | `gh api "repos/douglasabnovato/aircnc/dependabot/alerts?state=open&per_page=100"`, 18/11/2026 20h03: 1 aberto (#1204, médio, na ADR-06); `gh api .../dependabot/alerts/1175`: fixed em 16/11/2026; `.../alerts/1163`: 410 "withdrawn". Bundle do app sem `minimatch` (`npx expo export --platform android --source-maps`, 856 módulos, 16/11/2026) |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Atende: ruleset `principal-protegida` ativo na `master` (sem bypass): exige PR, os checks `backend`, `frontend`, `mobile` e `e2e`, e bloqueia exclusão e force push. O Render publica a cada commit na `master`. | `gh api repos/douglasabnovato/aircnc/rules/branches/master`, 09/11/2026: deletion, non_fast_forward, pull_request, required_status_checks; #89 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 20 na API (15 com repositório em memória, inclusive o fim do token no tempo real, e 5 com o repositório do MongoDB num banco em memória, inclusive o índice de aprovação única), 10 no web, 3 no app e 2 de ponta a ponta no navegador. | `npm test` em `backend` (20 pass, 0 skipped) e em `frontend` (10 pass) e `npx playwright test` (2 pass), 18/11/2026; app 3 pass, 09/11/2026; CI do PR #115 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`, inclusive `npm run demo` e `npm run test:e2e`; aviso de estudo; estado e próximos passos. | README, 09/11/2026 |

## Hipótese (proposta)

Praticar API, web e app móvel: cadastrar um spot e aprovar uma reserva.

## Fora do MVP

Pagamento, avaliações e calendário de disponibilidade.

## Neste ciclo (07/11/2026)

Fluxo principal percorrido no navegador com Playwright e job `e2e` no CI (#92); `zod` vulnerável fora do app sem trocar de SDK (#90); aprovação em dobro recusada na API, no banco e no painel (#91); servidor de demonstração em memória (`npm run demo`).

## Histórico

- 18/11/2026: axe no teste de ponta a ponta (#98), tempo real encerrado quando o token vence (#93) e testes do repositório do MongoDB (#100), no PR #115. Critérios 8 e 11 seguem em Atende, agora com evidência automática. Critério 9 segue em Atende, com 1 alerta aberto (de 3 para 1). Resumo segue 10 de 10.
- 16/11/2026 (tarde): a ADR-06 registra os 2 alertas que não chegam à produção (`minimatch` e `deepmerge`), pela ordem do responsável. O critério 9 voltou a Atende; Resumo de 9 para 10 de 10; Finalizado de "não" para "sim".
- 16/11/2026: com os alertas do Dependabot ligados, o critério 9 caiu de Atende para Parcial (3 alertas no app; 1 corrigido na sprint-19, 2 na #111). Resumo de 10 para 9 de 10; Finalizado de "sim" para "não". O "Atende" de 09/11/2026 já contava 4 alertas moderados abertos sem decisão escrita.

### Tabela de 06/11/2026 (ciclo de 03/11/2026): 7 de 10 aplicáveis atendidos

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: empresas oferecem spots para programadores, que pedem reserva. | README, 06/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: proposta na seção 2; sem validação com pessoas. | Seção 2, 06/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: no navegador só login e painel vazio. Cadastro de spot e reserva cobertos por testes da API, não percorridos na tela. | #92 |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. | 06/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: erro da API, estado vazio, "Carregando…" e falha de rede no login e no painel, com testes. | `frontend/src/__tests__/app.test.jsx` (7 testes), 06/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). O site respondeu 404 em 06/11/2026. | #88 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 2 telas; foco visível; sem rolagem em 375 px. | Ciclo de 02/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: a API está sem alerta alto; resta o alerta alto do `zod` no app, que só sai com o Expo 58 (#78, CI vermelho). Os `yarn.lock` esquecidos, que duplicavam alertas, saíram. | `gh api .../dependabot/alerts`, 06/11/2026; #90 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI roda em PR e push para `master` e `developer/**`, mas a `master` não tem proteção. | API `branches/master/protection` = 404, 06/11/2026; #89 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 13 na API, 7 no web, testes do app. | CI, 06/11/2026 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; aviso de estudo; seção de estado e próximos passos. | README, 06/11/2026 |

