interface ErrorMessageProps {
    message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
    if (!message) {
        return null;
    }

    return (
        <p style={styles.error}>
            {message}
        </p>
    );
}

const styles: Record<string, React.CSSProperties> = {
    error: {
        margin: "12px 0",
        padding: "12px",
        borderRadius: "8px",
        background: "#fee2e2",
        color: "#991b1b"
    }
};