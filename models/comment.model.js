const mongoose = require("mongoose");

const commentSchema = mongoose.Schema({
    parentPost:{type:mongoose.Schema.Types.ObjectId, ref:"post"},
    commenterID:{type:mongoose.Schema.Types.ObjectId, ref:"user"},
    text:{required:true, type:String},
    CreatedAt:{type:Date, default:Date.now}
})

const CommentModel = mongoose.model("comment",commentSchema);

module.exports = {CommentModel}