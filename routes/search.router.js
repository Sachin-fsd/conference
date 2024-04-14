const express = require("express");
const { RegisterModel } = require("../models/register.model");
const { PostModel } = require("../models/post.model");

const searchRouter = express.Router();

searchRouter.get("/", async (req, res) => {
  try {
    const { query } = req.query;
    if (query) {
      console.log("query", query);
      const regex = new RegExp(query, "i");
      const users = await RegisterModel.find(
        { name: { $regex: regex } },
        { _id: 1, name: 1 }
      );
      const posts = await PostModel.find(
        { text: { $regex: regex } },
        { _id: 1, authorID: 1, text: 1, CreatedAt: 1 }
      ).populate('authorID', '_id name dp');


      res.status(200).json({ users,posts });

    } else {
      const users = await RegisterModel.find(
        {},
        { _id: 1, name: 1, dp: 1 }
      ).limit(10);
      res.render("search", { users, UserDetails: req.body.UserDetails });
    }
  } catch (error) {
    res.status(401).render("search");
  }
});


module.exports = { searchRouter };
