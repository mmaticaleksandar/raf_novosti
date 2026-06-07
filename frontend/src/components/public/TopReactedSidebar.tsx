import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopReactedNews } from "../../api/publicApi";
import type{ NewsListItem } from "../../types/news";

export function TopReactedSidebar() {
    const [items, setItems] = useState<NewsListItem[]>([]);

    async function loadTopReacted() {
        try {
            const data = await getTopReactedNews();
            setItems(data.items);
        } catch {
            setItems([]);
        }
    }

    useEffect(() => {
        loadTopReacted();
    }, []);

    return (
        <aside style={styles.sidebar}>
            <h2 style={styles.title}>Najviše reakcija</h2>

            {items.length === 0 ? (
                <p style={styles.empty}>Nema podataka.</p>
            ) : (
                <ol style={styles.list}>
                    {items.map((item) => (
                        <li key={item.id} style={styles.item}>
                            <Link to={`/news/${item.id}`} style={styles.link}>
                                {item.title}
                            </Link>
                        </li>
                    ))}
                </ol>
            )}
        </aside>
    );
}

const styles: Record<string, React.CSSProperties> = {
    sidebar: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "18px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        alignSelf: "start"
    },
    title: {
        margin: "0 0 14px",
        fontSize: "18px"
    },
    list: {
        margin: 0,
        paddingLeft: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },
    item: {
        color: "#374151"
    },
    link: {
        color: "#111827",
        textDecoration: "none",
        fontWeight: 700
    },
    empty: {
        color: "#6b7280",
        margin: 0
    }
};