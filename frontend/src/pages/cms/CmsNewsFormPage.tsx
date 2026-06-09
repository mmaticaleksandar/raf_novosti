import {type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createCmsNews,
    getCmsNewsById,
    updateCmsNews
} from "../../api/cmsNewsApi";
import { getCmsCategories } from "../../api/cmsCategoryApi";
import type {Category} from "../../types/category";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";

export function CmsNewsFormPage() {
    const navigate = useNavigate();
    const params = useParams();

    const newsId = params.id ? Number(params.id) : null;
    const isEditMode = Boolean(newsId);

    const [title, setTitle] = useState("");
    const [text, setText] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [tags, setTags] = useState("");

    const [categories, setCategories] = useState<Category[]>([]);

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadInitialData() {
        try {
            setIsLoading(true);
            setError("");

            const categoriesData = await getCmsCategories(1, 100);
            setCategories(categoriesData.items);

            if (isEditMode && newsId) {
                const newsData = await getCmsNewsById(newsId);

                setTitle(newsData.news.title);
                setText(newsData.news.text);
                setCategoryId(String(newsData.news.category_id));
                setTags(newsData.news.tags.join(", "));
            }
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja podataka.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Naslov vesti je obavezan.");
            return;
        }

        if (!text.trim()) {
            setError("Tekst vesti je obavezan.");
            return;
        }

        const parsedCategoryId = Number(categoryId);

        if (!parsedCategoryId) {
            setError("Kategorija je obavezna.");
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                title: title.trim(),
                text: text.trim(),
                categoryId: parsedCategoryId,
                tags: tags.trim()
            };

            if (isEditMode && newsId) {
                await updateCmsNews(newsId, payload);
            } else {
                await createCmsNews(payload);
            }

            navigate("/cms/news");
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom čuvanja vesti.";

            setError(message);
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, [newsId]);

    if (isLoading) {
        return <LoadingMessage message="Učitavanje podataka..." />;
    }

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        {isEditMode ? "Izmena vesti" : "Dodavanje vesti"}
                    </h1>

                    <p style={styles.subtitle}>
                        {isEditMode
                            ? "Izmeni naslov, tekst, kategoriju i tagove postojeće vesti."
                            : "Dodaj novu vest u sistem."}
                    </p>
                </div>

                <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => navigate("/cms/news")}
                >
                    Nazad
                </button>
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} style={styles.card}>
                <label style={styles.label}>
                    Naslov vesti
                    <input
                        style={styles.input}
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Unesi naslov vesti"
                    />
                </label>

                <label style={styles.label}>
                    Kategorija
                    <select
                        style={styles.input}
                        value={categoryId}
                        onChange={(event) => setCategoryId(event.target.value)}
                    >
                        <option value="">Izaberi kategoriju</option>

                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                </label>

                <label style={styles.label}>
                    Tekst vesti
                    <textarea
                        style={styles.textarea}
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        placeholder="Unesi tekst vesti"
                        rows={12}
                    />
                </label>

                <label style={styles.label}>
                    Tagovi
                    <input
                        style={styles.input}
                        value={tags}
                        onChange={(event) => setTags(event.target.value)}
                        placeholder="Na primer: sport, fudbal, derbi"
                    />
                </label>

                <p style={styles.helpText}>
                    Tagove unosi odvojene zarezom.
                </p>

                <div style={styles.actions}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => navigate("/cms/news")}
                    >
                        Odustani
                    </button>

                    <button
                        type="submit"
                        style={styles.primaryButton}
                        disabled={isSaving}
                    >
                        {isSaving ? "Čuvanje..." : "Sačuvaj"}
                    </button>
                </div>
            </form>
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
        margin: "0 0 18px 0",
        fontSize: "28px",
        fontWeight: 900,
        color: "#0f172a"
    },
    subtitle: {
        margin: "6px 0 0",
        color: "#6b7280"
    },
    card: {
        maxWidth: "920px",
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)"
    },
    fieldGroup: {
        marginBottom: "18px"
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontWeight: 800,
        color: "#111827"
    },
    input: {
        width: "100%",
        padding: "11px 13px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box"
    },
    select: {
        width: "100%",
        padding: "11px 13px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        boxSizing: "border-box",
        background: "white"
    },
    textarea: {
        width: "100%",
        minHeight: "260px",
        padding: "11px 13px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "15px",
        outline: "none",
        resize: "vertical",
        boxSizing: "border-box"
    },
    helpText: {
        margin: "-8px 0 0",
        color: "#6b7280",
        fontSize: "14px"
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "20px"
    },
    primaryButton: {
        padding: "10px 16px",
        borderRadius: "999px",
        border: "1px solid #0f172a",
        background: "#0f172a",
        color: "white",
        cursor: "pointer",
        fontWeight: 900
    },
    secondaryButton: {
        padding: "10px 16px",
        borderRadius: "999px",
        border: "1px solid #d1d5db",
        background: "white",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 800
    },
};