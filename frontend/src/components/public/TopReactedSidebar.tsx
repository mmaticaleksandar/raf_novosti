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
            <h2 style={styles.sidebarTitle}>Najviše reakcija</h2>

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
        background: "white",
        borderRadius: "14px",
        padding: "18px",
        border: "1px solid #eef2f7",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
        position: "sticky",
        top: "96px"
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
        marginBottom: "9px",
        color: "#64748b",
        fontWeight: 700
    },
    link: {
        color: "#0f172a",
        textDecoration: "none",
        fontWeight: 900
    },
    empty: {
        margin: 0,
        color: "#64748b",
        fontSize: "14px"
    },
    sidebarTitle: {
        margin: "0 0 12px 0",
        fontSize: "17px",
        fontWeight: 900,
        color: "#0f172a"
    },
};