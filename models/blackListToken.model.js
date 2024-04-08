const mongoose = require("mongoose");

const blackListTokenSchema = mongoose.Schema({
    token:{type:String, required:true},
    CreatedAt:{type:Date, default:Date.now()}
})

const BlackListTokenModel = mongoose.model("blackListToken",blackListTokenSchema);

module.exports = {BlackListTokenModel}