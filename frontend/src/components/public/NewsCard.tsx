import { Link } from "react-router-dom";
import type{ NewsListItem } from "../../types/news";

interface NewsCardProps {
    news: NewsListItem;
}

export function NewsCard({ news }: NewsCardProps) {
    const preview =
        news.text.length > 180 ? `${news.text.slice(0, 180)}...` : news.text;

    return (
        <article style={styles.card}>
            <Link to={`/news/${news.id}`} style={styles.titleLink}>
                <h2 style={styles.title}>{news.title}</h2>
            </Link>

            <div style={styles.meta}>
                <span>{news.category_name}</span>
                <span>•</span>
                <span>{new Date(news.published_at).toLocaleString("sr-RS")}</span>
            </div>

            <p style={styles.text}>{preview}</p>

            <Link to={`/news/${news.id}`} style={styles.readMore}>
                Pročitaj više →
            </Link>
        </article>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: {
        background: "white",
        borderRadius: "14px",
        padding: "22px",
        marginBottom: "16px",
        border: "1px solid #eef2f7",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)"
    },
    titleLink: {
        color: "#111827",
        textDecoration: "none"
    },
    title: {
        fontSize: "21px",
        fontWeight: 900,
        margin: "0 0 8px 0",
        color: "#0f172a"
    },
    meta: {
        color: "#64748b",
        fontSize: "14px",
        marginBottom: "10px"
    },
    text: {
        margin: 0,
        color: "#374151",
        lineHeight: 1.6
    },
    readMore: {
        display: "inline-flex",
        alignItems: "center",
        marginTop: "10px",
        padding: "8px 13px",
        borderRadius: "999px",
        background: "#0f172a",
        color: "white",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: "14px",
        boxShadow: "0 8px 18px rgba(15, 23, 42, 0.16)"
    },
};