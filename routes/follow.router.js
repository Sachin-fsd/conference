const express = require("express");
const mongoose = require("mongoose");
const { FollowModel } = require("../models/message.model");
const { NotificationModel } = require("../models/notifications.model");

const followRouter = express.Router()

followRouter.post("/:id",async(req,res)=>{
    const ID = req.params.id
    const UserID = req.body.UserDetails.UserID
    try {
        let follow = await FollowModel.findOne({follower:UserID, following:ID})
        if(!follow){
            await FollowModel.create({follower:UserID, following:ID})
            await NotificationModel.create({receiverID:ID,purpose:"started following",senderID:UserID})
        }else{
            await NotificationModel.deleteOne({receiverID:ID,purpose:"started following",senderID:UserID})
            await FollowModel.deleteOne({follower:UserID, following:ID})
        }
        res.status(201).send({msg:"Done with following"})
    } catch (error) {
        res.status(400).send({msg:error.message})
    }
})

module.exports = {followRouter}