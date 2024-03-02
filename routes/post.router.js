const express = require("express");
const mongoose = require("mongoose")
const { RegisterModel } = require("../models/register.model");
const { PostModel, LikeModel } = require("../models/post.model");
const multer = require("multer");
const Aws = require("aws-sdk");
require("dotenv").config();

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  try {
    // const posts = await PostModel.find().sort({ CreatedAt: -1 }).limit(20);

    const UserID = req.body.UserDetails.UserID;

    const posts = await PostModel.aggregate([
      {
        $lookup: {
          from: "likes", 
          let: { post_id: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$UserID",new mongoose.Types.ObjectId(UserID)] },
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
      { $addFields: { liked: { $size: "$likes" } } },
      { $sort: { CreatedAt: -1 } },
      { $limit: 20 },
    ]);

    console.log(req.route.path, "line 27");
    console.log(posts[0]);
    res.render("index", { UserDetails: req.body.UserDetails, posts });
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
          UserDetails: JSON.parse(req.body.UserDetails),
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
      UserDetails: JSON.parse(req.body.UserDetails),
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
    // const UserID = req.body.UserDetails.UserID;
    // const Users = await RegisterModel.find({},{name:1, email:1, _id:1}).sort({CreatedAt: -1}).limit(7);
    // const userLikes = await LikeModel.find({ UserID }).limit(20);

    // const likedPostIds = new Set(
    //   userLikes.map((like) => like.postID.toString())
    // );
    const user = await RegisterModel.findOne(
      { _id: ID },
      { _id: 1, name: 1, email: 1 }
    );
    const posts = await PostModel.find({ "UserDetails.UserID": ID })
      .sort({ CreatedAt: -1 })
      .limit(20);
    // console.log(posts);
    // const postWithLikes = posts.map((post) => {
    //   const liked = likedPostIds.has(post._id.toString());
    //   return { ...post._doc, liked };
    // });

    res.render("profile", {
      UserDetails: req.body.UserDetails,
      ProfileDetails: {
        UserID: user._id,
        UserName: user.name,
        UserEmail: user.email,
      },
      posts,
    });
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
      { "UserDetails.UserID": 1 }
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

// postRouter.get("/:id", async (req, res) => {
//   try {
//     const UserID = req.body.UserDetails.UserID;

//     // const userLikes = await LikeModel.find({ UserID }).limit(20);
//     const userLikes = await LikeModel.find({ UserID, authorID: req.params.id });
//     const likedPostIds = new Set(
//       userLikes.map((like) => like.postID.toString())
//     );

//     const UserDetails = await RegisterModel.findOne(
//       { _id: req.params.id },
//       { name: 1, email: 1, _id: 1 }
//     );
//     // console.log(authorDetails);
//     const posts = await PostModel.find({ "UserDetails.UserID": req.params.id })
//       .sort({ CreatedAt: -1 })
//       .limit(20);
//     const postCount = posts.length;
//     UserDetails.postCount = postCount;
//     const postWithLikes = posts.map((post) => {
//       const liked = likedPostIds.has(post._id.toString());
//       return { ...post._doc, liked };
//     });

//     res.status(200).send({ UserDetails, posts: postWithLikes });
//   } catch (error) {
//     res.json({ err: error });
//   }
// });

module.exports = { postRouter };

// token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRGV0YWlscyI6eyJVc2VySUQiOiI2NWIxNDc4ODA4NGIxZWJiNmUzY2NlNDgiLCJVc2VyTmFtZSI6InBlcnNvbjEiLCJVc2VyRW1haWwiOiJwMUBtYWlsLmNvbSJ9LCJpYXQiOjE3MDYxODY3MjgsImV4cCI6MTcwNjc5MTUyOH0.NRrc42zEqd7BcdX7uHoWBaBCDqtJ7uH1BtkpXzY6zhA
