import {db} from "../config/db";
import { NewsListItem } from "../types/news";

//Tagovi za vest
export async function getTagsForNews(newsId: number): Promise<string[]> {
    const [rows] = await db.query(
        `
    SELECT t.name
    FROM tags t
    INNER JOIN news_tags nt ON nt.tag_id = t.id
    WHERE nt.news_id = ?
    ORDER BY t.name ASC
    `,
        [newsId]
    );

    return (rows as { name: string }[]).map((row) => row.name);
}

//Komentari za vest
export async function getCommentsForNews(newsId: number) {
    const [rows] = await db.query(
        `
            SELECT
                c.id,
                c.author_name,
                c.text,
                c.created_at,
                COALESCE(SUM(CASE WHEN cr.reaction_type = 'LIKE' THEN 1 ELSE 0 END), 0) AS likes,
                COALESCE(SUM(CASE WHEN cr.reaction_type = 'DISLIKE' THEN 1 ELSE 0 END), 0) AS dislikes
            FROM comments c
                     LEFT JOIN comment_reactions cr ON cr.comment_id = c.id
            WHERE c.news_id = ?
            GROUP BY c.id, c.author_name, c.text, c.created_at
            ORDER BY c.created_at DESC
        `,
        [newsId]
    );

    return rows;
}

//Brojanje pregleda
export async function registerNewsView(newsId: number, visitorId: string) {
    const [existingRows] = await db.query(
        `
    SELECT id
    FROM news_views
    WHERE news_id = ? AND visitor_id = ?
    `,
        [newsId, visitorId]
    );

    if ((existingRows as { id: number }[]).length > 0) {
        return;
    }

    await db.query(
        `
    INSERT INTO news_views (news_id, visitor_id)
    VALUES (?, ?)
    `,
        [newsId, visitorId]
    );

    await db.query(
        `
    UPDATE news
    SET visit_count = visit_count + 1
    WHERE id = ?
    `,
        [newsId]
    );
}

//Brojanje lajkova i dislajkova
export async function getNewsReactionCounts(newsId: number) {
    const [rows] = await db.query(
        `
    SELECT
      SUM(CASE WHEN reaction_type = 'LIKE' THEN 1 ELSE 0 END) AS likes,
      SUM(CASE WHEN reaction_type = 'DISLIKE' THEN 1 ELSE 0 END) AS dislikes
    FROM news_reactions
    WHERE news_id = ?
    `,
        [newsId]
    );

    const counts = (rows as { likes: number | null; dislikes: number | null }[])[0];

    return {
        likes: counts.likes || 0,
        dislikes: counts.dislikes || 0
    };
}

//Vesti koje su sa istim tagom
export async function getRelatedNewsByTags(newsId: number): Promise<NewsListItem[]> {
    const [rows] = await db.query(
        `
    SELECT DISTINCT
      related.id,
      related.title,
      related.text,
      related.published_at,
      related.visit_count,
      related.author_id,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      related.category_id,
      c.name AS category_name
    FROM news current_news
    INNER JOIN news_tags current_nt ON current_nt.news_id = current_news.id
    INNER JOIN news_tags related_nt ON related_nt.tag_id = current_nt.tag_id
    INNER JOIN news related ON related.id = related_nt.news_id
    INNER JOIN users u ON u.id = related.author_id
    INNER JOIN categories c ON c.id = related.category_id
    WHERE current_news.id = ?
      AND related.id <> current_news.id
    ORDER BY related.published_at DESC
    LIMIT 3
    `,
        [newsId]
    );

    return rows as NewsListItem[];
}




//Vesti sa najvise reakcija
export async function getTopReactedNewsItems(): Promise<NewsListItem[]> {
    const [rows] = await db.query(
        `
    SELECT 
      n.id,
      n.title,
      n.text,
      n.published_at,
      n.visit_count,
      n.author_id,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      n.category_id,
      c.name AS category_name,
      COUNT(nr.id) AS reaction_count
    FROM news n
    INNER JOIN users u ON u.id = n.author_id
    INNER JOIN categories c ON c.id = n.category_id
    LEFT JOIN news_reactions nr ON nr.news_id = n.id
    GROUP BY 
      n.id,
      n.title,
      n.text,
      n.published_at,
      n.visit_count,
      n.author_id,
      u.first_name,
      u.last_name,
      n.category_id,
      c.name
    ORDER BY reaction_count DESC, n.published_at DESC
    LIMIT 3
    `
    );

    return rows as NewsListItem[];
}