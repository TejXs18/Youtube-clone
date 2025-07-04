import express from "express";
import { createGroup, addMember, searchGroups, getAllGroups } from "../Controllers/group.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post('/create', auth, createGroup);
router.patch('/add-member', auth, addMember);
router.get('/search', auth, searchGroups);

router.get('/all', auth, getAllGroups);

export default router;
