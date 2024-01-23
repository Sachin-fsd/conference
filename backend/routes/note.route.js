const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { NoteModel } = require("../models/notes.model");
const { RegisterModel } = require("../models/register.model");

const noteRouter = express.Router();

noteRouter.get("/", async (req, res) => {
  try {
    const notes = await NoteModel.find().sort({CreatedAt:-1});
    // console.log(req.body);
    res.send(notes);
  } catch (error) {
    res.json({ err: error });
  }
});

noteRouter.get("/mynotes", async (req, res) => {
  try {
    const notes = await NoteModel.find({ UserID: req.body.UserID });
    res.send(notes);
  } catch (error) {
    res.json({ err: error });
  }
});

noteRouter.post("/post", async (req, res) => {
  const payload = req.body;
  try {
    const note = new NoteModel(payload);
    await note.save();
    res.status(201).send({ msg: "Notes saved successfully!" });
  } catch (error) {
    res.json({ err: error });
  }
});

noteRouter.patch("/update/:id", async (req, res) => {
  try {
    const ID = await NoteModel.findOne({ _id: req.params.id });
    const UserID = req.body.UserDetails.UserID;
    if (UserID == ID.UserID) {
      try {
        await NoteModel.findByIdAndUpdate({ _id: req.params.id }, req.body);
        res.status(202).send({ msg: "Notes updated successfully!" });
      } catch (error) {
        res.status(400).json({ err: error });
      }
    } else {
      res.send({ msg: "You are not authorised!" });
    }
  } catch (error) {
    res.send({ Errormsg: error });
  }
});

noteRouter.delete("/delete/:id", async (req, res) => {
  try {
    const ID = await NoteModel.findOne({ _id: req.params.id }, {_id:0,"UserDetails.UserID":1});
    const UserID = req.body.UserDetails.UserID;
    if (UserID == ID.UserDetails.UserID) {
      try {
        await NoteModel.findByIdAndDelete({ _id: req.params.id });
        res.status(202).send({ msg: "Note Deleted successfully!" });
      } catch (error) {
        res.status(400).json({ err: error });
      }
    } else {
      res.send({ msg: "You are not authorised!" });
    }
  } catch (error) {
    res.send({ Errormsg: error });
  }
});


module.exports = { noteRouter };
