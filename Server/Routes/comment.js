import express from "express";
import {
  postcomment,
  getcomment,
  deletecomment,
  editcomment,
  likecomment,
  dislikecomment
} from "../Controllers/Comment.js";
import { translateComment } from "../Controllers/Translate.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/post", auth, postcomment);
router.get("/get", getcomment);
router.delete("/delete/:id", auth, deletecomment);
router.patch("/edit/:id", auth, editcomment);

router.patch("/like", auth, likecomment);
router.patch("/dislike", auth, dislikecomment);

router.post("/translate", translateComment);

export default router;
