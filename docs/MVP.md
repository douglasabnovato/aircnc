# MVP — aircnc

> Revisto em 06/11/2026 (ciclo de 03/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24, no clone da `feature/2026-11-06`. Não houve teste com pessoas nem em aparelho real.

**Finalizado: não.** Faltam o critério 3 (fluxo na tela, #92) e o 9 (alerta alto do `zod` no app, #90). O critério 10 depende do responsável (#89).

## 1. Critérios: 7 de 10 aplicáveis atendidos

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

## 2. Hipótese (proposta)

Praticar API, web e app móvel: cadastrar um spot e aprovar uma reserva.

## 3. Fora do MVP

Pagamento, avaliações e calendário de disponibilidade.

## 4. Neste ciclo

CI nos PRs para `developer/**`; código antigo sem uso e `yarn.lock` removidos; testes de falha de rede; documentação e 7 issues de próximos passos (#88 a #94).
