import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    createPublicComment,
    getPublicNewsById,
    getRelatedNews,
    reactToComment,
    reactToNews
} from "../../api/publicApi";
import type { NewsDetails, NewsListItem } from "../../types/news";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { CommentForm } from "../../components/public/CommentForm";
import { CommentList } from "../../components/public/CommentList";
import { RelatedNewsList } from "../../components/public/RelatedNewsList";

export function NewsDetailsPage() {
    const params = useParams();
    const newsId = Number(params.id);

    const [news, setNews] = useState<NewsDetails | null>(null);
    const [relatedNews, setRelatedNews] = useState<NewsListItem[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadNews() {
        if (!newsId) {
            setError("Neispravan ID vesti.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const [newsData, relatedData] = await Promise.all([
                getPublicNewsById(newsId),
                getRelatedNews(newsId)
            ]);

            setNews(newsData.news);
            setRelatedNews(relatedData.items);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja vesti.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCreateComment(data: {
        authorName: string;
        text: string;
    }) {
        await createPublicComment(newsId, data);
        await loadNews();
    }

    async function handleReactToNews(type: "LIKE" | "DISLIKE") {
        await reactToNews(newsId, type);
        await loadNews();
    }

    async function handleReactToComment(
        commentId: number,
        type: "LIKE" | "DISLIKE"
    ) {
        await reactToComment(commentId, type);
        await loadNews();
    }

    useEffect(() => {
        loadNews();
    }, [newsId]);

    if (isLoading) {
        return <LoadingMessage message="Učitavanje vesti..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    if (!news) {
        return <p>Vest nije pronađena.</p>;
    }

    return (
        <section style={styles.layout}>
            <div style={styles.content}>
                <article style={styles.article}>
                    <div style={styles.meta}>
                        <Link to={`/categories/${news.category_id}`} style={styles.metaLink}>
                            {news.category_name}
                        </Link>

                        <span>•</span>

                        <span>
              {new Date(news.published_at).toLocaleString("sr-RS")}
            </span>

                        <span>•</span>

                        <span>
              Autor: {news.author_first_name} {news.author_last_name}
            </span>

                        <span>•</span>

                        <span>Posete: {news.visit_count}</span>
                    </div>

                    <h1 style={styles.title}>{news.title}</h1>

                    <p style={styles.text}>{news.text}</p>

                    <div style={styles.tags}>
                        {news.tags.map((tag) => (
                            <Link
                                key={tag}
                                to={`/tags/${encodeURIComponent(tag)}`}
                                style={styles.tag}
                            >
                                #{tag}
                            </Link>
                        ))}
                    </div>

                    <div style={styles.reactions}>
                        <button
                            style={styles.reactionButton}
                            onClick={() => handleReactToNews("LIKE")}
                        >
                            Like ({news.reactions.likes})
                        </button>

                        <button
                            style={styles.reactionButton}
                            onClick={() => handleReactToNews("DISLIKE")}
                        >
                            Dislike ({news.reactions.dislikes})
                        </button>
                    </div>
                </article>

                <RelatedNewsList items={relatedNews} />

                <CommentForm onSubmit={handleCreateComment} />

                <CommentList
                    comments={news.comments}
                    onReact={handleReactToComment}
                />
            </div>

            <TopReactedSidebar />
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    layout: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: "24px",
        alignItems: "start"
    },
    content: {
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    article: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "26px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
    },
    meta: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        color: "#6b7280",
        fontSize: "14px",
        marginBottom: "14px"
    },
    metaLink: {
        color: "#111827",
        fontWeight: 700,
        textDecoration: "none"
    },
    title: {
        margin: "0 0 18px",
        fontSize: "36px"
    },
    text: {
        whiteSpace: "pre-wrap",
        lineHeight: 1.8,
        color: "#374151",
        fontSize: "17px"
    },
    tags: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "20px"
    },
    tag: {
        padding: "6px 10px",
        borderRadius: "999px",
        background: "#e5e7eb",
        color: "#111827",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: "14px"
    },
    reactions: {
        display: "flex",
        gap: "10px",
        marginTop: "20px"
    },
    reactionButton: {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 700
    }
};