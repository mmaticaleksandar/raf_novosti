import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getNewsByCategory } from "../../api/publicApi";
import type {NewsListItem} from "../../types/news";
import { NewsCard } from "../../components/public/NewsCard";
import { TopReactedSidebar } from "../../components/public/TopReactedSidebar";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";

export function CategoryNewsPage() {
    const params = useParams();
    const categoryId = Number(params.id);

    const [news, setNews] = useState<NewsListItem[]>([]);
    const [categoryName, setCategoryName] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadCategoryNews(selectedPage = 1) {
        if (!categoryId) {
            setError("Neispravan ID kategorije.");
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await getNewsByCategory(categoryId, selectedPage, 10);

            setNews(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);

            if (data.items.length > 0) {
                setCategoryName(data.items[0].category_name);
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja vesti iz kategorije.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        setNews([]);
        setCategoryName("");
        loadCategoryNews(1);
    }, [categoryId]);

    return (
        <section>
            <div style={styles.header}>
                <h1 style={styles.title}>
                    {categoryName ? `Kategorija: ${categoryName}` : "Vesti po kategoriji"}
                </h1>
                <p style={styles.subtitle}>
                    Pregled svih vesti iz odabrane kategorije.
                </p>
            </div>

            <ErrorMessage message={error} />

            <div style={styles.layout}>
                <div style={styles.newsList}>
                    {isLoading ? (
                        <LoadingMessage message="Učitavanje vesti..." />
                    ) : news.length === 0 ? (
                        <p>Nema vesti u ovoj kategoriji.</p>
                    ) : (
                        <>
                            {news.map((item) => (
                                <NewsCard key={item.id} news={item} />
                            ))}

                            <Pagination
                                page={page}
                                totalPages={totalPages}
                                onPageChange={loadCategoryNews}
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