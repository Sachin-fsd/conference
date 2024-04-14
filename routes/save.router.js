const express = require("express");
const mongoose = require("mongoose");
const { RegisterModel } = require("../models/register.model");
const { NotificationModel } = require("../models/notifications.model");
const { SaveModel } = require("../models/save.model");

const saveRouter = express.Router();

saveRouter.get("/", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;

    const saves = await SaveModel.find(
      { UserID },
      { _id: 1, authorID: 1, postID: 1, CreatedAt: 1 }
    )
      .sort({ CreatedAt: -1 })
      .populate({
        path: "postID",
        select: "_id text CreatedAt",
        model: "post",
      })
      .populate({
        path: "authorID",
        select: "_id name dp",
        model: "user",
      });

      console.log(saves)

    res.render("save", {
      UserDetails: req.body.UserDetails,
      saves,
    });
  } catch (error) {
    console.log(error);
    res.json({ err: error });
  }
});

saveRouter.post("/:id/:authorID", async (req, res) => {
  try {
    const UserID = req.body.UserDetails.UserID;
    const postID = req.params.id;
    const authorID = req.params.authorID;
    const saved = await SaveModel.findOne({ UserID, postID });

    if (saved) {
      await SaveModel.deleteOne({ _id: saved._id });
    } else {
      await SaveModel.create({ UserID, postID, authorID });
    }

    res.send({ msg: "Done with save", ok: true });
  } catch (error) {
    res.send({ msg: "Error while saving the post", error });
  }
});

module.exports = { saveRouter };
