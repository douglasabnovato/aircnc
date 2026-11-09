# MVP — aircnc

> Revisto em 09/11/2026 (ciclo de 07/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24, no clone da `feature/2026-11-07`. Não houve teste com pessoas nem em aparelho real.

**Resumo:** 9 de 10 aplicáveis atendidos

**Finalizado:** sim — o único critério aplicável que falta (10) depende do responsável e tem a issue #89 com o rótulo `depende-do-responsavel`.

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: empresas oferecem spots para programadores, que pedem reserva. | README, 09/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: seção "Hipótese"; sem validação com pessoas. | Seção "Hipótese", 09/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: no navegador, a empresa entra, cadastra o spot com imagem, recebe o pedido em tempo real, aprova e vê a recusa da aprovação em dobro. O pedido do dev usa as mesmas chamadas da API que o app faz; a tela do app não foi aberta (sem aparelho). | `npm run test:e2e` em `frontend` (Playwright 1.65, Chromium local, API `npm run demo` em memória, dados de demonstração criados pelo teste): 1 passed, 09/11/2026; job `e2e` no CI |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção "Fora do MVP". | 09/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: erro da API, estado vazio, "Carregando…", falha de rede e aprovação em dobro (409 com aviso, pedido mantido na lista). | `npm test` em `frontend`: 8 passed, 09/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). `aircnc-web.onrender.com` respondeu 404 em 09/11/2026. | `curl`, 09/11/2026; #88 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 2 telas; foco visível; sem rolagem em 375 px. O teste de ponta a ponta acha os campos pelos rótulos. | Ciclo de 02/11/2026; `fluxo.e2e.js`, 09/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Atende: o `zod` 3 vulnerável (alerta alto GHSA-mrhx-c7xc-m3w5) saiu do app ao subir o `expo` para 57.0.32 (o `@expo/cli` 57.0.33 não usa `zod`), sem trocar de SDK. Restam 4 alertas moderados em ferramentas de build do app (`glob`, `minimatch` e quem depende deles); API e web com 0 alertas no `npm audit`. O alerta do Dependabot fecha quando a mudança chegar à `master`. | `grep -c node_modules/zod mobile/package-lock.json` = 0 e `npm audit` no app: 0 alto, 4 moderados, 8 baixos, 09/11/2026 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI roda em PR e push para `master` e `developer/**`, mas a `master` não tem proteção. | API `branches/master/protection` = 404, 09/11/2026; #89 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 14 na API, 8 no web, 3 no app e 1 de ponta a ponta no navegador. | `npm test` (API 14 pass, web 8 pass, app 3 pass) e `npm run test:e2e` (1 pass), 09/11/2026 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`, inclusive `npm run demo` e `npm run test:e2e`; aviso de estudo; estado e próximos passos. | README, 09/11/2026 |

## Hipótese (proposta)

Praticar API, web e app móvel: cadastrar um spot e aprovar uma reserva.

## Fora do MVP

Pagamento, avaliações e calendário de disponibilidade.

## Neste ciclo (07/11/2026)

Fluxo principal percorrido no navegador com Playwright e job `e2e` no CI (#92); `zod` vulnerável fora do app sem trocar de SDK (#90); aprovação em dobro recusada na API, no banco e no painel (#91); servidor de demonstração em memória (`npm run demo`).

## Histórico

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

