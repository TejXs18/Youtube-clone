import comment from "../Models/comment.js";
import mongoose from "mongoose";
import { translateText, detectLanguage, SUPPORTED_LANGUAGES } from "../Helper/translationService.js";

export const postcomment = async (req, res) => {
    const commentdata = req.body;
    
    try {
        // Detect the language of the comment
        const detectedLang = await detectLanguage(commentdata.commentbody);
        commentdata.originalLanguage = detectedLang;
        
        const postcomment = new comment(commentdata);
        await postcomment.save();
        res.status(200).json({
            message: "posted the comment",
            comment: postcomment
        });
    } catch (error) {
        res.status(400).json(error.message);
    }
};

export const getcomment = async (req, res) => {
    try {
        const commentlist = await comment.find();
        res.status(200).send(commentlist);
    } catch (error) {
        res.status(400).json(error.message);
    }
};

export const deletecomment = async (req, res) => {
    const { id: _id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..");
    }
    try {
        await comment.findByIdAndDelete(_id);
        res.status(200).json({ message: "deleted comment" });
    } catch (error) {
        res.status(400).json(error.message);
    }
};

export const editcomment = async (req, res) => {
    const { id: _id } = req.params;
    const { commentbody } = req.body;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Comments unavailable..");
    }
    try {
        const updatecomment = await comment.findByIdAndUpdate(
            _id,
            { $set: { commentbody } },
            { new: true }
        );
        res.status(200).json(updatecomment);
    } catch (error) {
        res.status(400).json(error.message);
    }
};

export const likecomment = async (req, res) => {
    const { id, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid comment ID");
    }

    try {
        const targetComment = await comment.findById(id);
        if (!targetComment) return res.status(404).send("Comment not found");

        if (!targetComment.likes.includes(userId)) {
            targetComment.likes.push(userId);
            targetComment.dislikes = targetComment.dislikes.filter(id => id !== userId);
        }

        await targetComment.save();
        res.status(200).json(targetComment);
    } catch (error) {
        res.status(400).json(error.message);
    }
};

export const dislikecomment = async (req, res) => {
    const { id, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send("Invalid comment ID");
    }

    try {
        const targetComment = await comment.findById(id);
        if (!targetComment) return res.status(404).send("Comment not found");

        if (!targetComment.dislikes.includes(userId)) {
            targetComment.dislikes.push(userId);
            targetComment.likes = targetComment.likes.filter(id => id !== userId);
        }

        if (targetComment.dislikes.length >= 2) {
            await comment.findByIdAndDelete(id);
            return res.status(200).json({ message: "Comment auto-deleted due to 2 dislikes" });
        }

        await targetComment.save();
        res.status(200).json(targetComment);
    } catch (error) {
        res.status(400).json(error.message);
    }
};

// Translate comment to desired language
export const translateComment = async (req, res) => {
    const { id: _id } = req.params;
    const { targetLanguage } = req.body;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).send("Invalid comment ID");
    }

    if (!SUPPORTED_LANGUAGES[targetLanguage]) {
        return res.status(400).send("Unsupported target language");
    }

    try {
        const targetComment = await comment.findById(_id);
        if (!targetComment) return res.status(404).send("Comment not found");

        // Check if translation already exists
        if (targetComment.translations && targetComment.translations.get(targetLanguage)) {
            return res.status(200).json({
                translatedText: targetComment.translations.get(targetLanguage),
                originalLanguage: targetComment.originalLanguage,
                targetLanguage: targetLanguage,
                cached: true
            });
        }

        // Perform translation
        const translationResult = await translateText(
            targetComment.commentbody,
            targetLanguage,
            targetComment.originalLanguage
        );

        // Save translation to database for future use
        if (!targetComment.translations) {
            targetComment.translations = new Map();
        }
        targetComment.translations.set(targetLanguage, translationResult.translatedText);
        await targetComment.save();

        res.status(200).json({
            translatedText: translationResult.translatedText,
            originalLanguage: targetComment.originalLanguage,
            targetLanguage: targetLanguage,
            cached: false
        });
    } catch (error) {
        res.status(400).json(error.message);
    }
};

// Get supported languages
export const getSupportedLanguages = async (req, res) => {
    try {
        res.status(200).json(SUPPORTED_LANGUAGES);
    } catch (error) {
        res.status(400).json(error.message);
    }
};
