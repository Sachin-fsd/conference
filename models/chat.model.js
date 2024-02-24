const mongoose = require("mongoose");

const chatSchema = mongoose.Schema({
    room:{required:true, type:String},
    UserDetails:Object,
    text:{required:true, type:String},
    CreatedAt:{type:Date, default:Date.now}
})

const ChatModel = mongoose.model("chat",chatSchema);

module.exports = {ChatModel}