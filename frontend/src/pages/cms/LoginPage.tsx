import {type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../api/authApi";
import { saveAuth } from "../../utils/authStorage";

export function LoginPage() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("admin@raf.rs");
    const [password, setPassword] = useState("admin123");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!email.trim()) {
            setError("Email je obavezan.");
            return;
        }

        if (!password.trim()) {
            setError("Lozinka je obavezna.");
            return;
        }

        try {
            setIsLoading(true);

            const data = await loginRequest(email.trim(), password);
            saveAuth(data.token, data.user);

            navigate("/cms/categories");
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Došlo je do greške prilikom prijave.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <main style={styles.page}>
            <section style={styles.card}>
                <h1 style={styles.title}>CMS Login</h1>
                <p style={styles.subtitle}>Prijava za administraciju RAF Novosti.</p>

                <form onSubmit={handleSubmit} style={styles.form}>
                    <label style={styles.label}>
                        Email
                        <input
                            style={styles.input}
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="admin@raf.rs"
                        />
                    </label>

                    <label style={styles.label}>
                        Lozinka
                        <input
                            style={styles.input}
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Unesi lozinku"
                        />
                    </label>

                    {error && <p style={styles.error}>{error}</p>}

                    <button type="submit" disabled={isLoading} style={styles.button}>
                        {isLoading ? "Prijavljivanje..." : "Prijavi se"}
                    </button>
                </form>
            </section>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f8",
        padding: "24px"
    },
    card: {
        width: "100%",
        maxWidth: "420px",
        background: "white",
        borderRadius: "12px",
        padding: "32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
    },
    title: {
        margin: 0,
        fontSize: "28px"
    },
    subtitle: {
        marginTop: "8px",
        marginBottom: "24px",
        color: "#555"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        fontWeight: 600
    },
    input: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "15px"
    },
    button: {
        padding: "12px",
        borderRadius: "8px",
        border: "none",
        background: "#1f2937",
        color: "white",
        fontWeight: 700,
        cursor: "pointer"
    },
    error: {
        margin: 0,
        color: "#b91c1c",
        background: "#fee2e2",
        padding: "10px",
        borderRadius: "8px"
    }
};