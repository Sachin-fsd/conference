const express = require("express");
const { BlackListTokenModel } = require("../models/blackListToken.model");

const settingsRouter = express.Router();

settingsRouter.get("/", async (req, res) => {
  try {
    const ID = req.body.UserDetails.UserID;

    res.render("settings", { UserDetails: req.body.UserDetails });
  } catch (error) {
    res.status(401).render("index");
  }
});

settingsRouter.post("/logout", async (req, res) => {
  try {
    const token = req.cookies.token;
    res.cookie('token', '', { maxAge: 1 });

    await BlackListTokenModel.create({ token })

    res.redirect("/login"); 
  } catch (error) {
    res.status(401).render("index");
  }
});

module.exports = { settingsRouter };
