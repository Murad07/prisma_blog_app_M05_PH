import { Request, Response } from "express";

function notFoundHandler(req: Request, res: Response) {
    res.status(404).json({
        message: "Resource not found",
        path: req.originalUrl,
        date: new Date().toISOString(),
    });
}

export default notFoundHandler;