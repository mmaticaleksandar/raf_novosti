import {type FormEvent, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    deleteCmsNews,
    getCmsNews,
    searchCmsNews
} from "../../api/cmsNewsApi";
import type {NewsListItem} from "../../types/news";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";
import { getCurrentUser } from "../../utils/authStorage";
import { getCmsCategories } from "../../api/cmsCategoryApi";
import type { Category } from "../../types/category";

export function CmsNewsPage() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();

    function canModifyNews(newsItem: NewsListItem) {
        return currentUser?.role === "ADMIN" || currentUser?.id === newsItem.author_id;
    }

    const [news, setNews] = useState<NewsListItem[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSearch, setActiveSearch] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [searchParams] = useSearchParams();

    const categoryIdParam = searchParams.get("categoryId");
    const parsedCategoryId = categoryIdParam ? Number(categoryIdParam) : undefined;
    const categoryId = Number.isFinite(parsedCategoryId) ? parsedCategoryId : undefined;

    const searchParam = searchParams.get("search") || "";

    const [selectedCategoryName, setSelectedCategoryName] = useState("");


    async function loadNews(selectedPage = page, search = activeSearch) {
        try {
            setIsLoading(true);
            setError("");

            const data = search.trim()
                ? await searchCmsNews(search.trim(), selectedPage, 10)
                : await getCmsNews(selectedPage, 10, categoryId);

            setNews(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja vesti.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedSearch = searchTerm.trim();

        if (!normalizedSearch) {
            navigate("/cms/news");
            return;
        }

        navigate(`/cms/news?search=${encodeURIComponent(normalizedSearch)}`);
    }

    function handleClearSearch() {
        setSearchTerm("");
        setActiveSearch("");
        navigate("/cms/news");
    }

    async function handleDelete(newsItem: NewsListItem) {
        const confirmed = window.confirm(
            `Da li sigurno želiš da obrišeš vest "${newsItem.title}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteCmsNews(newsItem.id);
            await loadNews(page, activeSearch);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom brisanja vesti.";

            setError(message);
        }
    }

    async function loadSelectedCategoryName() {
        if (!categoryId) {
            setSelectedCategoryName("");
            return;
        }

        try {
            const data = await getCmsCategories(1, 100);
            const selectedCategory = data.items.find(
                (category: Category) => category.id === categoryId
            );

            setSelectedCategoryName(selectedCategory?.name || "");
        } catch {
            setSelectedCategoryName("");
        }
    }


    useEffect(() => {
        const normalizedSearch = searchParam.trim();

        setSearchTerm(normalizedSearch);
        setActiveSearch(normalizedSearch);

        if (normalizedSearch) {
            setSelectedCategoryName("");
            loadNews(1, normalizedSearch);
            return;
        }

        loadSelectedCategoryName();
        loadNews(1, "");
    }, [categoryId, searchParam]);

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Vesti</h1>
                    <p style={styles.subtitle}>
                        Upravljanje vestima, pretraga, izmena i brisanje.
                    </p>
                </div>

                <button
                    style={styles.primaryButton}
                    onClick={() => navigate("/cms/news/new")}
                >
                    Dodaj vest
                </button>
            </div>

            <form onSubmit={handleSearchSubmit} style={styles.searchBox}>
                <input
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Pretraži po naslovu ili tekstu..."
                />

                <button type="submit" style={styles.primaryButton}>
                    Pretraži
                </button>

                {activeSearch && (
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={handleClearSearch}
                    >
                        Poništi
                    </button>
                )}
                {categoryId && !activeSearch && (
                    <p style={styles.searchInfo}>
                        Kategorija: <strong>{selectedCategoryName || `#${categoryId}`}</strong>
                    </p>
                )}
            </form>

            {activeSearch && (
                <p style={styles.searchInfo}>
                    Rezultati pretrage za: <strong>{activeSearch}</strong>
                </p>
            )}

            <ErrorMessage message={error} />

            {isLoading ? (
                <LoadingMessage message="Učitavanje vesti..." />
            ) : (
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>Naslov</th>
                            <th style={styles.th}>Kategorija</th>
                            <th style={styles.th}>Autor</th>
                            <th style={styles.th}>Datum objave</th>
                            <th style={styles.th}>Posete</th>
                            <th style={styles.th}>Akcije</th>
                        </tr>
                        </thead>

                        <tbody>
                        {news.length === 0 ? (
                            <tr>
                                <td style={styles.td} colSpan={6}>
                                    Nema vesti.
                                </td>
                            </tr>
                        ) : (
                            news.map((newsItem) => (
                                <tr key={newsItem.id}>
                                    <td style={styles.td}>
                                        <a
                                            href={`/news/${newsItem.id}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            style={styles.newsLink}
                                        >
                                            {newsItem.title}
                                        </a>
                                    </td>

                                    <td style={styles.td}>{newsItem.category_name}</td>

                                    <td style={styles.td}>
                                        {newsItem.author_first_name} {newsItem.author_last_name}
                                    </td>

                                    <td style={styles.td}>
                                        {new Date(newsItem.published_at).toLocaleString("sr-RS")}
                                    </td>

                                    <td style={styles.td}>{newsItem.visit_count}</td>

                                    <td style={styles.td}>
                                        {canModifyNews(newsItem) ? (
                                            <div style={styles.actions}>
                                                <button
                                                    style={styles.secondaryButton}
                                                    onClick={() =>
                                                        navigate(`/cms/news/${newsItem.id}/edit`)
                                                    }
                                                >
                                                    Izmeni
                                                </button>

                                                <button
                                                    style={styles.dangerButton}
                                                    onClick={() => handleDelete(newsItem)}
                                                >
                                                    Obriši
                                                </button>
                                            </div>
                                        ) : (
                                            <span style={styles.mutedText}>
      Nema dozvolu
    </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={(nextPage) => loadNews(nextPage, activeSearch)}
                    />
                </div>
            )}
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        marginBottom: "24px"
    },
    title: {
        margin: 0,
        fontSize: "28px"
    },
    subtitle: {
        margin: "6px 0 0",
        color: "#6b7280"
    },
    searchBox: {
        display: "flex",
        gap: "10px",
        marginBottom: "14px",
        maxWidth: "760px"
    },
    searchInput: {
        flex: 1,
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        fontSize: "15px"
    },
    searchInfo: {
        margin: "0 0 12px",
        color: "#4b5563"
    },
    card: {
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    th: {
        textAlign: "left",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px",
        color: "#374151",
        whiteSpace: "nowrap"
    },
    td: {
        borderBottom: "1px solid #f3f4f6",
        padding: "12px",
        verticalAlign: "top"
    },
    newsLink: {
        color: "#111827",
        fontWeight: 700,
        textDecoration: "none"
    },
    actions: {
        display: "flex",
        gap: "8px"
    },
    primaryButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #111827",
        background: "#111827",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },
    secondaryButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #9ca3af",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    },
    dangerButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #fca5a5",
        background: "#fee2e2",
        color: "#991b1b",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    },
    mutedText: {
        color: "#9ca3af",
        fontSize: "14px"
    }

};