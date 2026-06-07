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
                        <thead>
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
                                                style={styles.dangerButton}
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
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    th: {
        textAlign: "left",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px",
        color: "#374151"
    },
    td: {
        borderBottom: "1px solid #f3f4f6",
        padding: "12px",
        verticalAlign: "top"
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
        fontWeight: 700
    },
    secondaryButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #9ca3af",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600
    },
    dangerButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #fca5a5",
        background: "#fee2e2",
        color: "#991b1b",
        cursor: "pointer",
        fontWeight: 600
    },
    categoryLink: {
        background: "none",
        border: "none",
        padding: 0,
        color: "#2563eb",
        cursor: "pointer",
        fontWeight: 700,
        textDecoration: "underline"
    }
};