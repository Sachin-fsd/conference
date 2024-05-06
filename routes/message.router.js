const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { ChatModel } = require("../models/chat.model");
const { MessageModel } = require("../models/message.model");
const { NotificationModel } = require("../models/notifications.model");
// const { CommentModel } = require('../models/comment.model');

const messageRouter = express.Router();

messageRouter.get("/", async (req, res) => {
  const userID = req.body.UserDetails.UserID;

  try {
    const messages = await MessageModel.find({
      $or: [{ "senderID": userID }, { "receiverID": userID }],
    }).sort({ CreatedAt: -1 }).populate("senderID","_id name dp").populate("receiverID","_id name dp");

    // console.log(messages)

    res
      .status(200)
      .render("message", { messages, UserDetails: req.body.UserDetails });
  } catch (error) {
    return res.redirect("/");
  }
});

// {"sender.UserID":req.body.UserDetails.UserID,"receiver.UserID": receiverID }
messageRouter.post("/", async (req, res) => {
  const { room, receiverID } = req.body;
  try {
    const UserID = req.body.UserDetails.UserID;
    let messages = await MessageModel.findOne({ room });
    if (!messages) {
      messages = new MessageModel({
        senderID: req.body.UserDetails.UserID,
        receiverID,
        room,
      });
      await NotificationModel.create({senderID:UserID,receiverID,purpose:"Sent a message",postID:UserID})
    } else {
      messages.senderID = UserID;
      messages.receiverID = receiverID;
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
