import type { Comment } from "../../types/news";

interface CommentListProps {
    comments: Comment[];
    onReact: (commentId: number, type: "LIKE" | "DISLIKE") => Promise<void>;
}

export function CommentList({ comments, onReact }: CommentListProps) {
    return (
        <section style={styles.wrapper}>
            <h2 style={styles.title}>Komentari</h2>

            {comments.length === 0 ? (
                <p style={styles.empty}>Još uvek nema komentara.</p>
            ) : (
                <div style={styles.list}>
                    {comments.map((comment) => (
                        <article key={comment.id} style={styles.comment}>
                            <div style={styles.commentHeader}>
                                <strong>{comment.author_name}</strong>

                                <span style={styles.date}>
                  {new Date(comment.created_at).toLocaleString("sr-RS")}
                </span>
                            </div>

                            <p style={styles.text}>{comment.text}</p>

                            <div style={styles.reactions}>
                                <button
                                    style={styles.reactionButton}
                                    onClick={() => onReact(comment.id, "LIKE")}
                                >
                                    Like ({comment.likes})
                                </button>

                                <button
                                    style={styles.reactionButton}
                                    onClick={() => onReact(comment.id, "DISLIKE")}
                                >
                                    Dislike ({comment.dislikes})
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
}

const styles: Record<string, React.CSSProperties> = {
    wrapper: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
    },
    title: {
        margin: "0 0 16px",
        fontSize: "22px"
    },
    empty: {
        margin: 0,
        color: "#6b7280"
    },
    list: {
        display: "flex",
        flexDirection: "column",
        gap: "14px"
    },
    comment: {
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "14px"
    },
    commentHeader: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        color: "#111827"
    },
    date: {
        color: "#6b7280",
        fontSize: "14px"
    },
    text: {
        color: "#374151",
        lineHeight: 1.6
    },
    reactions: {
        display: "flex",
        gap: "8px"
    },
    reactionButton: {
        padding: "6px 10px",
        borderRadius: "6px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600
    }
};