const mongoose = require('mongoose');
const { Schema } = mongoose;

// 1. Definimos el esquema de respuestas
const ReplySchema = new Schema({
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false }
});

// 2. Definimos el esquema de hilos
const ThreadSchema = new Schema({
  board: { type: String, required: true },
  text: { type: String, required: true },
  delete_password: { type: String, required: true },
  created_on: { type: Date, default: Date.now },
  bumped_on: { type: Date, default: Date.now },
  reported: { type: Boolean, default: false },
  replies: [ReplySchema]
});

// 3. Creamos los modelos (con la validación para no sobreescribir)
const Thread = mongoose.models.Thread || mongoose.model('Thread', ThreadSchema);
const Reply = mongoose.models.Reply || mongoose.model('Reply', ReplySchema);

// 4. Exportamos ambos por si los necesitas
module.exports = { Thread, Reply };
