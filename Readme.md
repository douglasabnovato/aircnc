<h1 align="center">
    <img alt="Aircnc" title="#delicinha" src=".github/logo.png" width="250px" />
</h1>

<h4 align="center">
  ☕ Code and coffee
</h4>

<p align="center">
  <img alt="GitHub language count" src="https://img.shields.io/github/languages/count/Rocketseat/semana-omnistack-9.svg">

  <img alt="Repository size" src="https://img.shields.io/github/repo-size/Rocketseat/semana-omnistack-9.svg">
  
  <a href="https://github.com/Rocketseat/semana-omnistack-9/commits/master">
    <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Rocketseat/semana-omnistack-9.svg">
  </a>

  <a href="https://github.com/Rocketseat/semana-omnistack-9/issues">
    <img alt="Repository issues" src="https://img.shields.io/github/issues/Rocketseat/semana-omnistack-9.svg">
  </a>

  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen">
</p>

<p align="center">
  <a href="#rocket-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-layout">Layout</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-como-contribuir">Como contribuir</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licença">Licença</a>
</p>

<br>

<p align="center">
  <img alt="Frontend" src=".github/aircnc.png" width="100%">
</p>

## :rocket: Tecnologias

Esse projeto foi desenvolvido com as seguintes tecnologias:

- [Node.js](https://nodejs.org/en/)
- [React](https://reactjs.org)
- [React Native](https://facebook.github.io/react-native/)
- [Expo](https://expo.io/)

## 💻 Projeto

O Aircnc é um projeto que visa conectar empresas que querem abrir spots e desenvolvedores que procuram um lugar para trocar ideias com devs, conhecer a empresa e trabalhar lá por um período. 

Compartilhar espaços de empresas para programadores externos conhecerem ou até mesmo, trabalharem. Promover esses espaços de forma gratuita ou alugada.

Um módulo para a empresa cadastrar seus espaços. E o outro módulo para quem está interessado em usar esse espaço.

#### Conhecendo a Omnistack 9.0
- [x] Aplicação que será desenvolvida
- [x] Tecnologias utilizadas
- [x] Configuração de Ambiente
- [x] Npm[6.14.6], Node[14.16.1], Yarn[1.22.10]
- [x] VSCode, Drácula Oficial, Material Icon Theme, Rocketseat Reactjs, Fira Code
- [x] Expo

#### Criando a base da aplicação
- [x] construir o back-end da sua aplicação
- [x] api rest: um backend separado do frontend 
- [x] `yarn add express` ou `npm add express` - localhost:3333 : rotas
- [x] `npm install nodemon -D` - reiniciar servidor node a cada alteração : error
- [x] `yarn dev` - rodar aplicação com o nodemon - `npm run dev`: error
- [x] mongoose : `yarn add mongoose` : editar o mongoDB 
- [x] Partner - MVC : estrutura de pastas 
- [x] Testar requisições Http: get, post, put, delete no insominia
- [x] Parâmetros - req.query: acessar query params para filtros
- [x] Parâmetros - req.params: acessar route params para edição e deleção
- [x] Parâmetros - req.body: acessar o corpo da requisição para criação e edição  
- [x] banco de dados: mongoDB atlas cloud 
- [x] Multer: armazenar arquivos: `npm install multer`

#### Construindo a interface web 
- [x] criar o projeto: `yarn create react-app frontend` 
- [x] rodar a aplicação frontend: `yarn run start`
- [x] iniciar projeto: `npm start`
- [x] Estrutura App.js e Estilização App.css
- [x] Primeira tela
- [x] Chamadas API: axios ou fetch
- [x] Fundamentos: componentização e estado
- [x] Configurar o cors no backend: `npm install cors`
- [x] comunicação com a api
- [x] salvando informações no localstorage
- [x] instalar e configurar sistema de rotas: `npm install react-router-dom`
- [x] instalar e configurar sistema de arquivo: useMemo
- [x] mudado de history.push() para navigate()

#### Desenvolvendo o app mobile  
- [x] Instalar expo: `npm install -g expo-cli` 
- [x] Criar projeto com expo: `expo init mobile --template blank` 
- [x] Navegação: `yarn add react-navigation` 
- [x] Animações Navegação: `expo install react-native-gesture-handler react-native-reanimated` 
- [x] Estilização da page Login
- [x] axios - conectar a aplicação com o api: `yarn add axios`
- [x] services/api - baseURL: 'http://192.168.0.31:3333'. Esse ip pode mudar.
- [x] configurar axios na função handleSubmit
- [x] AsyncStorage agora é `@react-native-async-storage/async-storage`

#### Funcionalidades avançadas 
- [x] Sincronizar realtime o front mobile e o front web com a lib socket.io.

## 🤔 Como contribuir

- Faça um fork desse repositório;
- Cria uma branch com a sua feature: `git checkout -b minha-feature`;
- Faça commit das suas alterações: `git commit -m 'feat: Minha nova feature'`;
- Faça push para a sua branch: `git push origin minha-feature`.

Depois que o merge da sua pull request for feito, você pode deletar a sua branch.

## :memo: Licença

Esse projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE.md) para mais detalhes.

--- 

:. Feito com ♥ by Rocketseat :wave: [Diego Fernandes](https://rocketseat.com.br/week-9/aulas) - De Rocketseat na Semana Omnistack 9.0.