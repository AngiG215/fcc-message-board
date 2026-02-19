'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRoutes = require('./routes/api.js');
const runner = require('./test-runner');

const app = express();

// CONFIGURACIÓN DE SEGURIDAD (CORREGIDA)
app.use(helmet({
  frameguard: { action: 'sameorigin' },
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: 'same-origin' }
}));

// Middlewares básicos
app.use(cors({origin: '*'})); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 3. CONEXIÓN A MONGODB ---
const MONGO_URI = process.env.DB;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Conectado a MongoDB con éxito ✅");
  })
  .catch(err => {
    console.error("Error crítico de conexión a la base de datos ❌:", err);
  });
// --- 4. RUTAS ---
// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/board.html');
  });

  // Para el testeo de freeCodeCamp
// fccTestingRoutes(app);

apiRoutes(app);

// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
    });

// --- 5. INICIAR SERVIDOR ---
const port = process.env.PORT || 3000;

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 1500);
  }
});

module.exports = app; //for testing
