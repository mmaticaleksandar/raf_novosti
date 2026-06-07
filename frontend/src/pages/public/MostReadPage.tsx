import { useEffect, useState } from "react";
import { getMostReadNews } from "../../api/publicApi";
import type { NewsListItem } from "../../types/news";
import { NewsCard } from "../../components/public/NewsCard";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";

export function MostReadPage() {
    const [news, setNews] = useState<NewsListItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadMostReadNews() {
        try {
            setIsLoading(true);
            setError("");

            const data = await getMostReadNews();
            setNews(data.items);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja najčitanijih vesti.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        loadMostReadNews();
    }, []);

    return (
        <section>
            <div style={styles.header}>
                <h1 style={styles.title}>Najčitanije vesti</h1>
                <p style={styles.subtitle}>
                    Pregled 10 najčitanijih vesti objavljenih u poslednjih 30 dana.
                </p>
            </div>

            <ErrorMessage message={error} />

            <div style={styles.layout}>
                <div style={styles.newsList}>
                    {isLoading ? (
                        <LoadingMessage message="Učitavanje najčitanijih vesti..." />
                    ) : news.length === 0 ? (
                        <p>Nema najčitanijih vesti.</p>
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