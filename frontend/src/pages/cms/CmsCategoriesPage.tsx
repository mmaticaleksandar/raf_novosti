import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    deleteCmsCategory,
    getCmsCategories
} from "../../api/cmsCategoryApi";
import type {Category} from "../../types/category";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";

export function CmsCategoriesPage() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadCategories(selectedPage = page) {
        try {
            setIsLoading(true);
            setError("");

            const data = await getCmsCategories(selectedPage, 10);

            setCategories(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja kategorija.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(category: Category) {
        const confirmed = window.confirm(
            `Da li sigurno želiš da obrišeš kategoriju "${category.name}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await deleteCmsCategory(category.id);
            await loadCategories(page);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom brisanja kategorije.";

            setError(message);
        }
    }

    useEffect(() => {
        loadCategories(1);
    }, []);

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Kategorije</h1>
                    <p style={styles.subtitle}>
                        Upravljanje kategorijama za vesti.
                    </p>
                </div>

                <button
                    style={styles.primaryButton}
                    onClick={() => navigate("/cms/categories/new")}
                >
                    Dodaj kategoriju
                </button>
            </div>

            <ErrorMessage message={error} />

            {isLoading ? (
                <LoadingMessage message="Učitavanje kategorija..." />
            ) : (
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead style={styles.tableHead}>
                        <tr>
                            <th style={styles.th}>Naziv</th>
                            <th style={styles.th}>Opis</th>
                            <th style={styles.th}>Akcije</th>
                        </tr>
                        </thead>

                        <tbody>
                        {categories.length === 0 ? (
                            <tr>
                                <td style={styles.td} colSpan={3}>
                                    Nema kategorija.
                                </td>
                            </tr>
                        ) : (
                            categories.map((category) => (
                                <tr key={category.id}>
                                    <td style={styles.td}>
                                        <button
                                            type="button"
                                            className="link-button"
                                            style={styles.categoryLink}
                                            onClick={() => navigate(`/cms/news?categoryId=${category.id}`)}
                                        >
                                            {category.name}
                                        </button>
                                    </td>

                                    <td style={styles.td}>
                                        {category.description}
                                    </td>

                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.secondaryButton}
                                                onClick={() =>
                                                    navigate(`/cms/categories/${category.id}/edit`)
                                                }
                                            >
                                                Izmeni
                                            </button>

                                            <button
                                                style={
                                                    category.news_count > 0
                                                        ? styles.disabledDangerButton
                                                        : styles.dangerButton
                                                }
                                                disabled={category.news_count > 0}
                                                title={
                                                    category.news_count > 0
                                                        ? "Kategorija ne može da se obriše jer sadrži vesti."
                                                        : "Obriši kategoriju"
                                                }
                                                onClick={() => handleDelete(category)}
                                            >
                                                Obriši
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={loadCategories}
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
    card: {
        background: "white",
        borderRadius: "16px",
        padding: "18px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)",
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    tableHead: {
        background: "#f8fafc"
    },
    th: {
        textAlign: "left",
        padding: "14px 12px",
        color: "#0f172a",
        fontSize: "14px",
        fontWeight: 900,
        borderBottom: "1px solid #e5e7eb"
    },
    td: {
        padding: "14px 12px",
        borderBottom: "1px solid #eef2f7",
        color: "#111827",
        verticalAlign: "middle"
    },
    actions: {
        display: "flex",
        gap: "8px",
        alignItems: "center"
    },
    primaryButton: {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#0f172a",
        cursor: "pointer",
        fontWeight: 800
    },
    secondaryButton: {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #cbd5e1",
        background: "white",
        color: "#0f172a",
        cursor: "pointer",
        fontWeight: 800
    },
    dangerButton: {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #fecaca",
        background: "#fff1f2",
        color: "#be123c",
        cursor: "pointer",
        fontWeight: 800
    },
    categoryLink: {
        background: "none",
        border: "none",
        padding: 0,
        color: "#0f172a",
        cursor: "pointer",
        fontWeight: 900,
        textDecoration: "none"
    },
    disabledDangerButton: {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid #e5e7eb",
        background: "#f8fafc",
        color: "#94a3b8",
        cursor: "not-allowed",
        fontWeight: 800
    }
};