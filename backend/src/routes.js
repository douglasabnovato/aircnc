const express = require('express');
const multer = require('multer');

const uploadConfig = require('./config/upload'); 
const SessionController = require('./controllers/SessionController');
const SpotController = require('./controllers/SpotController');
const DashboardController = require('./controllers/DashboardController');
const BookingController = require('./controllers/BookingController');



const routes = express.Router();

const upload = multer(uploadConfig);



routes.post('/sessions', SessionController.store);

routes.get('/spots', SpotController.index); 
routes.post('/spots', upload.single('thumbnail'), SpotController.store);

routes.post('/spots/:spot_id/bookings', BookingController.store);

routes.get('/dashboard', DashboardController.show);



routes.get("/testar", (request, response) => {
    console.log("testar - @douglasabnovato.")
    return response.json({ idade:request.query.idade });
})

routes.put("/testou/:id", (request, response) => {
    console.log("testou id - @douglasabnovato.")
    return response.json({ id:request.params.id });
})

routes.post("/teste", (request, response) => {
    console.log("teste - @douglasabnovato.")
    return response.json(request.body);
})
 
module.exports = routes;
