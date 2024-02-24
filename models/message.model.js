const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: Object,
  receiver: Object,
  room:String,
  read:{ type: Boolean, default: false },
  CreatedAt: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model("message", messageSchema);

module.exports = { MessageModel };
