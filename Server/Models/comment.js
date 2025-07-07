import mongoose from 'mongoose';

const commentschema = mongoose.Schema({
  videoid: String,
  userid: String,
  commentbody: String,
  originalLanguage: { type: String, default: 'en' },
  translations: {
    type: Map,
    of: String,
    default: new Map()
  },
  commenton: { type: Date, default: Date.now },
  usercommented: String,
  commentcity: String,
  likes: [String],
  dislikes: [String],
  isValidated: { type: Boolean, default: true }
});

// Pre-save middleware to validate comment body
commentschema.pre('save', function(next) {
  // Check for special characters that aren't allowed
  const specialCharsRegex = /[<>"'&{}\[\]]/;
  if (specialCharsRegex.test(this.commentbody)) {
    this.isValidated = false;
    const error = new Error('Comments cannot contain special characters like <, >, ", \', &, {, }, [, ]');
    return next(error);
  }
  next();
});

export default mongoose.model("Comment", commentschema);
