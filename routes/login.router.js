const express = require('express');
const { RegisterModel } = require('../models/register.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser")
require("dotenv").config();


const loginRouter = express.Router();

loginRouter.get("/",(req,res)=>{
    res.render("login")
})


loginRouter.post("/", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await RegisterModel.findOne({ email });
      if (Object.keys(user).length === 0) {
        res.status(401).send({ msg: "Wrong credentials." });
      } else {
        bcrypt.compare(password, user.password, async (err, result) => {
          if (result) {
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
            res.cookie("token",token,{ httpOnly: true }, {maxAge:60*60*24*7});
            res.cookie("UserDetails",UserDetails);
            // req.session.UserDetails = UserDetails
            console.log("line 38");
            res.status(200).redirect("/")

          } else {
            res.status(404).json({ msg: "Wrong Credentials" });
          }
        });
      }
    } catch (error) {
      res.status(400).json({ err: error });
    }
  });
  

module.exports = {loginRouter}