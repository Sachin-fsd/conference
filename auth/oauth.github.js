const express = require("express");
const jwt = require("jsonwebtoken")
const { RegisterModel } = require("../models/register.model");
require("dotenv").config();


const githubAuthRouter = express.Router()

githubAuthRouter.get("/github", async (req, res) => {
    const { code } = req.query;
    const Access_details = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.client_id_github,
          client_secret: process.env.client_secret_github,
          code,
        }),
      }
    )
      .then((res) => res.json())
      .catch((err) => console.log(err));
   
  
    const User_details = await fetch("https://api.github.com/user", {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${Access_details.access_token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  
    const User_email = await fetch("https://api.github.com/user/emails", {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${Access_details.access_token}`,
        Accept: "application/json",
      },
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  
      const UserDetails = {
          name:User_details.name,
          email:User_email[0].email,
          password:"dfgdgdgdr346t3tgdfgv",
          dp:User_details.avatar_url
      }
      // console.log(UserDetails);

      const user = await RegisterModel.findOne({email:UserDetails.email});
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
        res.cookie('token', `Bearer ${token}`, { httpOnly: true });
        res.cookie('UserDetails', JSON.stringify(UserDetails));
        res.redirect("/");
      }else{
        const newUser = new RegisterModel({name:User_details.name, email:User_email[0].email, password:"sadkiaeubai734862hiw"});
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
        res.cookie('token', `Bearer ${token}`, { httpOnly: true });
        res.cookie('UserDetails', JSON.stringify(UserDetails));
        res.redirect("/");
      }
  });

  module.exports = {githubAuthRouter}