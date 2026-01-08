import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import paginationSortingHelper from "../../helpers/paginationSortingHelper";
import { UserRole } from "../../middlewares/auth";

const createPost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }
        const result = await postService.createPost(req.body, user.id as string)
        res.status(201).json(result)
    } catch (e) {
        res.status(400).json({
            error: "Post creation failed",
            details: e
        })
    }
}

const getAllPosts = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const searchString = typeof search === 'string' ? search : undefined;

        const tags = req.query.tags ? (req.query.tags as string).split(',') : [];
        const isFeatured = req.query.isFeatured
            ? req.query.isFeatured === 'true' ? true : req.query.isFeatured === 'false' ? false : undefined
            : undefined;

        const status = req.query.status ? req.query.status as PostStatus : undefined;
        const authorId = req.query.authorId ? req.query.authorId as string : undefined;

        const { page, limit, skip, sortBy, sortOrder } = paginationSortingHelper(req.query);


        const posts = await postService.getAllPosts({ search: searchString, tags, isFeatured, status, authorId, page, limit, skip, sortBy, sortOrder });
        res.status(200).json(posts);
    } catch (e) {
        res.status(400).json({
            error: "Failed to fetch posts",
            details: e
        });
    }
}

const getPostById = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id;
        if (!postId) {
            throw new Error("Post ID is required");
        }

        const post = await postService.getPostById(postId);
        if (!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }
        res.status(200).json(post);
    } catch (e) {
        res.status(400).json({
            error: "Failed to fetch post",
            details: e
        });
    }
}

const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }

        console.log("User Object:", user);

        const posts = await postService.getMyPosts(user.id as string);
        res.status(200).json(posts);
    } catch (e) {
        res.status(400).json({
            error: "Failed to fetch user's posts",
            details: e
        });
    }
}

const updatePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }
        const postId = req.params.postId;
        const updateData = req.body;

        const isAdmin = user.role === UserRole.ADMIN;
        const updatedPost = await postService.updatePost(postId, updateData, user.id as string, isAdmin);
        res.status(200).json(updatedPost);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Post update failed";
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}

const deletePost = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(400).json({
                error: "Unauthorized!",
            })
        }
        const postId = req.params.postId;

        const isAdmin = user.role === UserRole.ADMIN;
        const updatedPost = await postService.deletePost(postId, user.id as string, isAdmin);
        res.status(200).json(updatedPost);
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Post Delete failed";
        res.status(400).json({
            error: errorMessage,
            details: e
        })
    }
}

export const PostController = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost
}