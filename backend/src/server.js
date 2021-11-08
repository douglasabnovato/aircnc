const express = require('express');
const mongoose = require('mongoose');
const routes = require('routes');

const app = express();

mongoose.connect('mongodb+srv://dbAircnc:douglas1234@cluster0.yg58x.mongodb.net/dbAircnc?retryWrites=true&w=majority',{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

app.get("/", (request, response) => {
    console.log("@douglasabnovato.")
    return response.json({ message: "Hello Week Omnistack 9!" });
})

app.use(express.json());
app.use(routes);

app.listen(3333);  
