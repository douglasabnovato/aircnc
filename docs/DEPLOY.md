# Deploy · AirCnC

Plano de ação para publicar a API e o painel web em hospedagem gratuita. O app mobile (Expo) fica fora do deploy: roda no Expo Go apontando para a API publicada.

## 1. Desafio

Colocar no ar, sem custo, uma aplicação com API Express 5 + MongoDB, **upload de imagens** e **tempo real com Socket.IO**, depois de um vazamento: a senha do usuário `dbAircnc` do MongoDB Atlas ficou no histórico do Git e continua pública.

## 2. Conteúdo

### Decisão de hospedagem

| Opção | Resultado |
|---|---|
| **Render: API (web service Free) + web (site estático) + MongoDB Atlas M0 (escolhida)** | Blueprint pronto em `render.yaml`; o Render mantém a conexão WebSocket do Socket.IO |
| Web no GitHub Pages + API no Render | Funciona, mas o `BrowserRouter` exigiria `base`, `basename` e `404.html`; o estático do Render já tem a regra de rewrite e fica no mesmo Blueprint |
| API em funções serverless (Vercel/Netlify) | Não mantêm WebSocket nem disco para os uploads |
| VPS | Fora da regra do portfólio (só hospedagem gratuita) |

### Banco: um cluster M0 para todos os apps

Recomendação para o lote (my-money-app, aircnc e instagram-feed): **um único cluster M0**, com **um usuário e um banco por app**.

| App | Usuário do Atlas | Banco (na URI) | Permissão |
|---|---|---|---|
| my-money-app | `mymoney-app` | `mymoney` | `readWrite` só em `mymoney` |
| aircnc | `aircnc-app` | `aircnc` | `readWrite` só em `aircnc` |
| instagram-feed | `instarocket-app` | `instarocket` | `readWrite` só em `instarocket` |

- Uma senha vazada passa a afetar só um app.
- **Network Access**: `0.0.0.0/0`. O Render Free não tem IP fixo; a proteção fica na senha forte de cada usuário.
- A URI leva o nome do banco antes do `?`: `mongodb+srv://aircnc-app:SENHA@SEU-CLUSTER.xxxxx.mongodb.net/aircnc?retryWrites=true&w=majority`
- Use senha só com letras e números (**Autogenerate Secure Password**). `@`, `:` e `/` quebram a URI se não forem codificados.
- **Dados antigos**: se quiser manter os spots da versão antiga, use na URI o **mesmo nome de banco** que eles já ocupam (veja em **Database → Browse Collections** do cluster antigo) e dê ao usuário `readWrite` nesse banco. Em banco novo, o app começa vazio.

### O que foi ajustado para produção

| Mudança | Arquivo | Por quê |
|---|---|---|
| `NODE_VERSION` `"22"` nos dois serviços | `render.yaml` | O Node 20 saiu de suporte em abril de 2026; o Vite 8 também pede Node recente no build |
| `autoDeployTrigger: commit` nos dois serviços | `render.yaml` | Cada `git push` na `master` publica sozinho |
| `CORS_ORIGINS` = `https://aircnc-web.onrender.com` e `PUBLIC_URL` = `https://aircnc-api.onrender.com` fixados | `render.yaml` | CORS da API e do Socket.IO já liberam o web publicado; as URLs das imagens saem com o endereço público |
| `VITE_API_URL` = `https://aircnc-api.onrender.com` fixado | `render.yaml` | O web já nasce apontando para a API (HTTP e Socket.IO) |
| Rewrite `/*` → `/index.html` (já existia) | `render.yaml` | F5 em `/dashboard` e `/new` não dá 404 |
| CI no Node 22 | `ci/github-actions-ci.yml` | Mesma versão do Render |
| `babel-preset-expo` nos `devDependencies` do mobile | `mobile/package.json`, `mobile/package-lock.json` | O `babel.config.js` usa esse preset, mas ele só existia dentro de `node_modules/expo`; o `expo export` do CI falhava com `Cannot find module 'babel-preset-expo'` |
| Seção "Em produção" | `Readme.md` | URL e link para este guia |

### Limitações conhecidas do plano gratuito

- **Uploads em disco temporário**: o Render Free apaga o disco a cada deploy e a cada vez que a API dorme e acorda. As imagens enviadas no ar somem (o spot continua no banco, com a imagem quebrada). As imagens que estão versionadas em `backend/uploads/` continuam sendo servidas, porque vêm junto com o código. Guardar as imagens num serviço externo gratuito (Cloudinary) é uma decisão sua, não implementada.
- A API dorme após 15 min sem acesso e leva cerca de 1 min para acordar; a primeira ação do dia pode mostrar erro de conexão.
- As 750 horas gratuitas por mês são da conta inteira do Render (o site estático não consome essas horas).
- Atlas M0: 512 MB, compartilhados entre os bancos do cluster.

### Segurança e LGPD

- Login com e-mail + senha (scrypt, mínimo de 8 caracteres), token assinado, limite de tentativas, upload só de JPEG/PNG/WebP até 2 MB com nome aleatório, tempo real autenticado por sala de usuário.
- Dados guardados: e-mail, empresa, tecnologias, preço, datas de reserva e imagens enviadas. Para o portfólio, oriente quem testar a usar e-mail e imagens fictícios.
- Nunca versione `backend/.env` nem `mobile/.env` (os `.gitignore` já os excluem).

## 3. Solução (passo a passo)

### Etapa 0 · Segredos (urgente)

