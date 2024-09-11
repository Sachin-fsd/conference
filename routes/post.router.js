const express = require("express");
const mongoose = require("mongoose");
const { RegisterModel } = require("../models/register.model");
const { PostModel, LikeModel } = require("../models/post.model");
const { MessageModel, FollowModel } = require("../models/message.model");
const multer = require("multer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { fromEnv } = require("@aws-sdk/credential-provider-env");
const { NotificationModel } = require("../models/notifications.model");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');
require("dotenv").config();

const postRouter = express.Router();

postRouter.get("/", async (req, res) => {
  try {
    const page = req.query.page || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const UserID = req.body.UserDetails.UserID;

    // Fetch the user details to check if the user is a student and get their course
    const user = await RegisterModel.findOne(
      { _id: UserID },
      { password: 0 }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const userCourse = user.course;
    const isStudent = user.role === 'student';  // Assuming the 'role' field indicates whether the user is a student

    // Define the match condition
    let matchCondition = {};

    if (isStudent) {
      // If the user is a student, filter posts based on 'target'
      matchCondition = {
        $or: [
          { target: 'all' }, // Show posts with target 'all' to everyone
          { target: userCourse } // Show posts where the target matches the user's course
        ]
      };
    } else {
      // If the user is not a student, show all posts
      matchCondition = {};
    }

    // Fetch posts based on the match condition
    const posts = await PostModel.aggregate([
      { $sort: { CreatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $match: matchCondition },
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
          "UserDetails.UserSchool": "$author.school",
          "UserDetails.UserSection": "$author.section",
          "UserDetails.UserCourse": "$author.course",
          "UserDetails.UserRollno": "$author.rollno",
          "UserDetails.UserHandle": "$author.handle",
          "UserDetails.UserRole": "$author.role",
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
      $or: [{ senderID: UserID }, { receiverID: UserID }],
    })
      .populate('senderID', '_id name dp handle') // fetch from sender
      .populate('receiverID', '_id name dp handle') // fetch from receiver
      .sort({ CreatedAt: -1 }).limit(5);

    // Fetch the users if less than 5 messages
    let users = [];
    if (messages.length < 5) {
      users = await RegisterModel.find({}, { _id: 1, name: 1, dp: 1 })
        .sort({ CreatedAt: -1 })
        .limit(5);
    }
    // console.log(posts)
    if (!req.query.page) {
      res.render("index", {
        UserDetails: req.body.UserDetails,
        posts,
        messages,
        users,
      });
    } else {
      res.status(200).send({ posts });
    }
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

const REGION = "ap-south-1"
const s3Client = new S3Client({
  region: REGION,
  credentials: fromEnv()
});
postRouter.post("/", upload.single("file"), async (req, res) => {
  // Check if a file was uploaded
  // console.log(req.file)

  if (req.file) {
    let fileBuffer = req.file.buffer;

    // If the file is an image, compress it using sharp
    if (req.file.mimetype.startsWith("image/")) {
      fileBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 500 }) // Resize the image to a width of 500 pixels
        .jpeg({ quality: 80 }) // Convert to JPEG with 80% quality
        .toBuffer(); // Convert the result to a Buffer
    }

    // File was uploaded, proceed with AWS upload
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: req.file.originalname,
      Body: fileBuffer,
      ContentType: req.file.mimetype,
      ContentDisposition: "inline",
    };
    // console.log(params)

    try {
      const data = await s3Client.send(new PutObjectCommand(params));
      console.log("Success, file uploaded", data);
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${REGION}.amazonaws.com/${encodeURIComponent(req.file.originalname)}`;
      const post = new PostModel({
        authorID: req.body.authorID,
        text: req.body.text,
        target: req.body.target,
        photo: req.file.mimetype.startsWith("image/") ? fileUrl : null,
        pdf: req.file.mimetype == "application/pdf" ? fileUrl : null,
        video: req.file.mimetype == "video/mp4" ? fileUrl : null,
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
    } catch (error) {
      console.log(error)
      res.status(500).send({ err: error });
    }
  } else {
    // No file was uploaded, just save the text to MongoDB
    const post = new PostModel({
      authorID: req.body.authorID,
      text: req.body.text,
      target: req.body.target,
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
      { password: 0 }
    );

    const posts = await PostModel.aggregate([
      { $match: { authorID: new mongoose.Types.ObjectId(ID) } },
      { $sort: { CreatedAt: -1 } },
      { $limit: 20 },
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
          "UserDetails.UserSchool": "$author.school",
          "UserDetails.UserSection": "$author.section",
          "UserDetails.UserCourse": "$author.course",
          "UserDetails.UserRollno": "$author.rollno",
          "UserDetails.UserHandle": "$author.handle",
          "UserDetails.UserRole": "$author.role",
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
                    { $eq: ["$UserID", new mongoose.Types.ObjectId(req.body.UserDetails.UserID)] },
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
                    { $eq: ["$UserID", new mongoose.Types.ObjectId(req.body.UserDetails.UserID)] },
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
          author: 0
        },
      },
    ]);
    const messages = await MessageModel.find({
      $or: [{ "sender.UserID": req.body.UserDetails.UserID }, { "receiver.UserID": req.body.UserDetails.UserID }],
    }).sort({ CreatedAt: -1 });

    // Fetch the users
    let users = [];
    if (messages.length < 5) {
      users = await RegisterModel.find({}, { _id: 1, name: 1, dp: 1 })
        .sort({ CreatedAt: -1 })
        .limit(5);
    }

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

    // console.log(posts)

    res.render("profile", {
      UserDetails: req.body.UserDetails,
      ProfileDetails: {
        UserID: ID,
        UserName: user.name,
        UserEmail: user.email,
        UserBio: user.bio,
        UserDp: user.dp,
        UserSchool: user.school,
        UserCourse: user.course,
        UserSection: user.section,
        UserRollno: user.rollno,
        UserHandle: user.handle,
        UserRole: user.role,
      },
      posts,
      follow,
      following,
      followers,
      messages,
      users
    });
  } catch (error) {
    console.log(error)
    res.status(400).redirect("/");
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
          UserHandle: user.handle,
        },
      });
    }
  } catch (error) {
    return res.redirect("/");
  }
});

// postRouter.put("/profileEdit/:id", async (req, res) => {
//   let { UserName, UserBio, dp } = req.body;
//   let ID = req.params.id;
//   try {
//     if (ID == req.body.UserDetails.UserID) {
//       let user = await RegisterModel.findOne({ _id: ID });
//       user.name = UserName;
//       user.bio = UserBio;
//       user.dp = dp;
//       await user.save();
//       res.status(201).send({ msg: "Done with editting" });
//     } else {
//       res.status(400).send({ msg: "Error" });
//     }
//   } catch (error) {
//     res.status(400).send({ msg: error.message });
//   }
// });

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
          dp: "$follower_info.dp",
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
          dp: "$following_info.dp",
        },
      },
    ]);
    res.status(201).send(following);
  } catch (error) {
    res.status(400).send({ msg: error.message });
  }
});

postRouter.delete("/delete/:id", async (req, res) => {
  try {
    const post = await PostModel.findOne({ _id: req.params.id });
    const UserID = req.body.UserDetails.UserID;
    if (UserID == post.authorID) {
      if (post.photo || post.pdf || post.video) {
        const fileKey = post.photo || post.pdf || post.video;
        const deleteParams = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: fileKey.substring(fileKey.lastIndexOf("/") + 1),
        };

        try {
          const data = await s3Client.send(new DeleteObjectCommand(deleteParams));
          console.log("Success, file deleted", data);

          PostModel.findByIdAndDelete({ _id: req.params.id })
            .then(() => {
              res
                .status(202)
                .send({ msg: "Post and file deleted successfully!" });
            })
            .catch((err) => {
              res.status(500).send({ err: err });
            });
        } catch (err) {
          console.log("Error", err);
          res.status(500).send({ err: err });
        }
      } else {
        PostModel.findByIdAndDelete({ _id: req.params.id })
          .then(() => {
            res
              .status(202)
              .send({ msg: "Post deleted successfully!" });
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
})

module.exports = { postRouter };

// token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRGV0YWlscyI6eyJVc2VySUQiOiI2NWIxNDc4ODA4NGIxZWJiNmUzY2NlNDgiLCJVc2VyTmFtZSI6InBlcnNvbjEiLCJVc2VyRW1haWwiOiJwMUBtYWlsLmNvbSJ9LCJpYXQiOjE3MDYxODY3MjgsImV4cCI6MTcwNjc5MTUyOH0.NRrc42zEqd7BcdX7uHoWBaBCDqtJ7uH1BtkpXzY6zhA
