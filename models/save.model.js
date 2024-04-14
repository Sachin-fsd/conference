const mongoose = require("mongoose");

const saveSchema = mongoose.Schema({
    postID:{type:mongoose.Schema.Types.ObjectId,ref:"post",required:true},
    UserID:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    authorID:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
    CreatedAt:{type:Date, default:Date.now()}
})

const SaveModel = mongoose.model("save",saveSchema);

module.exports = {SaveModel}