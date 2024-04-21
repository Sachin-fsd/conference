const express = require("express");
const { OtpModel } = require("../models/otp.model");
const { RegisterModel } = require("../models/register.model");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const forgetRouter = express.Router();

forgetRouter.get("/", (req, res) => {
  res.render("forgetpwd");
});

forgetRouter.post("/getotp", async (req, res) => {
  const otp = Math.floor(1000 + Math.random() * 9000);

  const email = req.body.email;

  const user = await RegisterModel.findOne({ email });
  if (Object.keys(user).length > 0) {
    await OtpModel.deleteMany({ email });
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
        headers: `OTP for Verification ${otp}`,
        text: `this is your OTP: ${otp}`,
      })
      .then(() => {
        console.log("mail send successfully!");
        res.status(201).send({ msg: "mail is sent", ok: true });
      })
      .catch((err) => {
        console.log("Error while sendig mail");
        console.log(err);
        res.status(400).send({ err, ok: false });
      });
  } else {
    res.send({ msg: "User Does't exist" });
  }
});

forgetRouter.post("/verifyotp", async (req, res) => {
  const otp = req.body.otp;
  const email = req.body.email;
  const user = await OtpModel.find({ email }).sort({ CreatedAt: -1 });
  const db_otp = user[0].otp;
  if (Number(otp) == Number(db_otp)) {
    res.status(200).send({ msg: "OTP verified successfully", ok: true });
  } else {
    // console.log(user);
    res.status(400).send({ msg: "invalid otp", ok: false });
  }
});

forgetRouter.post("/forgetlogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await RegisterModel.findOne({ email });
    let otpUser = await OtpModel.find({email})
    if(Object.keys(user).length !== 0 && otpUser.length !== 0) {
      bcrypt.hash(password, 2, async (err, hashed) => {
        if (err) {
          res.status(402).json({ err: "Error while hashing password" });
        } else {
          user.password = hashed;
          await user.save();
          res.status(201).redirect("/login");
        }
      });
    }else {
      res.status(404).send({ msg: "Wrong credentials." });
    }
  } catch (error) {
    res.status(401).json({ err: error });
  }
});

module.exports = { forgetRouter };
