import { Request, Response } from "express";
import { commentService } from "./comment.service";
import { CommentStatus } from "../../../prisma/generated/prisma/enums";

const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }

        req.body.authorId = user?.id;

        const result = await commentService.createComment(req.body)
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Comment creation failed",
            details: e
        })
    }
}

const getCommentById = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params
        const result = await commentService.getCommentById(commentId as string)
        res.status(200).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Comment fetched failed",
            details: e
        })
    }
}

const getCommentsByAuthor = async (req: Request, res: Response) => {
    try {
        const { authorId } = req.params
        const result = await commentService.getCommentsByAuthor(authorId as string)
        res.status(200).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Comment fetched failed",
            details: e
        })
    }
}

const deleteComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.deleteComment(commentId as string, user?.id as string)
        res.status(200).json(result)
    } catch (e) {
        console.log(e)
        res.status(400).json({
            error: "Comment delete failed!",
            details: e
        })
    }
}
const updateComment = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { commentId } = req.params;
        const result = await commentService.updateComment(commentId as string, req.body, user?.id as string)
        res.status(200).json(result)
    } catch (e) {
        console.log(e)
        res.status(400).json({
            error: "Comment update failed!",
            details: e
        })
    }
}

const mordaratedComment = async (req: Request, res: Response) => {
    try {
        const { commentId } = req.params;
        const { status } = req.body;
        const result = await commentService.mordaratedComment(commentId as string, req.body)
        res.status(200).json(result)
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Comment moderation failed!";
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}

export const commentController = {
    createPost,
    getCommentById,
    getCommentsByAuthor,
    deleteComment,
    updateComment,
    mordaratedComment
};