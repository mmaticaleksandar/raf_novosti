interface LoadingMessageProps {
    message?: string;
}

export function LoadingMessage({
                                   message = "Učitavanje..."
                               }: LoadingMessageProps) {
    return (
        <p style={styles.loading}>
            {message}
        </p>
    );
}

const styles: Record<string, React.CSSProperties> = {
    loading: {
        margin: "12px 0",
        color: "#4b5563"
    }
};