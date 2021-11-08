const express = require('express');
const mongoose = require('mongoose');
const routes = require('routes');

const app = express();

mongoose.connect('mongodb+srv://dbAircnc:douglas1234@cluster0.yg58x.mongodb.net/dbAircnc?retryWrites=true&w=majority',{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.get("/testar", (request, response) => {
    console.log("testar - @douglasabnovato.")
    return response.json({ idade:request.query.idade });
})

app.put("/testou/:id", (request, response) => {
    console.log("testou id - @douglasabnovato.")
    return response.json({ id:request.params.id });
})
   
app.use(express.json());

app.post("/teste", (request, response) => {
    console.log("teste - @douglasabnovato.")
    return response.json(request.body);
})

app.use(routes);

app.listen(3333);  
