import mongoose from "mongoose";

const userschema=mongoose.Schema({
    email:{type:String,required:true},
    name:{type:String},
    desc:{type:String},
    joinedon:{type:Date,default:Date.now}
})

export default mongoose.model("User",userschema)