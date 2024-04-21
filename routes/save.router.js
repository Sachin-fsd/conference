const express = require("express");
const mongoose = require("mongoose");
const { RegisterModel } = require("../models/register.model");
const { NotificationModel } = require("../models/notifications.model");
const { SaveModel } = require("../models/save.model");

const saveRouter = express.Router();

saveRouter.get("/", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;

    const saves = await SaveModel.aggregate([
      { $match: { UserID: new mongoose.Types.ObjectId(UserID) } },
      {
        $lookup: {
          from: "posts",
          localField: "postID",
          foreignField: "_id",
          as: "post",
        },
      },
      {
        $unwind: "$post",
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
          "authorDetails.UserID": { $toString: "$author._id" },
          "authorDetails.UserName": "$author.name",
          "authorDetails.UserEmail": "$author.email",
          "authorDetails.UserDp": "$author.dp",
        },
      },
      {
        $lookup: {
          from: "likes",
          let: { post_id: "$post._id" },
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
          let: { post_id: "$post._id" },
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
      { $addFields: { liked: { $size: "$likes" }, saved: { $size: "$saves" } } },
      {
        $project: {
          likes: 0,
          saves: 0,
          author:0
        },
      },
    ]);

    // console.log(saves)

    res.render("save", {
      UserDetails: req.body.UserDetails,
      saves,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

saveRouter.post("/:id/:authorID", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const postID = req.params.id;
    const authorID = req.params.authorID;
    const saved = await SaveModel.findOne({ UserID, postID });

    if (saved) {
      await SaveModel.deleteOne({ _id: saved._id });
    } else {
      await SaveModel.create({ UserID, postID, authorID });
    }

    res.send({ msg: "Done with save", ok: true });
  } catch (error) {
    res.send({ msg: "Error while saving the post", error });
  }
});

module.exports = { saveRouter };
