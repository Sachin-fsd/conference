const mongoose = require("mongoose");

const messageSchema = mongoose.Schema({
  senderID: {type:mongoose.Schema.Types.ObjectId, ref:"user"},
  receiverID: {type:mongoose.Schema.Types.ObjectId, ref:"user"},
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
