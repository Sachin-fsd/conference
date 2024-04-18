const express = require('express');
const { PostModel } = require('../models/post.model');
const { CommentModel } = require('../models/comment.model');
const { NotificationModel } = require('../models/notifications.model');

const commentRouter = express.Router();


commentRouter.get("/:id",async(req,res)=>{
    console.log("comemnet line9");
    try {
        const ID = req.params.id || "65c8a19b3b2373224ef78e1e";
        // const post = await PostModel.findOne(
        //   { _id: ID }
        // );
        const post = await PostModel.findOne(
          {  _id: ID },
          {}
        ).populate('authorID', '_id name dp');

        const comments = await CommentModel.find({ parentPost: ID })
          .sort({ CreatedAt: -1 })
          .limit(20);
        
        let activePost =  {UserID:post._id, UserDetails:post.UserDetails, CreatedAt:post.CreatedAt, text:post.text } ;
        if(post.photo){
          activePost.photo = post.photo
        }
        console.log(post);
        res.render("comment", {
          UserDetails:req.body.UserDetails,
          activePost,
          comments,
          post
        });
      } catch (error) {
        res.status(401).json({ err: error });
      }
})


commentRouter.post("/:id", async (req, res) => {
  const {text,authorID} = req.body;
    const payload = {UserDetails:req.body.UserDetails, text:req.body.text, parentPost:req.params.id};
    try {
      const comment = new CommentModel(payload);
      await NotificationModel.create({senderID:req.body.UserDetails.UserID,receiverID:authorID,purpose:"new comment",postID:req.params.id})
      console.log({senderID:req.body.UserDetails.UserID,receiverID:authorID,purpose:"new comment",postID:req.params.id})
      await comment.save();
      res.status(201).json({ok:true});
    } catch (error) {
      res.status(400).json({ err: error });
    }
  });

  module.exports = {commentRouter}