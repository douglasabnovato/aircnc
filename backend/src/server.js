const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

const routes = require('./routes');

const app = express();

mongoose.connect('mongodb+srv://dbAircnc:douglas1234@cluster0.yg58x.mongodb.net/dbAircnc?retryWrites=true&w=majority',{ 
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
   
app.use(cors());
app.use(express.json()); 
app.use(routes);

app.listen(3333);  
