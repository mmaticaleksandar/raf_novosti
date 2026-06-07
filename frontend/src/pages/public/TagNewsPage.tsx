import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNewsByTag } from "../../api/publicApi";
import type { NewsListItem } from "../../types/news";
import { NewsCard } from "../../components/public/NewsCard";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";

export function TagNewsPage() {
    const params = useParams();
    const tagName = params.tagName ? decodeURIComponent(params.tagName) : "";

    const [news, setNews] = useState<NewsListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadTagNews(selectedPage = 1) {
        if (!tagName) {
            setError("Naziv taga je obavezan.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await getNewsByTag(tagName, selectedPage, 10);

            setNews(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja vesti po tagu.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setNews([]);
        loadTagNews(1);
    }, [tagName]);

    return (
        <section>
            <div style={styles.header}>
                <h1 style={styles.title}>Tag: #{tagName}</h1>
                <p style={styles.subtitle}>
                    Vesti koje sadrže izabrani tag.
                </p>
            </div>

            <ErrorMessage message={error} />

            <div style={styles.layout}>
                <div style={styles.newsList}>
                    {isLoading ? (
                        <LoadingMessage message="Učitavanje vesti po tagu..." />
                    ) : news.length === 0 ? (
                        <p>Nema vesti za ovaj tag.</p>
                    ) : (
                        <>
                            {news.map((item) => (
                                <NewsCard key={item.id} news={item} />
                            ))}

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={loadTagNews}
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