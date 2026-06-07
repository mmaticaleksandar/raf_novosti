import { Link } from "react-router-dom";
import type { NewsListItem } from "../../types/news";

interface RelatedNewsListProps {
    items: NewsListItem[];
}

export function RelatedNewsList({ items }: RelatedNewsListProps) {
    return (
        <section style={styles.wrapper}>
            <h2 style={styles.title}>Pročitaj još...</h2>

            {items.length === 0 ? (
                <p style={styles.empty}>Nema povezanih vesti.</p>
            ) : (
                <ul style={styles.list}>
                    {items.map((item) => (
                        <li key={item.id}>
                            <Link to={`/news/${item.id}`} style={styles.link}>
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
    },
    title: {
        margin: "0 0 14px",
        fontSize: "20px"
    },
    list: {
        margin: 0,
        paddingLeft: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    link: {
        color: "#111827",
        fontWeight: 700,
        textDecoration: "none"
    },
    empty: {
        margin: 0,
        color: "#6b7280"
    }
};