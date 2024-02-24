const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
    UserDetails:Object,
    text:{required:true, type:String},
    photo:{type:String},
    pdf:String,
    likeCount:{type:Number, default:0},
    CreatedAt:{type:Date, default:Date.now}
})

const PostModel = mongoose.model("post",postSchema);

const likeSchema = mongoose.Schema({
    UserID:{type:mongoose.Schema.Types.ObjectId, ref:"user"},
    postID:{type:mongoose.Schema.Types.ObjectId, ref:"post"},
    authorID:{type:mongoose.Schema.Types.ObjectId, ref:"post"},
    liked:Boolean
})

likeSchema.index({UserID:1, postID:1},{unique:true});

const LikeModel = mongoose.model("like",likeSchema);


module.exports = {PostModel, LikeModel}