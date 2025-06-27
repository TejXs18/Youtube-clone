import mongoose from "mongoose";
import users from "../Models/Auth.js"
export const updatechaneldata=async(req,res)=>{
    const {id:_id}=req.params;
    const {name,desc}=req.body;
    if(!mongoose.Types.ObjectId.isValid(_id)){
        return res.status(400).send("Channel unavailable..")
    }
    try {
        const updatedata=await users.findByIdAndUpdate(
            _id,{
                $set:{
                    name:name,
                    desc:desc,
                },
            },
            {new:true}
        );
        res.status(200).json(updatedata)
    } catch (error) {
        res.status(405).json({message:error.message})
        return
    }
}

// export const getallchanels=async(req,res)=>{
//      console.log("Route hit"); 
//     try {
//         const allchanels=await users.find().lean();
//         console.log("Users fetched:", allchanels.length);
//         const allchaneldata=[]
//         allchanels.forEach((channel)=>{
//             allchaneldata.push({
//                 _id:channel._id,
//                 name:channel.name,
//                 email:channel.email,
//                 desc:channel.desc
//             });
//         });
//         res.status(200).json(allchaneldata)
//     } catch (error) {
//         res.status(405).json({message:error.message})
//         return
//     }
// }

export const getallchanels = async (req, res) => {
  console.log("🔁 Route /getallchannel hit");

  try {
    if (!mongoose.connection.readyState) {
      console.error("❌ Not connected to MongoDB");
      return res.status(500).json({ message: "No MongoDB connection" });
    }

    const allchanels = await users.find({}).lean();
    console.log("✅ Users fetched:", allchanels.length);

    const allchaneldata = allchanels.map((channel) => ({
      _id: channel._id,
      name: channel.name,
      email: channel.email,
      desc: channel.desc,
    }));

    return res.status(200).json(allchaneldata);
  } catch (error) {
    console.error("❌ Error in getallchanels:", error);
    return res.status(500).json({ message: error.message });
  }
};




