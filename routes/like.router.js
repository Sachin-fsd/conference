const express = require("express");
const mongoose = require("mongoose");
const { LikeModel, PostModel } = require("../models/post.model");
const { NotificationModel } = require("../models/notifications.model");

const likeRouter = express.Router();

likeRouter.put("/:id/:authorID", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const postID = req.params.id;
    const authorID = req.params.authorID;
    const like = await LikeModel.findOne({ UserID, postID });

    if (like) {
      await LikeModel.deleteOne({ _id: like._id });
      
      // Fetch the post to check its likeCount
      const post = await PostModel.findOne({ _id: postID });

      // Only decrement likeCount if it's greater than 0
      if (post.likeCount > 0) {
        await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: -1 } });
      }

      await NotificationModel.deleteOne({senderID:UserID,receiverID:authorID,purpose:"Liked a post",postID})

    } else {
      await LikeModel.create({ UserID, postID, authorID });
      await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: 1 } });
      if(UserID!==authorID){
        await NotificationModel.create({senderID:UserID,receiverID:authorID,purpose:"Liked a post",postID})
      }
    }

    res.send({ msg: "Done with like", ok: true });
  } catch (error) {
    res.send({ msg: "Error while liking the post", error });
  }
});

module.exports = {likeRouter};
