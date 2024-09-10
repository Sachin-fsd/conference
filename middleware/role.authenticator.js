const jwt = require("jsonwebtoken")
require("dotenv").config()

const role_authenticate = (role) => {
    return async (req,res,next) => {
        const token = req.cookies.token || req.headers.authorization.split(" ")[1] || "";
        if(!token) {
            res.send({msg:"You are not Logged In"});
            return;
        }
        jwt.verify(token, process.env.secret_key, (err, decoded)=>{
            if(err){
                res.send({msg:"Something went wrong", ok:false, error:err})
            }else {
                if(decoded.role==role || decoded.role=="superadmin"){
                    next()
                }else {
                    res.send({msg:"You are not authorised for this operation", ok:false});
                }
            }
        })
    }
}

module.exports = {
    role_authenticate
}