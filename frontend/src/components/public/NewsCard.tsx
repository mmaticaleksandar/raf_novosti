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
                Pročitaj više
            </Link>
        </article>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    titleLink: {
        color: "#111827",
        textDecoration: "none"
    },
    title: {
        margin: 0,
        fontSize: "22px"
    },
    meta: {
        display: "flex",
        gap: "8px",
        color: "#6b7280",
        fontSize: "14px"
    },
    text: {
        margin: 0,
        color: "#374151",
        lineHeight: 1.6
    },
    readMore: {
        color: "#111827",
        fontWeight: 700,
        textDecoration: "none",
        marginTop: "6px"
    }
};