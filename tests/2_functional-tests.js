const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  let testThreadId;
  let testReplyId;

  suite('Rutas de Threads', function() {
    
    test('Crear un nuevo hilo: POST a /api/threads/testBoard', function(done) {
      chai.request(server)
        .post('/api/threads/testBoard')
        .send({ text: 'Hilo funcional', delete_password: '123' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          // Guardamos el ID para todo el resto de la suite
          testThreadId = res.body._id;
          assert.isDefined(testThreadId, 'El ID del hilo debería estar definido');
          done();
        });
    });

    test('Ver 10 hilos recientes: GET a /api/threads/testBoard', function(done) {
      chai.request(server)
        .get('/api/threads/testBoard')
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test('Eliminar hilo (contraseña incorrecta): DELETE a /api/threads/testBoard', function(done) {
      chai.request(server)
        .delete('/api/threads/testBoard')
        .send({ thread_id: testThreadId, delete_password: 'wrong' })
        .end(function(err, res) {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Reportar un hilo: PUT a /api/threads/testBoard', function(done) {
      chai.request(server)
        .put('/api/threads/testBoard')
        .send({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.text, 'reported');
          done();
        });
    });
  });

  suite('Rutas de Replies', function() {
    
    test('Crear una nueva respuesta: POST a /api/replies/testBoard', function(done) {
      chai.request(server)
        .post('/api/replies/testBoard')
        .send({ thread_id: testThreadId, text: 'Respuesta funcional', delete_password: 'abc' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          // Extraemos el ID de la respuesta del array
          testReplyId = res.body.replies[res.body.replies.length - 1]._id;
          done();
        });
    });

    test('Ver hilo completo: GET a /api/replies/testBoard', function(done) {
      chai.request(server)
        .get('/api/replies/testBoard')
        .query({ thread_id: testThreadId })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body._id, testThreadId);
          done();
        });
    });

    test('Eliminar respuesta (incorrecta): DELETE a /api/replies/testBoard', function(done) {
      chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'wrong' })
        .end(function(err, res) {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Reportar respuesta: PUT a /api/replies/testBoard', function(done) {
      chai.request(server)
        .put('/api/replies/testBoard')
        .send({ thread_id: testThreadId, reply_id: testReplyId })
        .end(function(err, res) {
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('Eliminar respuesta (correcta): DELETE a /api/replies/testBoard', function(done) {
      chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ thread_id: testThreadId, reply_id: testReplyId, delete_password: 'abc' })
        .end(function(err, res) {
          assert.equal(res.text, 'success');
          done();
        });
    });
  });
});
