const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { PostModel } = require("../models/post.model");
const { FollowModel } = require("../models/message.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const profileRouter = express.Router();

profileRouter.put("/:id", async (req, res) => {
  let ID = req.params.id;
  console.log(ID);
  if (ID !== req.body.UserDetails.UserID) {
    res.status(400).json({ err: "Unauthorised" });
  } else {
    const {UserHandle,UserBio,dp,email,password} = req.body;
    try {
      let user = await RegisterModel.findOne({ email });
      if (Object.keys(user).length === 0) {
        res.status(401).send({ msg: "Wrong credentials." });
      } else {
        bcrypt.compare(password, user.password, async (err, result) => {
          if (result) {
            user.handle = UserHandle;
            user.bio = UserBio;
            user.dp = dp;
            await user.save();

            const UserDetails = {
              UserID: user._id,
              UserName: user.name,
              UserEmail: user.email,
              UserDp: user.dp,
              UserSchool: user.school,
              UserCourse: user.course,
              UserSection: user.section,
              UserRollno: user.rollno,
              UserHandle: user.handle,
            };
            const token = jwt.sign(
              { UserDetails: UserDetails },
              process.env.secret_key,
              { expiresIn: "7 days" }
            );
            res.cookie(
              "token",
              token,
              { httpOnly: true },
              { maxAge: 60 * 60 * 24 * 7 }
            );
            res.cookie("UserDetails", UserDetails);
            console.log("p",UserDetails)
            res.status(200).send({ msg: "Done with login data." });
          } else {
            res.status(404).json({ msg: "Wrong Credentials" });
          }
        });
      }
    } catch (error) {
      res.status(400).json({ error });
    }
  }
});

module.exports = { profileRouter };
