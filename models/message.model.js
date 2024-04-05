const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  sender: Object,
  receiver: Object,
  room:String,
  read:{ type: Boolean, default: false },
  CreatedAt: { type: Date, default: Date.now }
});

const MessageModel = mongoose.model("message", messageSchema);

const followSchema = mongoose.Schema({
  follower: {type:mongoose.Schema.Types.ObjectId, ref:"user"},
  following: {type:mongoose.Schema.Types.ObjectId, ref:"user"},
  CreatedAt: { type: Date, default: Date.now }
});

const FollowModel = mongoose.model("follow", followSchema);

module.exports = { MessageModel, FollowModel };
