import {type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createCmsCategory,
    getCmsCategoryById,
    updateCmsCategory
} from "../../api/cmsCategoryApi";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";

export function CmsCategoryFormPage() {
    const navigate = useNavigate();
    const params = useParams();

    const categoryId = params.id ? Number(params.id) : null;
    const isEditMode = Boolean(categoryId);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadCategory() {
        if (!categoryId) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await getCmsCategoryById(categoryId);

            setName(data.category.name);
            setDescription(data.category.description);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja kategorije.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Naziv kategorije je obavezan.");
            return;
        }

        if (!description.trim()) {
            setError("Opis kategorije je obavezan.");
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                name: name.trim(),
                description: description.trim()
            };

            if (isEditMode && categoryId) {
                await updateCmsCategory(categoryId, payload);
            } else {
                await createCmsCategory(payload);
            }

            navigate("/cms/categories");
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom čuvanja kategorije.";

            setError(message);
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        loadCategory();
    }, [categoryId]);

    if (isLoading) {
        return <LoadingMessage message="Učitavanje kategorije..." />;
    }

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        {isEditMode ? "Izmena kategorije" : "Dodavanje kategorije"}
                    </h1>

                    <p style={styles.subtitle}>
                        {isEditMode
                            ? "Izmeni naziv i opis postojeće kategorije."
                            : "Dodaj novu kategoriju za vesti."}
                    </p>
                </div>

                <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => navigate("/cms/categories")}
                >
                    Nazad
                </button>
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} style={styles.card}>
                <label style={styles.label}>
                    Naziv kategorije
                    <input
                        style={styles.input}
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Na primer: Sport"
                    />
                </label>

                <label style={styles.label}>
                    Opis kategorije
                    <textarea
                        style={styles.textarea}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Kratak opis kategorije"
                        rows={5}
                    />
                </label>

                <div style={styles.actions}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => navigate("/cms/categories")}
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
        margin: 0,
        fontSize: "28px"
    },
    subtitle: {
        margin: "6px 0 0",
        color: "#6b7280"
    },
    card: {
        maxWidth: "720px",
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        fontWeight: 700
    },
    input: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        fontSize: "15px",
    },
    textarea: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        fontSize: "15px",
        resize: "vertical"
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
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #9ca3af",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600
    }
};