const express = require("express");
const mongoose = require("mongoose");
const { RegisterModel } = require("../models/register.model");
const { PostModel, LikeModel } = require("../models/post.model");
const { MessageModel, FollowModel } = require("../models/message.model");
const multer = require("multer");
const Aws = require("aws-sdk");
const { NotificationModel } = require("../models/notifications.model");
require("dotenv").config();

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page-1)*limit
    const UserID = req.body.UserDetails.UserID;

    // Fetch the user details
    const user = await RegisterModel.findOne(
      { _id: UserID },
      { _id: 1, name: 1, email: 1, dp: 1 }
    );

    // Fetch the posts and populate the author details
    const posts = await PostModel.aggregate([
      { $sort: { CreatedAt: -1 } },
      {$skip:skip},
      { $limit: limit },
      {
        $addFields: {
          CreatedAt: { $toDate: "$CreatedAt" },
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
      { $addFields: { liked: { $size: "$likes" }, saved: { $size: "$saves" } } },
      {
        $project: {
          author: 0,
          likes: 0,
          saves: 0,
        },
      },
    ]);

    // Fetch the messages
    const messages = await MessageModel.find({
      $or: [{ "sender.UserID": UserID }, { "receiver.UserID": UserID }],
    }).sort({ CreatedAt: -1 });

    // Fetch the users
    let users = [];
    if (messages.length < 5) {
      users = await RegisterModel.find({}, { _id: 1, name: 1, dp: 1 })
        .sort({ CreatedAt: -1 })
        .limit(5);
    }

    // res.render("index", {
    //   UserDetails: req.body.UserDetails,
    //   posts,
    //   messages,
    //   users,
    // });
    // console.log(posts)
    res.status(200).send({ posts });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});


const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "");
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") ||
    file.mimetype == "application/pdf" ||
    file.mimetype == "video/mp4"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({ storage, fileFilter });

const s3 = new Aws.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_ACCESS_KEY_SECRET,
});

postRouter.post("/", upload.single("file"), (req, res) => {
  // Check if a file was uploaded
  if (req.file) {
    // File was uploaded, proceed with AWS upload
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.file.originalname,
      Body: req.file.buffer,
      ContentType: req.file.mimetype, //ContentDisposition: 'inline' for online opening
      ContentDisposotion: "inline",
    };

    s3.upload(params, (error, data) => {
      if (error) {
        res.status(500).send({ err: error });
      } else {
        console.log("data", data);

        const post = new PostModel({
          authorID: req.body.authorID,
          text: req.body.text,
          photo: req.file.mimetype.startsWith("image/") ? data.Location : null,
          pdf: req.file.mimetype == "application/pdf" ? data.Location : null,
          video: req.file.mimetype == "video/mp4" ? data.Location : null,
        });

        post
          .save()
          .then((result) => {
            res.status(200).send({
              _id: result._id,
              text: data.Location,
            });
          })
          .catch((err) => {
            res.send({ message: err });
          });
      }
    });
  } else {
    // No file was uploaded, just save the text to MongoDB
    const post = new PostModel({
      authorID: req.body.authorID,
      text: req.body.text,
    });
    post
      .save()
      .then((result) => {
        res.status(200).send({
          _id: result._id,
          text: req.body.text,
        });
      })
      .catch((err) => {
        res.send({ message: err });
      });
  }
});

postRouter.get("/:id", async (req, res) => {
  try {
    const ID = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ID)) {
      return res.status(404).render("404");
    }

    const user = await RegisterModel.findOne(
      { _id: ID },
      { _id: 1, name: 1, email: 1, bio: 1, dp: 1 }
    );
    const posts = await PostModel.find({ authorID: ID })
      .sort({ CreatedAt: -1 })
      .limit(20);
    let follow = await FollowModel.countDocuments({
      follower: req.body.UserDetails.UserID,
      following: ID,
    });
    if (follow == 0) {
      follow = "Follow";
    } else {
      follow = "Following";
    }

    const following = await FollowModel.countDocuments({ follower: ID });
    const followers = await FollowModel.countDocuments({ following: ID });

    console.log(posts)



    // res.render("profile", {
    //   UserDetails: req.body.UserDetails,
    //   ProfileDetails: {
    //     UserID: ID,
    //     UserName: user.name,
    //     UserEmail: user.email,
    //     UserBio: user.bio,
    //     UserDp: user.dp,
    //   },
    //   posts,
    //   follow,
    //   following,
    //   followers,
    // });
    res.send({
      ProfileDetails: {
        UserID: ID,
        UserName: user.name,
        UserEmail: user.email,
        UserBio: user.bio,
        UserDp: user.dp,
      },
      posts,
      follow,
      following,
      followers,
    });
  } catch (error) {
    res.json({ err: error });
  }
});

