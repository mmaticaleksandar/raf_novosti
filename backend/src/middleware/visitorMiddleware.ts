import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function visitorMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
) {
    let visitorId = req.cookies.visitorId;

    if (!visitorId) {
        visitorId = uuidv4();

        res.cookie("visitorId", visitorId, {
            httpOnly: true,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 24 * 365
        });
    }

    req.visitorId = visitorId;

    next();
}