import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    getCmsUsers,
    toggleCmsUserStatus
} from "../../api/cmsUserApi";
import type {CmsUser} from "../../types/user";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";
import { Pagination } from "../../components/common/Pagination";

export function CmsUsersPage() {
    const navigate = useNavigate();

    const [users, setUsers] = useState<CmsUser[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadUsers(selectedPage = page) {
        try {
            setIsLoading(true);
            setError("");

            const data = await getCmsUsers(selectedPage, 10);

            setUsers(data.items);
            setPage(data.page);
            setTotalPages(data.totalPages);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja korisnika.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleToggleStatus(user: CmsUser) {
        const action = user.status === "ACTIVE" ? "deaktiviraš" : "aktiviraš";

        const confirmed = window.confirm(
            `Da li sigurno želiš da ${action} korisnika "${user.email}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            await toggleCmsUserStatus(user.id);
            await loadUsers(page);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom promene statusa korisnika.";

            setError(message);
        }
    }

    useEffect(() => {
        loadUsers(1);
    }, []);

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Korisnici</h1>
                    <p style={styles.subtitle}>
                        Upravljanje CMS korisnicima i njihovim ulogama.
                    </p>
                </div>

                <button
                    style={styles.primaryButton}
                    onClick={() => navigate("/cms/users/new")}
                >
                    Dodaj korisnika
                </button>
            </div>

            <ErrorMessage message={error} />

            {isLoading ? (
                <LoadingMessage message="Učitavanje korisnika..." />
            ) : (
                <div style={styles.card}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>Ime i prezime</th>
                            <th style={styles.th}>Email</th>
                            <th style={styles.th}>Tip korisnika</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Akcije</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td style={styles.td} colSpan={5}>
                                    Nema korisnika.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td style={styles.td}>
                                        <strong>
                                            {user.first_name} {user.last_name}
                                        </strong>
                                    </td>

                                    <td style={styles.td}>{user.email}</td>

                                    <td style={styles.td}>
                                        {user.role === "ADMIN" ? "Administrator" : "Stvaralac sadržaja"}
                                    </td>

                                    <td style={styles.td}>
                      <span
                          style={
                              user.status === "ACTIVE"
                                  ? styles.activeBadge
                                  : styles.inactiveBadge
                          }
                      >
                        {user.status === "ACTIVE" ? "Aktivan" : "Neaktivan"}
                      </span>
                                    </td>

                                    <td style={styles.td}>
                                        <div style={styles.actions}>
                                            <button
                                                style={styles.secondaryButton}
                                                onClick={() => navigate(`/cms/users/${user.id}/edit`)}
                                            >
                                                Izmeni
                                            </button>

                                            {user.role === "CONTENT_CREATOR" && (
                                                <button
                                                    style={
                                                        user.status === "ACTIVE"
                                                            ? styles.dangerButton
                                                            : styles.successButton
                                                    }
                                                    onClick={() => handleToggleStatus(user)}
                                                >
                                                    {user.status === "ACTIVE" ? "Deaktiviraj" : "Aktiviraj"}
                                                </button>
                                            )}
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
                        onPageChange={loadUsers}
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
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        overflowX: "auto"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse"
    },
    th: {
        textAlign: "left",
        borderBottom: "1px solid #e5e7eb",
        padding: "12px",
        color: "#374151",
        whiteSpace: "nowrap"
    },
    td: {
        borderBottom: "1px solid #f3f4f6",
        padding: "12px",
        verticalAlign: "top"
    },
    actions: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap"
    },
    activeBadge: {
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "#dcfce7",
        color: "#166534",
        fontWeight: 700,
        fontSize: "13px"
    },
    inactiveBadge: {
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "#fee2e2",
        color: "#991b1b",
        fontWeight: 700,
        fontSize: "13px"
    },
    primaryButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #111827",
        background: "#111827",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },
    secondaryButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #9ca3af",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    },
    dangerButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #fca5a5",
        background: "#fee2e2",
        color: "#991b1b",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    },
    successButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #86efac",
        background: "#dcfce7",
        color: "#166534",
        cursor: "pointer",
        fontWeight: 600,
        whiteSpace: "nowrap"
    }
};