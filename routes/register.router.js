const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { RegisterModel } = require("../models/register.model");

const registerRouter = express.Router();

registerRouter.get("/", (req, res) => {
  res.render("register");
});

registerRouter.post("/", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await RegisterModel.findOne({ email });
    if (user) {
      res.status(409).send({ msg: "User already exists", ok: false });
    } else {
      bcrypt.hash(password, 2, async (err, hashed) => {
        if (err) {
          res.status(400).send({ msg: "Error while Hashing", ok: false });
        } else {
          await RegisterModel.create({ name, email, password: hashed });
          const user = await RegisterModel.find({ email });
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
          res.cookie("token", token, { httpOnly: true });
          res.cookie("UserDetails", UserDetails);
          res.status(201).redirect("/");
        }
      });
    }
  } catch (error) {
    res.status(400).send({ msg: "Error while registering", ok: false });
  }
});

module.exports = { registerRouter };
