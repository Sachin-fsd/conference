const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { ChatModel } = require("../models/chat.model");
const { MessageModel } = require("../models/message.model");
// const { CommentModel } = require('../models/comment.model');

const messageRouter = express.Router();

messageRouter.get("/", async (req, res) => {
  const userID = req.body.UserDetails.UserID;

  try {
    const messages = await MessageModel.find({
      $or: [{ "sender.UserID": userID }, { "receiver.UserID": userID }],
    }).sort({ CreatedAt: -1 });

    res
      .status(200)
      .render("message", { messages, UserDetails: req.body.UserDetails });
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

// {"sender.UserID":req.body.UserDetails.UserID,"receiver.UserID": receiverID }
messageRouter.post("/", async (req, res) => {
  const { room, receiverID } = req.body;
  try {
    let messages = await MessageModel.findOne({ room });
    const receivedUser = await RegisterModel.findOne(
      { _id: receiverID },
      { _id: 1, name: 1, email: 1,dp:1 }
    );
    const receiver = {
      UserID: receivedUser._id.toString(),
      UserName: receivedUser.name,
      UserEmail: receivedUser.email,
      UserDp: receivedUser.dp
    };
    if (!messages) {
      messages = new MessageModel({
        sender: req.body.UserDetails,
        receiver,
        room,
      });
    } else {
      messages.sender = req.body.UserDetails;
      messages.receiver = receiver;
      messages.read = false;
      messages.CreatedAt = Date.now();
    }
    await messages.save();
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

messageRouter.patch("/", async (req, res) => {
  const {room} = req.body;
  try {
    let messages = await MessageModel.findOne({ room });
    messages.read = true;
    await messages.save();
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

module.exports = { messageRouter };
