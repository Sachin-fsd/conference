const express = require("express");
const { RegisterModel } = require("../models/register.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config()

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password} = req.body;
  console.log("req.body=>",req.body);
  try {
    const users = await RegisterModel.find({ email });
    if (users.length > 0) {
      res.json({ msg: "User already registered" });
    } else {
      bcrypt.hash(password, 2, async (err, hashed) => {
        if (err) {
          res.json({ err: "Error while registering" });
        } else {
          const user = new RegisterModel({ name, email, password: hashed});
          await user.save();
          res.status(201).json({ msg: "User registered successfully!", ok:true});
        }
      });
    }
  } catch (error) {
    res.json({ err: error, "error":"Error while Registering" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegisterModel.findOne({ email });
    if (user.length === 0) {
      res.status(404).send({ msg: "Wrong credentials" });
    } else {
      bcrypt.compare(password, user.password, async (err, result) => {
        if (result) {
          const UserDetails = {"UserID":user._id, "UserName":user.name}
          console.log("UserDetails=>",UserDetails);
          const token = jwt.sign({"UserDetails":UserDetails}, process.env.secret_key, {expiresIn:"7h"});
          res.status(200).json({ msg: "Login Successfull", token, ok:true, UserDetails});
        } else {
          res.status(404).json({ msg: "Wrong Credentials" });
        }
      });
    }
  } catch (error) {
    res.json({ err: error });
  }
});

module.exports = { userRouter };
