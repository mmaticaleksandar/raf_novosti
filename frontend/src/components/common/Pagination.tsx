interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination({
                               page,
                               totalPages,
                               onPageChange
                           }: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    return (
        <div style={styles.wrapper}>
            <button
                style={styles.button}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
            >
                Prethodna
            </button>

            <span>
        Strana {page} od {totalPages}
      </span>

            <button
                style={styles.button}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
            >
                Sledeća
            </button>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginTop: "20px"
    },
    button: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        background: "white",
        cursor: "pointer"
    }
};