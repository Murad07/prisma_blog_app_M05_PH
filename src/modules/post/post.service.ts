import { CommentStatus, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

const createPost = async (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'authorId'>, userId: string) => {
    const result = await prisma.post.create({
        data: {
            ...data,
            authorId: userId
        }
    })
    return result;
}

const getAllPosts = async (
    {
        search,
        tags,
        isFeatured,
        status,
        authorId,
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    }: {
        search: string | undefined,
        tags: string[] | [],
        isFeatured: boolean | undefined,
        status: PostStatus | undefined,
        authorId: string | undefined,
        page: number,
        limit: number,
        skip: number,
        sortBy: string,
        sortOrder: string
    }) => {
    const andConditions: PostWhereInput[] = [];

    if (search) {
        andConditions.push(
            {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        content: {
                            contains: search,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tags: {
                            has: search
                        }
                    }
                ],
            },
        );
    }

    if (tags.length > 0) {
        andConditions.push({
            tags: {
                hasEvery: tags
            }
        });
    }

    if (typeof isFeatured === 'boolean') {
        andConditions.push({
            isFeatured: isFeatured
        });
    }

    if (status) {
        andConditions.push({
            status: status
        });
    }

    if (authorId) {
        andConditions.push({
            authorId: authorId
        });
    }

    const allPosts = await prisma.post.findMany({
        take: limit,
        skip: skip,
        where: {
            AND: andConditions
        },
        include: {
            _count: {
                select: { comments: true }
            }
        },
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const total = await prisma.post.count({
        where: {
            AND: andConditions
        }
    })

    return {
        data: allPosts,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}

const getPostById = async (postId: string) => {
    return await prisma.$transaction(async (tx) => {
        await tx.post.update({
            where: {
                id: postId
            },
            data: {
                views: {
                    increment: 1
                }
            }
        });

        const post = await tx.post.findUnique({
            where: {
                id: postId
            },
            include: {
                comments: {
                    where: {
                        parentId: null,
                        status: CommentStatus.APPROVED
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        comments: {
                            where: {
                                status: CommentStatus.APPROVED
                            },
                            orderBy: {
                                createdAt: 'asc'
                            },
                            include: {
                                comments: {
                                    where: {
                                        status: CommentStatus.APPROVED
                                    },
                                    orderBy: {
                                        createdAt: 'asc'
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { comments: true }
                }
            }
        });
        return post;
    });
}

const getMyPosts = async (authorId: string) => {

    await prisma.user.findUniqueOrThrow({
        where: {
            id: authorId
        }
    });

    const allPosts = await prisma.post.findMany({
        where: {
            authorId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: { comments: true }
            }
        }
    });

    const total = await prisma.post.count({
        where: {
            authorId
        }
    })

    return {
        data: allPosts,
        pagination: {
            total,
            page: 1,
            limit: allPosts.length,
            totalPages: 1
        }
    };
}

const updatePost = async (postId: string, data: Partial<Post>, authorId: string, isAdmin: boolean) => {
    if (!isAdmin) {
        const postData = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            }
        });

        if (postData.authorId !== authorId) {
            throw new Error("Unauthorized to update this post");
        }

        delete data.isFeatured;
    }

    const post = await prisma.post.update({
        where: {
            id: postId,
            authorId: authorId
        },
        data: data
    });

    return post;
}

const deletePost = async (postId: string, authorId: string, isAdmin: boolean) => {
    if (!isAdmin) {
        const postData = await prisma.post.findUniqueOrThrow({
            where: {
                id: postId
            }
        });

        if (postData.authorId !== authorId) {
            throw new Error("You are not authorized to delete this post");
        }
    }

    return await prisma.post.delete({
        where: {
            id: postId,
            authorId: authorId
        }
    });
}

export const postService = {
    createPost,
    getAllPosts,
    getPostById,
    getMyPosts,
    updatePost,
    deletePost
}