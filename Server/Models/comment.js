import mongoose from 'mongoose';

const commentschema = mongoose.Schema({
  videoid: String,
  userid: String,
  commentbody: String,
  commenton: { type: Date, default: Date.now },
  usercommented: String,
  commentcity: String,
  likes: [String],
  dislikes: [String]
});

export default mongoose.model("Comment", commentschema);
