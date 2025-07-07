import express from "express";
import {
  postcomment,
  getcomment,
  deletecomment,
  editcomment,
  likecomment,
  dislikecomment,
  translateComment,
  getSupportedLanguages
} from "../Controllers/Comment.js";

import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/post", auth, postcomment);
router.get("/get", getcomment);
router.delete("/delete/:id", auth, deletecomment);
router.patch("/edit/:id", auth, editcomment);

router.patch("/like", auth, likecomment);
router.patch("/dislike", auth, dislikecomment);

// Translation routes
router.post("/translate/:id", translateComment);
router.get("/languages", getSupportedLanguages);

export default router;