1. No **MongoDB Atlas → Database Access**, **apague o usuário `dbAircnc`**. A senha dele está no histórico público do Git e não pode ser reaproveitada; apagar o usuário é o que a invalida.
2. O `AUTH_SECRET` da produção é gerado pelo próprio Render (`generateValue`). Para rodar localmente, gere um:
   `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Etapa 1 · Atlas e validação local (Git Bash)

1. No Atlas, use (ou crie) o cluster **M0** do lote. **Database Access → Add New Database User**: usuário `aircnc-app`, senha gerada, **Specific Privileges** → `readWrite` no banco `aircnc` (ou no banco antigo, se for manter os dados).
2. **Network Access → Add IP Address → Allow Access from Anywhere** (`0.0.0.0/0`), se ainda não existir.
3. **Database → Connect → Drivers**: copiar a URI e acrescentar `/aircnc` antes do `?`.
4. `cd /c/ambiente-projeto/ser-mvp/aircnc`
5. Remover os arquivos substituídos no ciclo MVP:
   ```bash
   git rm -r backend/src/controllers
   git rm backend/src/routes.js backend/src/config/upload.js backend/yarn.lock frontend/yarn.lock mobile/yarn.lock
   git rm frontend/public/index.html frontend/src/index.js frontend/src/App.js frontend/src/routes.js frontend/src/services/api.js
   git rm frontend/src/pages/Dashboard/index.js frontend/src/pages/Login/index.js frontend/src/pages/New/index.js
   git rm mobile/src/routes.js mobile/src/services/api.js
   ```
6. Opcional, **só se for começar com banco vazio**: tirar do Git as imagens antigas enviadas por usuários (no ar, os spots antigos ficariam sem imagem):
   `git rm -r --cached backend/uploads && echo "uploads/" >> backend/.gitignore`
7. `cd backend && cp .env.example .env` e preencher `MONGODB_URI` (passo 3) e `AUTH_SECRET` (Etapa 0).
8. `npm ci && npm test` (esperado: 13 testes passando).
9. `npm run dev` e abrir `http://localhost:3333/health` (esperado: `{"status":"ok"}`). Encerrar com Ctrl+C.
10. `cd ../frontend && npm ci && npm test && npm run build` (esperado: 5 testes passando e a pasta `build/` criada).
11. `cd ../mobile && npm install` (atualiza o `node_modules` com o `babel-preset-expo`).

### Etapa 2 · Subir para o GitHub (branch `master`)

1. `cd /c/ambiente-projeto/ser-mvp/aircnc`
2. Ativar o CI: `mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci`
3. `git status` (não podem aparecer `.env`, `node_modules/` nem `build/`)
4. `git add -A`
5. `git commit -m "feat(deploy): Node 22, URLs do Render fixadas no blueprint, preset do Babel no mobile, CI ativo e guia de deploy"`
6. `git push origin master`
7. No GitHub, aba **Actions**: os jobs `backend`, `frontend` e `mobile` precisam ficar verdes. O passo `npx expo install --check` consulta a internet e não pôde ser testado aqui; se só ele falhar, veja a mensagem (ele aponta versões de pacotes a alinhar). O deploy no Render não depende do CI.

### Etapa 3 · Criar os serviços no Render

1. Entrar em **render.com** com a conta do GitHub e autorizar o repositório `aircnc`.
2. **New → Blueprint** e escolher `douglasabnovato/aircnc`, branch `master`.
3. O Render lista `aircnc-api` (Free) e `aircnc-web` (Static). Ele pede um único valor: **`MONGODB_URI`** → colar a URI da Etapa 1.
4. **Apply**. Acompanhar os **Logs** da API até aparecer `API em http://localhost:10000` (3 a 5 min).
5. Se o Render usar outro endereço porque o nome já existe, corrija `CORS_ORIGINS` e `PUBLIC_URL` (na API) e `VITE_API_URL` (no web) em **Environment**, e depois **Manual Deploy** no web.

### Etapa 4 · Conferir no ar

1. `https://aircnc-api.onrender.com/health` responde `{"status":"ok"}`.
2. `https://aircnc-web.onrender.com` abre o login. Entrar com um e-mail novo e senha de 8+ caracteres cria a conta.
3. Cadastrar um spot com imagem: ele aparece no painel com a foto.
4. F5 em `/dashboard`: continua no painel (rewrite funcionando).
5. Tempo real, sem o celular: com o painel aberto, rode no Git Bash (troque `ID_DO_SPOT` pelo `_id` que aparece em `https://aircnc-api.onrender.com/spots?tech=SUA_TECNOLOGIA`):
   ```bash
   TOKEN=$(curl -s -X POST https://aircnc-api.onrender.com/sessions -H "Content-Type: application/json" -d '{"email":"dev@teste.com","password":"Senha12345"}' | sed -E 's/.*"token":"([^"]+)".*/\1/')
   curl -s -X POST https://aircnc-api.onrender.com/spots/ID_DO_SPOT/bookings -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"date":"31/12/2026"}'
   ```
   O pedido de reserva aparece no painel na hora; aprovar ou rejeitar funciona.
6. No DevTools (aba Network), as chamadas e o WebSocket vão para `aircnc-api.onrender.com` sem erro de CORS.
7. Mobile (opcional): `mobile/.env` com `EXPO_PUBLIC_API_URL=https://aircnc-api.onrender.com`, `npx expo start` e testar no Expo Go.

### Etapa 5 · Fechar

1. Se as URLs reais forem diferentes das previstas, corrigir no `Readme.md`, commit e push.
2. No GitHub, **About → Website**: colar `https://aircnc-web.onrender.com`.
