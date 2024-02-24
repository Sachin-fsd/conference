const express = require("express");
const { RegisterModel } = require("../models/register.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { OtpModel } = require("../models/otp.model");
const nodemailer = require("nodemailer");
require("dotenv").config();

const userRouter = express.Router();

userRouter.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const users = await RegisterModel.find({ email });
    if (users.length > 0) {
      res.json({ msg: "User already registered" });
    } else {
      bcrypt.hash(password, 2, async (err, hashed) => {
        if (err) {
          res.json({ err: "Error while hashing password" });
        } else {
          const user = new RegisterModel({ name, email, password: hashed });
          await user.save();
          res
            .status(201)
            .json({ msg: "User registered successfully!", ok: true });
        }
      });
    }
  } catch (error) {
    res.json({ err: error, error: "Error while Registering" });
  }
});

userRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await RegisterModel.findOne({ email });
    if (Object.keys(user).length === 0) {
      res.status(404).send({ msg: "Wrong credentials." });
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
          res
            .status(200)
            .json({ msg: "Login Successfull", token, ok: true, UserDetails });
        } else {
          res.status(404).json({ msg: "Wrong Credentials" });
        }
      });
    }
  } catch (error) {
    res.json({ err: error });
  }
});

userRouter.post("/getotp", async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const email = req.body.email;

  const user = await RegisterModel.findOne({ email });
  if (user) {
    await OtpModel.deleteMany({email});
    await OtpModel.create({ email, otp });
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.mail_admin,
        pass: process.env.mail_password,
      },
    });

    transporter
      .sendMail({
        to: email,
        from: process.env.mail_admin,
        headers: "OTP for Verification",
        text: `this is your OTP: ${otp}`,
      })
      .then(() => {
        console.log("mail send successfully!");
        res.send({ msg: "mail is sent", ok: true });
      })
      .catch((err) => {
        console.log("Error while sendig mail");
        console.log(err);
        res.send({ err, ok: false });
      });
  } else {
    res.send({ msg: "User Does't exist" });
  }
});

userRouter.post("/verifyotp", async (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const user = await OtpModel.find({ email }).sort({ CreatedAt: -1 });
  const db_otp = user[0].otp;
  if (Number(otp) == Number(db_otp)) {
    res.send({ msg: "OTP verified successfully", ok: true });
  } else {
    console.log(user);
    res.send({ msg: "invalid otp", ok: false, user, gototp: otp });
  }
});

userRouter.post("/forgetlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await RegisterModel.findOne({ email });
    if (!user) {
      res.status(404).send({ msg: "Wrong credentials." });
    } else {
      bcrypt.hash(password, 2, async (err, hashed) => {
        if (err) {
          res.json({ err: "Error while hashing password" });
        } else {
          user.password = hashed
          await user.save();
          res
            .status(201)
            .json({ msg: "User registered successfully!", ok: true });
        }
      });
      
    }
  } catch (error) {
    res.json({ err: error });
  }
});

module.exports = { userRouter };
