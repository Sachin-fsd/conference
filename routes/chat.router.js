const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { ChatModel } = require("../models/chat.model");
const { MessageModel } = require("../models/message.model");
// const { CommentModel } = require('../models/comment.model');

const chatRouter = express.Router();

chatRouter.get("/:id", async (req, res) => {
  const UserDetails = req.body.UserDetails;
  const UserID = UserDetails.UserID;
  const ID = req.params.id;
  const room = `${UserID}${ID}`.split("").sort().join("");
  try {
    const message = await MessageModel.findOne({room});
    if(!message){
      read = null;
    }else{
      read = message.read;
    }

    const ProfileUser = await RegisterModel.findOne({ _id: ID });
    let chats = await ChatModel.find({ room })
      .sort({ CreatedAt: -1 })
      .limit(20);
    chats = chats.reverse()
    res.render("chat", {
      UserDetails: req.body.UserDetails,
      ProfileUser: {
        UserID: ProfileUser._id,
        UserName: ProfileUser.name,
      },
      room,
      chats,
      read
    });
  } catch (error) {
    res.status(401).json({ err: error });
  }
});

chatRouter.post("/", async (req, res) => {
  const payload = {
    UserDetails: req.body.UserDetails,
    text: req.body.text,
    room: req.body.room,
  };
  try {
    const chat = new ChatModel(payload);
    await chat.save();
    
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

module.exports = { chatRouter };
