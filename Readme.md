# Semana Omnistack 9.0 - Rocketseat : JavaScript, ES6, NodeJS, ReactJS, ReactNative

### Atualização: 13 de janeiro de 2020 - 18:32
### Criação: 30 de Setembro de 2019
### Prática : @douglasabnovato

### Ferramentas : 

![ReactJS](/images/logo-reactjs.jpg)
![React Native](/images/logo-react-native.png)
![Git](/images/logo-git.png)
![Github](/images/logo-github.png)
![HTML/CSS/Javascript](/images/logo-html-css-js.jpeg)
![VSCode](/images/logo-VSCode.png)
![Yarn](/images/logo-yarn.png)
![Nodejs](/images/nodejs.png)
![Rocketseat](/images/logo-rocketseat.png)

#### 30/09 : conhecendo a OmniStack 9.0
.: descobrir as principais ferramentas do ecossistema e o que nós vamos construir com elas.
- mockups
- nodejs with package manage
- yarn
- npm
- vs code: dracula
- "ver dual boot"

#### 01/10 : Criando a base da aplicação
.: construir o back-end da sua aplicação: uma API REST robusta utilizando NodeJS.
- `node src/server.js`
- localhost:3333
- resposta "welcome omnistack 9.0 !"
- yarn add nodemon -D
- express : definicao de rotas
- get, post, put, delete
- insominia
- POST
```` 
app.post('/users', (req,res) => {
    return res.json({message: "Welcome Omnistack 9.0!!"});
});
````
- `yarn dev`
- GET, POST, PUT, DELETE
- req.query = acessar query params (filtros)
- req.query = acessar route params (edição e deleção)
- req.body = acessar corpo da requisição (criação e edição)
- routes
- banco de dados : mongoDB atlas cloud : conect your aplication
- mongoose : `yarn add mongoose` : editar o mongoDB
- layout : página de login do usuário
- MVC : estrutura de pastas<br>
models : representação de entidades do tabela no bd<br>
controllers : controladores da regra de negócios<br> 
views : parte visual da aplicação.
- itens relevantes :
1. session controller
2. routes
3. insomnia : testes de banco de dados
4. async e await : aguardar resposta de instrução antes de prosseguir
5. multer
6. Session , Spot , Dashboard, Booking
- insomnia :
1. Session: Post - Store
2. Spot: Post - Store, Get - Index
3. Dashboard: Get - Show
4. Booking: Post - Store
- erro : booking no insomnia não está registrando

#### 02/10 : Construindo a interface web
.: construir o front-end web com ReactJs.
- babel - comunicação com o browser
- `yarn create react-app frontend`

#### 03/10 : Desenvolvendo o app mobile  

#### 04/10 : Funcionalidades avançadas

:. De Rocketseat - Semana Omnistack 9.0.<br>
Por Diego Fernandes : https://rocketseat.com.br/week-9/aulas