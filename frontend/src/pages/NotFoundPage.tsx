import { Link } from "react-router-dom";

export function NotFoundPage() {
    return (
        <main style={styles.page}>
            <h1 style={styles.title}>Stranica nije pronađena</h1>

            <p style={styles.text}>
                Stranica koju tražiš ne postoji ili je pomerena.
            </p>

            <Link to="/" style={styles.link}>
                Nazad na početnu
            </Link>
        </main>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        padding: "48px",
        textAlign: "center"
    },
    title: {
        margin: 0,
        fontSize: "32px"
    },
    text: {
        color: "#6b7280",
        margin: "12px 0 24px"
    },
    link: {
        color: "#111827",
        fontWeight: 700,
        textDecoration: "none"
    }
};