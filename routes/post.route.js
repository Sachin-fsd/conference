const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { RegisterModel } = require("../models/register.model");
const { PostModel, LikeModel } = require("../models/post.model");

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const Users = await RegisterModel.find({},{name:1, email:1, _id:1}).sort({CreatedAt: -1}).limit(7);
    const userLikes = await LikeModel.find({ UserID }).limit(20);

    const likedPostIds = new Set(
      userLikes.map((like) => like.postID.toString())
    );

    const posts = await PostModel.find().sort({ CreatedAt: -1 }).limit(20);

    const postWithLikes = posts.map((post) => {
      const liked = likedPostIds.has(post._id.toString());
      return { ...post._doc, liked };
    });

    res
      .status(200)
      .send({ UserDetails: req.body.UserDetails, posts: postWithLikes, Users });
  } catch (error) {
    res.json({ err: error });
  }
});

// postRouter.get("/mynotes", async (req, res) => {
//   try {
//     const notes = await NoteModel.find({ UserID: req.body.UserID });
//     res.send(notes);
//   } catch (error) {
//     res.json({ err: error });
//   }
// });

postRouter.post("/post", async (req, res) => {
  const payload = req.body;
  try {
    const post = new PostModel(payload);
    await post.save();
    res.status(201).send({ msg: "Notes saved successfully!" });
  } catch (error) {
    res.json({ err: error });
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
    } else {
      await LikeModel.create({ UserID, postID, authorID });
      await PostModel.updateOne({ _id: postID }, { $inc: { likeCount: 1 } });
    }

    res.send({ msg: "Done with like", ok: true });
  } catch (error) {
    res.send({ msg: "Error while liking the post", error });
  }
});

postRouter.delete("/delete/:id", async (req, res) => {
  try {
    const ID = await PostModel.findOne(
      { _id: req.params.id },
      { _id: 0, "UserDetails.UserID": 1 }
    );
    const UserID = req.body.UserDetails.UserID;
    if (UserID == ID.UserDetails.UserID) {
      try {
        await PostModel.findByIdAndDelete({ _id: req.params.id });
        res.status(202).send({ msg: "Text Deleted successfully!" });
      } catch (error) {
        res.status(400).json({ err: error });
      }
    } else {
      res.send({ msg: "You are not authorised!" });
    }
  } catch (error) {
    res.send({ Errormsg: error });
  }
});

postRouter.get("/:id", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;

    // const userLikes = await LikeModel.find({ UserID }).limit(20);
    const userLikes = await LikeModel.find({UserID, authorID:req.params.id})
    const likedPostIds = new Set(
      userLikes.map((like) => like.postID.toString())
    );

    const UserDetails = await RegisterModel.findOne({_id:req.params.id}, {name:1, email:1, _id:1})
    // console.log(authorDetails);
    const posts = await PostModel.find({"UserDetails.UserID":req.params.id}).sort({ CreatedAt: -1 }).limit(20);
    const postCount = posts.length;
    UserDetails.postCount = postCount
    const postWithLikes = posts.map((post) => {
      const liked = likedPostIds.has(post._id.toString());
      return { ...post._doc, liked };
    });

    res
      .status(200)
      .send({ UserDetails, posts: postWithLikes});
  } catch (error) {
    res.json({ err: error });
  }
});


module.exports = { postRouter };

// token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRGV0YWlscyI6eyJVc2VySUQiOiI2NWIxNDc4ODA4NGIxZWJiNmUzY2NlNDgiLCJVc2VyTmFtZSI6InBlcnNvbjEiLCJVc2VyRW1haWwiOiJwMUBtYWlsLmNvbSJ9LCJpYXQiOjE3MDYxODY3MjgsImV4cCI6MTcwNjc5MTUyOH0.NRrc42zEqd7BcdX7uHoWBaBCDqtJ7uH1BtkpXzY6zhA
