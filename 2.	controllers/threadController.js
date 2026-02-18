const mongoose = require('mongoose');
const { Thread } = require('../models/models');

// ==========================================
// 1. LÓGICA DE HILOS (THREADS)
// ==========================================

// Crear un hilo
exports.createThread = async (req, res) => {
  try {
    const { board } = req.params;
    const { text, delete_password } = req.body;

    const newThread = new Thread({
      board: board,
      text: text,
      delete_password: delete_password,
      replies: []
    });

    await newThread.save();
    res.json(newThread);
  } catch (err) {
    res.status(500).send("Error al crear el hilo");
  }
};

// Obtener los 10 hilos más recientes
exports.getRecentThreads = async (req, res) => {
  try {
    const { board } = req.params;
    const threads = await Thread.find({ board })
      .sort({ bumped_on: -1 })
      .limit(10)
      .lean();

    threads.forEach(thread => {
      delete thread.delete_password;
      delete thread.reported;
      thread.replycount = thread.replies.length;
      thread.replies = thread.replies.sort((a, b) => b.created_on - a.created_on).slice(0, 3);
      thread.replies.forEach(reply => {
        delete reply.delete_password;
        delete reply.reported;
      });
    });
    res.json(threads);
  } catch (err) {
    res.status(500).send("Error al obtener hilos");
  }
};

// Reportar un hilo
exports.reportThread = async (req, res) => {
  try {
    const { thread_id } = req.body;
    await Thread.findByIdAndUpdate(thread_id, { reported: true });
    res.send('reported');
  } catch (err) {
    res.send('error');
  }
};

// Eliminar un hilo
exports.deleteThread = async (req, res) => {
  try {
    const { thread_id, delete_password } = req.body;

    // 1. Validar que el ID sea válido antes de buscar
    if (!thread_id || !mongoose.Types.ObjectId.isValid(thread_id)) {
      return res.send('id incorrecto');
    }

    const thread = await Thread.findById(thread_id);

    if (!thread) {
      return res.send('id incorrecto');
}
    if (thread.delete_password === delete_password) {
      await Thread.findByIdAndDelete(thread_id);
      res.send('success');
    } else {
      res.send('incorrect password');
    }
  } catch (err) {
    console.error(err);
    res.send('error');
  }
};

// ==========================================
// 2. LÓGICA DE RESPUESTAS (REPLIES)
// ==========================================

// Crear respuesta
exports.createReply = async (req, res) => {
  try {
    const { thread_id, text, delete_password } = req.body;
    const now = new Date();

    const updatedThread = await Thread.findByIdAndUpdate(
      thread_id,
      { 
        $push: { replies: { text, delete_password, created_on: now, reported: false } },
        $set: { bumped_on: now } 
      },
      { new: true }
    );
    res.json(updatedThread);
  } catch (err) {
    res.status(500).send("Error al responder");
  }
};

// Eliminar respuesta (cambiar texto a [deleted])
exports.deleteReply = async (req, res) => {
  try {
    const { thread_id, reply_id, delete_password } = req.body;
   
    const thread = await Thread.findById(thread_id);
    if (!thread) return res.send('id incorrecto');

    const reply = thread.replies.id(reply_id);
    if (!reply) return res.send('id incorrecto');

    if (reply.delete_password === delete_password) {
      reply.text = '[deleted]';
      await thread.save();
      res.send('success');
    } else {
      res.send('incorrect password');
    }
  } catch (err) {
    res.send('error');
  }
};

// Reportar respuesta
exports.reportReply = async (req, res) => {
  try {
    const { thread_id, reply_id } = req.body;
    const thread = await Thread.findById(thread_id);
    const reply = thread.replies.id(reply_id);
    reply.reported = true;
    await thread.save();
    res.send('reported');
  } catch (err) {
    res.send('error');
  }
};

// Obtener un solo hilo completo
exports.getSingleThread = async (req, res) => {
  try {
    // Los GET por query string (?thread_id=...) se capturan con req.query
    const threadId = req.query.thread_id;

    if (!threadId) {
      return res.status(400).send("thread_id missing");
    }

    const thread = await Thread.findById(threadId).lean();

    if (!thread) {
      // Si entra aquí, devuelve 404 y el test falla. 
      // Agregamos un log para que veas en consola qué ID está fallando:
      console.log("No se encontró el hilo con ID:", threadId);
      return res.status(404).send("thread not found");
    }

    // Limpieza de campos según los requisitos
    delete thread.delete_password;
    delete thread.reported;
if (thread.replies) {
      thread.replies.forEach(reply => {
        delete reply.delete_password;
        delete reply.reported;
      });
    }

    res.json(thread);
  } catch (err) {
    res.status(500).send("error");
  }
};
