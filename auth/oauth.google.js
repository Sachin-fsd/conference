const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const express = require("express");
const { RegisterModel } = require("../models/register.model");
const jwt = require("jsonwebtoken");
require("dotenv").config()

passport.use(
  new GoogleStrategy(
    {
      clientID:
        process.env.clientID_google,
      clientSecret: process.env.clientSecret_google,
      callbackURL: "/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, cb) {
      // console.log(accessToken, "accesstoken")
      const UserDetails = {
        name: profile._json.name,
        email: profile._json.email,
        dp: profile._json.picture,
      };
      return cb(null, UserDetails);
    }
  )
);

const googleAuthRouter = express.Router();

googleAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  async function (req, res) {
    // Successful authentication, redirect home.
    // console.log(req.user);
    // res.redirect("/");
    // res.send("Done");
    const user = await RegisterModel.findOne({ email: req.user.email });
    if (user) {
      const UserDetails = {
        UserID: user._id,
        UserName: user.name,
        UserEmail: user.email,
      };
      const token = jwt.sign(
        { UserDetails: UserDetails },
        process.env.secret_key,
        { expiresIn: "7 days" }
      );
      // res
      //   .status(200)
      //   .json({ msg: "Login Successfull", token, ok: true, UserDetails });
      res.cookie('token', token, { httpOnly: true });
      res.cookie('UserDetails', JSON.stringify(UserDetails), { httpOnly: true });
      // Redirect to login page
      // console.log("successfull..");
      res.redirect("/");
    }else{
      const newUser = new RegisterModel({name:req.user.name, email:req.user.email, password:"sadkiaeubai734862hiw", dp:req.user.dp});
      await newUser.save();
      const user = await RegisterModel.findOne({ email: req.user.email });
      const UserDetails = {
        UserID: user._id,
        UserName: user.name,
        UserEmail: user.email,
      };
      const token = jwt.sign(
        { UserDetails: UserDetails },
        process.env.secret_key,
        { expiresIn: "7 days" }
      );
      // res
      //   .status(200)
      //   .json({ msg: "Login Successfull", token, ok: true, UserDetails });
      res.cookie('token', token, { httpOnly: true });
      res.cookie('UserDetails', JSON.stringify(UserDetails));
      // Redirect to login page
      // console.log("Successful");
      res.redirect("/")
    }
  }
);

module.exports = { googleAuthRouter };
