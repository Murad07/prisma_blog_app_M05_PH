import express, { Router } from 'express';
import { commentController } from './comment.controller';
import auth, { UserRole } from '../../middlewares/auth';

const router = express.Router();

router.get(
    "/author/:authorId",
    commentController.getCommentsByAuthor
)
router.get(
    "/:commentId",
    commentController.getCommentById
)

router.post(
    "/",
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.createPost
)
router.delete(
    "/:commentId",
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.deleteComment
)

router.patch(
    "/:commentId",
    auth(UserRole.USER, UserRole.ADMIN),
    commentController.updateComment
)

router.patch(
    "/moderate/:commentId",
    auth(UserRole.ADMIN),
    commentController.mordaratedComment
)


export const commentRouter: Router = router;