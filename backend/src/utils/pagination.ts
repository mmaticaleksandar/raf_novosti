import { Request } from "express";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export function parsePagination(req: Request) {
    const rawPage = Number(req.query.page);
    const rawLimit = Number(req.query.limit);

    const page = Number.isFinite(rawPage) && rawPage > 0
        ? Math.floor(rawPage)
        : DEFAULT_PAGE;

    const limit = Number.isFinite(rawLimit) && rawLimit > 0
        ? Math.min(Math.floor(rawLimit), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const offset = (page - 1) * limit;

    return { page, limit, offset };
}