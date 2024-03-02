const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const { RegisterModel } = require("../models/register.model")
require("dotenv").config()

const registerRouter = express.Router()
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.mail_admin,
    pass: process.env.mail_password
  }
})
registerRouter.get("/", (req, res) => {
  res.render("register")
})

registerRouter.post("/", async (req, res) => {
  const { name, email, password, dp } = req.body
  if (!email || !name || !password) {
    res.status(409).send({ msg: "Wrong Credentials", ok: false })
  } else {
    try {
      const user = await RegisterModel.findOne({ email })
      if (user) {
        res.status(409).send({ msg: "User already exists", ok: false })
      } else {
        bcrypt.hash(password, 2, async (err, hashed) => {
          if (err) {
            res.status(400).send({ msg: "Error while Hashing", ok: false })
          } else {
            await RegisterModel.create({ name, email, password: hashed, dp })
            const user = await RegisterModel.find({ email })
            const UserDetails = {
              UserID: user._id,
              UserName: user.name,
              UserEmail: user.email
            }
            const token = jwt.sign(
              { UserDetails },
              process.env.secret_key,
              { expiresIn: "7 days" }
            )
            res.cookie("token", token, { httpOnly: true })
            res.cookie("UserDetails", UserDetails)
            transporter.sendMail({
              to: email,
              from: process.env.mail_admin,
              subject: 'Welcome to Conference!',
              text: `Dear ${name},
            
            Thank you for registering at Conference! We're thrilled to have you on board.
            
            We're committed to providing you with the best experience possible.
            If you have any questions, need help, want to report a bug, or just want to share your thoughts,
            Please feel free to reply to this email. We're here to help!
            
            Looking forward to seeing you on Conference.
            
            Best,
            Sachin
            Founder and CEO`
            })

              .then(() => {
                console.log("mail send successfully!")
              })
              .catch((err) => {
                console.log("Error while sendig mail")
                console.log(err)
              })
            res.status(201).redirect("/login")
          }
        })
      }
    } catch (error) {
      res.status(400).send({ msg: "Error while registering", ok: false })
    }
  }
})

module.exports = { registerRouter }
