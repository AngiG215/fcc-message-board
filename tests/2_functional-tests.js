const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(10000);

  let testThreadId;
  let testReplyId;

  suite('Rutas de Threads', function() {
    
    test('Crear un nuevo hilo: POST a /api/threads/testBoard', function(done) {
  chai.request(server)
    .post('/api/threads/testBoard')
    .send({ text: 'Hilo funcional', delete_password: '123' })
    .end(function(err, res) {
      assert.equal(res.status, 200);
      // Verificamos que responda con el objeto del hilo o que se haya creado
      assert.isObject(res.body, 'La respuesta debe ser un objeto');
      testThreadId = res.body._id; 
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
      // Si el test anterior falló, usamos un ID genérico para evitar error de undefined
      const id = testThreadId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .delete('/api/threads/testBoard')
        .send({ thread_id: id, delete_password: 'wrong' })
        .end(function(err, res) {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Reportar un hilo: PUT a /api/threads/testBoard', function(done) {
      const id = testThreadId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .put('/api/threads/testBoard')
        .send({ thread_id: id })
        .end(function(err, res) {
          assert.equal(res.text, 'reported');
          done();
        });
    });
  });

  suite('Rutas de Replies', function() {
    
    test('Crear una nueva respuesta: POST a /api/replies/testBoard', function(done) {
      const id = testThreadId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .post('/api/replies/testBoard')
        .send({ thread_id: id, text: 'Respuesta funcional', delete_password: 'abc' })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          // Buscamos la última respuesta añadida
          if (res.body.replies && res.body.replies.length > 0) {
            testReplyId = res.body.replies[res.body.replies.length - 1]._id;
          }
          done();
        });
    });

    test('Ver hilo completo: GET a /api/replies/testBoard', function(done) {
      const id = testThreadId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .get('/api/replies/testBoard')
        .query({ thread_id: id })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          done();
        });
    });

    test('Eliminar respuesta (incorrecta): DELETE a /api/replies/testBoard', function(done) {
      const tid = testThreadId || '507f1f77bcf86cd799439011';
      const rid = testReplyId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ thread_id: tid, reply_id: rid, delete_password: 'wrong' })
        .end(function(err, res) {
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('Reportar respuesta: PUT a /api/replies/testBoard', function(done) {
      const tid = testThreadId || '507f1f77bcf86cd799439011';
      const rid = testReplyId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .put('/api/replies/testBoard')
        .send({ thread_id: tid, reply_id: rid })
        .end(function(err, res) {
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('Eliminar respuesta (correcta): DELETE a /api/replies/testBoard', function(done) {
      const tid = testThreadId || '507f1f77bcf86cd799439011';
      const rid = testReplyId || '507f1f77bcf86cd799439011';
      chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ thread_id: tid, reply_id: rid, delete_password: 'abc' })
        .end(function(err, res) {
          assert.equal(res.text, 'success');
          done();
        });
    });
  });
});
