const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema({
    receiverID:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    purpose:{type:String,required:true},
    senderID:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    postID:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
    CreatedAt:{type:Date, default:Date.now()}
})

const NotificationModel = mongoose.model("notification",notificationSchema);

module.exports = {NotificationModel}