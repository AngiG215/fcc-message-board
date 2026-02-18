'use strict';

// Solo necesitamos el controlador. 
// Asegúrate de que el archivo exista en la carpeta controllers
const ThreadController = require('../controllers/threadController');

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .post(ThreadController.createThread)
    .get(ThreadController.getRecentThreads)
    .put(ThreadController.reportThread)
    .delete(ThreadController.deleteThread);
    
  app.route('/api/replies/:board')
    .post(ThreadController.createReply)
    .get(ThreadController.getSingleThread) 
    .put(ThreadController.reportReply)
    .delete(ThreadController.deleteReply);
};
