# Análise — AirCnC

## 1. Especificação

Empresas cadastram **spots** (espaços para devs visitarem ou trabalharem por um dia, grátis ou pagos); devs encontram spots pelas tecnologias que usam e pedem reserva; a empresa aprova ou rejeita e o dev é avisado na hora.

| Ator | Canal | Objetivo |
|---|---|---|
| Empresa | Web (React) | Cadastrar spots e responder pedidos |
| Dev | App (Expo) | Achar spots por tecnologia e pedir reserva |

### Requisitos funcionais

| ID | Requisito | Critério de aceite | Antes |
|---|---|---|---|
| RF01 | Entrar por e-mail | Sessão com token assinado | ⚠️ `_id` no localStorage, enviado como header livre |
| RF02 | Cadastrar spot | Imagem (JPEG/PNG/WebP ≤ 2 MB), empresa, techs, preço | ⚠️ aceitava qualquer arquivo |
| RF03 | Buscar por tecnologia | Sem diferenciar maiúsculas | ⚠️ exato |
| RF04 | Pedir reserva | Data válida, não passada, sem duplicar | ❌ quebrava (`res` indefinido) |
| RF05 | Aprovar / rejeitar | Só o dono, uma vez, dev avisado em tempo real | ❌ quebrava (`booking_id.save`) e rota errada no web |
| RF06 | Ver pedidos pendentes | Continuam visíveis após recarregar | ❌ só chegavam pelo socket |

## 2. Defeitos encontrados

| # | Severidade | Defeito | Referência |
|---|---|---|---|
| D1 | Crítica | Usuário e senha do MongoDB Atlas no código (`server.js`) | OWASP A02/A07:2025 |
| D2 | Crítica | Identidade = header `user_id` sem assinatura; ids expostos na listagem → qualquer um cadastra/aprova como outro | OWASP A01:2025 |
| D3 | Crítica | Aprovação/rejeição por **GET** sem checar dono | OWASP A01:2025 |
| D4 | Alta | Reserva e aprovação quebravam: `res` indefinido, `owerSocket`, `booking_id.save()`, `execPopulate` (removido no Mongoose 6) | — |
| D5 | Alta | Web chamava `POST /booking/...` (rota inexistente) | — |
| D6 | Alta | Socket aceitava qualquer `user_id` na query: qualquer um escutava as notificações de outro | OWASP A01:2025 |
| D7 | Média | Modelo com campo `data` e API gravando `date` → data da reserva nunca salva | — |
| D8 | Média | Upload sem filtro de tipo/tamanho e com nome original (path/HTML) | OWASP A05:2025 |
| D9 | Média | Mobile: `YellowBox` (removido no RN 0.64 → crash), react-navigation 4 misturado com 6, pacote `socket.io` (servidor) no app, IP fixo | — |
| D10 | Média | Contraste do botão (#f05a5b) e cinzas abaixo de AA; input de arquivo sem rótulo | WCAG 2.2 1.4.3, 1.3.1 |

## 3. Baseline automatizado

| Verificação | Antes | Depois |
|---|---|---|
| API sobe e reserva funciona | ❌ | ✅ (E2E com repositório em memória) |
| Testes | 0 | 12 API + 5 web |
| `npm audit` | vários (Express 4, Mongoose 5, CRA 4) | API 0, web 0, mobile 10 moderadas (tooling Expo) |
| axe-core | não executável | 0 violações |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 1 | 7 | E2E web+API (Playwright): login → cadastro com imagem → pedido → notificação em tempo real | Antes a reserva quebrava (booking_id.save, res indefinido, owerSocket) e o web chamava rota inexistente; agora roda de ponta a ponta. Máx. 7: mobile não executado em dispositivo |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 1 | 8 | testes 401/403/404/409 + telas de erro/vazio | Pedidos pendentes carregam ao recarregar (antes só via socket), datas passadas/duplicadas recusadas |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 3 | 8 | axe-core 0 violações (login, painel) | Contraste AA, foco visível, upload acessível por teclado; mobile com rótulos, não verificado em leitor de tela |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 1 | 7 | testes: token, dono aprova, upload só imagem, socket sem token recusado, e-mail sem a senha certa recebe 401 (13/13) | Senha do MongoDB estava no código; user_id no header permitia agir como qualquer um; login só por e-mail permitia entrar na conta alheia (auditoria independente) — agora e-mail + senha com scrypt |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 3 | 6 | índices únicos + zod; repositório Mongo não executado aqui | Campo data/date inconsistente corrigido; datas ISO; sem migração de dados antigos |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 8 | node:test 12 + vitest 5 | API, tempo real e telas testados; mobile sem testes |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 4 | 8 | createApp com DI, repositórios, sem controllers quebrados | Camadas claras; validação única no servidor |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 5 | 7 | imagens lazy, limite 2 MB | Sem Lighthouse |
| C9 | Operação | 12-Factor; DORA | 7% | 2 | 7 | render.yaml, .env.example, CI em ci/ | Sem URL publicada |
| C10 | Documentação | README como contrato | 5% | 5 | 8 | Readme + docs/ | Como rodar os 3 módulos, variáveis e deploy |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 4 | 7 | fluxo completo empresa↔dev | Resolve o problema do readme; sem métrica de uso |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 2 | 7 | npm audit 0 (API/web); mobile: 10 moderadas no tooling do Expo | Express 5, Mongoose 8, Vite 8, Expo SDK 57 (não compilado aqui) |

**Média ponderada:** antes **2,19** (REPROVADO) → depois **7,26** (APROVADO).

## Limitações da avaliação

- O MongoDB não roda neste ambiente: a API foi exercitada com o repositório em memória (mesmo contrato). O repositório Mongo precisa de um teste com o Atlas.
- O app Expo não foi executado em dispositivo (escopo combinado: mobile corrigido, não validado).
- Login passou a exigir senha (scrypt nativo do Node). E-mail novo cria a conta; contas antigas sem senha gravam a senha no primeiro acesso (quem entrar primeiro define a senha — veja a pendência).
