const express = require("express");
const { RegisterModel } = require("../models/register.model");

const searchRouter = express.Router();

// searchRouter.get("/", (req, res) => {
//   res.render("search");
// });

searchRouter.get("/", async (req, res) => {
  // console.log(req.query,"line10");
  try {
    const { name } = req.query;
    if (name) {
      console.log("name", name);
      const regex = new RegExp(name, "i");
      const users = await RegisterModel.find(
        { name: { $regex: regex } },
        { _id: 1, name: 1 }
      );
      // const users1 = await RegisterModel.find({name})
      // console.log(users,"users");
      res.status(200).json({ users });
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
