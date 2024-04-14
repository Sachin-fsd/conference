const express = require("express");
const mongoose = require("mongoose");
const { RegisterModel } = require("../models/register.model");
const { NotificationModel } = require("../models/notifications.model");

const notificationRouter = express.Router();


notificationRouter.get("/", async (req, res) => {
    try {
      const UserID = req.body.UserDetails.UserID;
  
      const notifications = await NotificationModel.aggregate([
        { $match: { receiverID:new mongoose.Types.ObjectId(UserID) } },
        { $limit: 20 },
        {
          $addFields: {
            CreatedAt: { $toDate: "$CreatedAt" },
          },
        },
        { $sort: { CreatedAt: -1 } },
        {
          $lookup: {
            from: "users",
            localField: "senderID",
            foreignField: "_id",
            as: "sender",
          },
        },
        {
          $unwind: "$sender",
        },
        {
          $addFields: {
            "senderDetails.UserID": "$sender._id" ,
            "senderDetails.UserName": "$sender.name",
            "senderDetails.UserEmail": "$sender.email",
            "senderDetails.UserDp": "$sender.dp",
          },
        },
        {
          $project: {
            sender: 0,
          },
        },
      ]);

      console.log(notifications)
      res.render("notification", {
        UserDetails: req.body.UserDetails,
        notifications,
      });
    } catch (error) {
      console.log(error);
      res.json({ err: error });
    }
  });



  notificationRouter.post("/:id", async (req, res) => {
    try {
      const UserID = req.body.UserDetails.UserID;
      const postID = req.params.id;
      const authorID = req.params.authorID;
      const like = await LikeModel.findOne({ UserID, postID });
  
      if (like) {
        await LikeModel.deleteOne({ _id: like._id });
        await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: -1 } });
      } else {
        await LikeModel.create({ UserID, postID, authorID });
        await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: 1 } });
      }
  
      res.send({ msg: "Done with like", ok: true });
    } catch (error) {
      res.send({ msg: "Error while liking the post", error });
    }
  });

module.exports = {notificationRouter}