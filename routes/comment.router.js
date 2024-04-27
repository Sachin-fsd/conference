const express = require("express");
const mongoose = require("mongoose");
const { PostModel } = require("../models/post.model");
const { CommentModel } = require("../models/comment.model");
const { NotificationModel } = require("../models/notifications.model");

const commentRouter = express.Router();

commentRouter.get("/:id", async (req, res) => {
  console.log("comment line9");
  try {
    const ID = req.params.id || "65c8a19b3b2373224ef78e1e";
    // const post = await PostModel.findOne(
    //   { _id: ID }
    // );
    const UserID = req.body.UserDetails.UserID;

    let post = await PostModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(ID), // replace ID with your post id
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "authorID",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },
      {
        $addFields: {
          "UserDetails.UserID": { $toString: "$author._id" },
          "UserDetails.UserName": "$author.name",
          "UserDetails.UserEmail": "$author.email",
          "UserDetails.UserDp": "$author.dp",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$UserID", new mongoose.Types.ObjectId(UserID)] },
                    { $eq: ["$postID", "$$post_id"] },
                  ],
                },
              },
            },
            { $project: { _id: 0 } },
          ],
          as: "likes",
        },
      },
      {
        $lookup: {
          from: "saves",
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$UserID", new mongoose.Types.ObjectId(UserID)] },
                    { $eq: ["$postID", "$$post_id"] },
                  ],
                },
              },
            },
            { $project: { _id: 0 } },
          ],
          as: "saves",
        },
      },
      {
        $addFields: {
          liked: { $size: "$likes" },
          saved: { $size: "$saves" },
        },
      },
      {
        $project: {
          author: 0,
          likes: 0,
          saves: 0,
        },
      },
    ]);
    post = post[0];

    const comments = await CommentModel.find({ parentPost: ID })
      .sort({ CreatedAt: -1 })
      .limit(20)
      .populate("commenterID", "_id name dp");

    // console.log(comments)

    res.render("comment", {
      UserDetails: req.body.UserDetails,
      // activePost,
      comments,
      post,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

commentRouter.post("/:id", async (req, res) => {
  const { text, authorID } = req.body;
  const payload = {
    commenterID: req.body.UserDetails.UserID,
    text,
    parentPost: req.params.id,
  };
  try {
    const comment = new CommentModel(payload);

    if (req.body.UserDetails.UserID !== authorID) {
      await NotificationModel.create({
        senderID: req.body.UserDetails.UserID,
        receiverID: authorID,
        purpose: "new comment",
        postID: req.params.id,
      });
    }

    // console.log({
    //   senderID: req.body.UserDetails.UserID,
    //   receiverID: authorID,
    //   purpose: "new comment",
    //   postID: req.params.id,
    // });
    await comment.save();
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(400).json({ err: error });
  }
});

module.exports = { commentRouter };