postRouter.get("/profileEdit/:id", async (req, res) => {
  try {
    const ID = req.params.id;
    if (ID !== req.body.UserDetails.UserID) {
      res.status(400).send({ msg: "Unauthorised" });
    } else {
      const user = await RegisterModel.findOne(
        { _id: ID },
        { password: 0, CreatedAt: 0 }
      );
      if (!user) {
        res.status(400).send({ msg: "User not Found" });
        return;
      }
      res.render("profileEdit", {
        UserDetails: {
          UserID: user._id,
          UserName: user.name,
          UserBio: user.bio,
          UserDp: user.dp,
          UserEmail: user.email,
        },
      });
    }
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});

postRouter.put("/profileEdit/:id", async (req, res) => {
  let { UserName, UserBio, dp } = req.body;
  let ID = req.params.id;
  try {
    if (ID == req.body.UserDetails.UserID) {
      let user = await RegisterModel.findOne({ _id: ID });
      user.name = UserName;
      user.bio = UserBio;
      user.dp = dp;
      await user.save();
      res.status(201).send({ msg: "Done with editting" });
    } else {
      res.status(400).send({ msg: "Error" });
    }
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});

postRouter.get("/followers/:id", async (req, res) => {
  let ID = new mongoose.Types.ObjectId(req.params.id);
  try {
    const followers = await FollowModel.aggregate([
      { $match: { following: ID } },
      {
        $lookup: {
          from: "users",
          localField: "follower",
          foreignField: "_id",
          as: "follower_info",
        },
      },
      {
        $unwind: "$follower_info",
      },
      {
        $project: {
          _id: 0,
          ID: "$follower",
          name: "$follower_info.name",
        },
      },
    ]);
    res.status(201).send(followers);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});

postRouter.get("/following/:id", async (req, res) => {
  let ID = new mongoose.Types.ObjectId(req.params.id);
  try {
    const following = await FollowModel.aggregate([
      { $match: { follower: ID } },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following_info",
        },
      },
      {
        $unwind: "$following_info",
      },
      {
        $project: {
          _id: 0,
          ID: "$following",
          name: "$following_info.name",
        },
      },
    ]);
    res.status(201).send(following);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});

postRouter.put("/like/:id/:authorID", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const postID = req.params.id;
    const authorID = req.params.authorID;
    const like = await LikeModel.findOne({ UserID, postID });

    if (like) {
      await LikeModel.deleteOne({ _id: like._id });
      await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: -1 } });
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

postRouter.delete("/delete/:id", async (req, res) => {
  try {
    const post = await PostModel.findOne({ _id: req.params.id });
    const UserID = req.body.UserDetails.UserID;
    if (UserID == post.authorID) {
      if (post.photo || post.pdf || post.video) {
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: post.photo || post.pdf || post.video,
        };
        s3.deleteObject(deleteParams, function (err, data) {
          if (err) {
            console.log("Error", err);
            res.status(500).send({ err: err });
          } else {
            PostModel.findByIdAndDelete({ _id: req.params.id })
              .then(() => {
                res
                  .status(202)
                  .send({ msg: "Post and file deleted successfully!" });
              })
              .catch((err) => {
                res.status(500).send({ err: err });
              });
          }
        });
      } else {
        PostModel.findByIdAndDelete({ _id: req.params.id })
          .then(() => {
            res
              .status(202)
              .send({ msg: "Post and file deleted successfully!" });
          })
          .catch((err) => {
            res.status(500).send({ err: err });
          });
      }
    } else {
      res.send({ msg: "You are not authorised!" });
    }
  } catch (error) {
    res.send({ Errormsg: error });
  }
});

module.exports = { postRouter };

// token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRGV0YWlscyI6eyJVc2VySUQiOiI2NWIxNDc4ODA4NGIxZWJiNmUzY2NlNDgiLCJVc2VyTmFtZSI6InBlcnNvbjEiLCJVc2VyRW1haWwiOiJwMUBtYWlsLmNvbSJ9LCJpYXQiOjE3MDYxODY3MjgsImV4cCI6MTcwNjc5MTUyOH0.NRrc42zEqd7BcdX7uHoWBaBCDqtJ7uH1BtkpXzY6zhA
