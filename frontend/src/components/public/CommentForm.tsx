import {type FormEvent, useState } from "react";

interface CommentFormProps {
    onSubmit: (data: { authorName: string; text: string }) => Promise<void>;
}

export function CommentForm({ onSubmit }: CommentFormProps) {
    const [authorName, setAuthorName] = useState("");
    const [text, setText] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (!authorName.trim() || !text.trim()) {
            return;
        }

        try {
            setIsSaving(true);

            await onSubmit({
                authorName: authorName.trim(),
                text: text.trim()
            });

            setAuthorName("");
            setText("");
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} style={styles.form}>
            <h3 style={styles.title}>Dodaj komentar</h3>

            <label style={styles.label}>
                Ime
                <input
                    style={styles.input}
                    value={authorName}
                    onChange={(event) => setAuthorName(event.target.value)}
                    placeholder="Tvoje ime"
                />
            </label>

            <label style={styles.label}>
                Komentar
                <textarea
                    style={styles.textarea}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    placeholder="Napiši komentar..."
                    rows={4}
                />
            </label>

            <button
                type="submit"
                style={styles.primaryButton}
                disabled={isSaving}
            >
                {isSaving ? "Slanje..." : "Pošalji komentar"}
            </button>
        </form>
    );
}

const styles: Record<string, React.CSSProperties> = {
    form: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    title: {
        margin: 0,
        fontSize: "20px"
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        fontWeight: 700,
        color: "#374151"
    },
    input: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827"
    },
    textarea: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        resize: "vertical",
        lineHeight: 1.5
    },
    primaryButton: {
        alignSelf: "flex-start",
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #111827",
        background: "#111827",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700
    }
};