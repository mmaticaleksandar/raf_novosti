import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchPublicNews } from "../../api/publicApi";
import type { NewsListItem } from "../../types/news";
import { NewsCard } from "../../components/public/NewsCard";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const q = searchParams.get("q") || "";

    const [news, setNews] = useState<NewsListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadSearchResults(selectedPage = 1) {
        if (!q.trim()) {
            setNews([]);
            setError("Unesi pojam za pretragu.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await searchPublicNews(q.trim(), selectedPage, 10);

            setNews(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom pretrage vesti.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setNews([]);
        loadSearchResults(1);
    }, [q]);

    return (
        <section>
            <div style={styles.header}>
                <h1 style={styles.title}>Pretraga vesti</h1>
                <p style={styles.subtitle}>
                    Rezultati pretrage za: <strong>{q}</strong>
                </p>
            </div>

            <ErrorMessage message={error} />

            <div style={styles.layout}>
                <div style={styles.newsList}>
                    {isLoading ? (
                        <LoadingMessage message="Pretraga je u toku..." />
                    ) : news.length === 0 && !error ? (
                        <p>Nema rezultata za traženi pojam.</p>
                    ) : (
                        <>
                            {news.map((item) => (
                                <NewsCard key={item.id} news={item} />
                            ))}

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={loadSearchResults}
                            />
                        </>
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