import { useEffect, useState } from "react";
import { getLatestNews } from "../../api/publicApi";
import type{ NewsListItem } from "../../types/news";
import { NewsCard } from "../../components/public/NewsCard";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";

export function HomePage() {
    const [news, setNews] = useState<NewsListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadLatestNews() {
        try {
            setIsLoading(true);
            setError("");

            const data = await getLatestNews();
            setNews(data.items);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja vesti.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadLatestNews();
    }, []);

    return (
        <section>
            <div style={styles.header}>
                <h1 style={styles.title}>Najnovije vesti</h1>
                <p style={styles.subtitle}>
                    Pregled poslednjih objavljenih vesti na RAF Novosti platformi.
                </p>
            </div>

            <ErrorMessage message={error} />

            <div style={styles.layout}>
                <div style={styles.newsList}>
                    {isLoading ? (
                        <LoadingMessage message="Učitavanje najnovijih vesti..." />
                    ) : news.length === 0 ? (
                        <p>Nema objavljenih vesti.</p>
                    ) : (
                        news.map((item) => <NewsCard key={item.id} news={item} />)
                    )}
                </div>

                <TopReactedSidebar />
            </div>
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        marginBottom: "24px"
    },
    title: {
        margin: 0,
        fontSize: "32px"
    },
    subtitle: {
        margin: "8px 0 0",
        color: "#6b7280"
    },
    layout: {
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 320px",
        gap: "24px",
        alignItems: "start"
    },
    newsList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    }
};