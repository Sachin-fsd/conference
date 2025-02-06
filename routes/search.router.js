const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { PostModel } = require("../models/post.model");
const { MessageModel } = require("../models/message.model");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const { query } = req.query;
    const messages = await MessageModel.find({
      $or: [{ senderID: UserID }, { receiverID: UserID }],
    })
      .populate('senderID', '_id name dp handle') // fetch from sender
      .populate('receiverID', '_id name dp handle') // fetch from receiver
      .sort({ UpdatedAt: -1 }).limit(5);
    let SideUsers = []
    if (messages.length < 5) {
      SideUsers = await RegisterModel.find({}, { _id: 1, name: 1, dp: 1 })
        .sort({ UpdatedAt: -1 })
        .limit(5);
    }

    if (query && query !== null) {
      // console.log("query from search", query);
      const regex = new RegExp(query, "i");
      const users = await RegisterModel.find(
        { name: { $regex: regex } },
        { password: 0 }
      );

      const posts = await PostModel.find(
        { text: { $regex: regex } },
        { _id: 1, authorID: 1, text: 1, CreatedAt: 1 }
      ).sort({ CreatedAt: -1 }).populate('authorID', '_id name dp');

      res.status(200).json({ users, posts });

    } else {
      const users = await RegisterModel.find(
        {},
        { password: 0 }
      ).sort({ updatedAt: -1 }).limit(10);
      // console.log("send users")
      res.render("search", { users, UserDetails: req.body.UserDetails, messages, SideUsers });
      // res.send({users,posts:[]})
    }
  } catch (error) {
    console.log(error)
    res.status(401).render("search");
  }
});


module.exports = { searchRouter };
