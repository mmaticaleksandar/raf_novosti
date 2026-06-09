import { type FormEvent, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getCurrentUser } from "../../utils/authStorage";

export function CmsNavbar() {
    const navigate = useNavigate();
    const user = getCurrentUser();

    const [searchTerm, setSearchTerm] = useState("");

    function handleLogout() {
        clearAuth();
        navigate("/cms/login");
    }

    function handleCmsSearchSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const normalizedSearch = searchTerm.trim();

        if (!normalizedSearch) {
            return;
        }

        navigate(`/cms/news?search=${encodeURIComponent(normalizedSearch)}`);
        setSearchTerm("");
    }

    return (
        <header style={styles.header}>
            <div>
                <strong style={styles.logo}>RAF Novosti · CMS Panel</strong>
            </div>

            <nav style={styles.nav}>
                <NavLink to="/cms/categories" style={getLinkStyle}>
                    Kategorije
                </NavLink>

                <NavLink to="/cms/news" style={getLinkStyle}>
                    Vesti
                </NavLink>

                {user?.role === "ADMIN" && (
                    <NavLink to="/cms/users" style={getLinkStyle}>
                        Korisnici
                    </NavLink>
                )}

                <NavLink to="/" style={getLinkStyle}>
                    Otvori sajt
                </NavLink>
            </nav>

            <form onSubmit={handleCmsSearchSubmit} style={styles.searchForm}>
                <input
                    style={styles.searchInput}
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Pretraga vesti..."
                />

                <button type="submit" style={styles.searchButton}>
                    Pretraži
                </button>
            </form>

            <div style={styles.userBox}>
                {user && (
                    <div style={styles.userBadge}>
                        <span style={styles.userName}>
                            {user.firstName} {user.lastName}
                        </span>
                        <span style={styles.userRole}>
                            {user.role === "ADMIN" ? "Admin" : "Creator"}
                        </span>
                    </div>
                )}
                <button style={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </header>
    );
}

function getLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
    return {
        color: "white",
        textDecoration: "none",
        fontWeight: isActive ? 700 : 400,
        borderBottom: isActive ? "2px solid white" : "2px solid transparent",
        paddingBottom: "4px",
        whiteSpace: "nowrap"
    };
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        minHeight: "64px",
        background: "linear-gradient(135deg, #0f172a 0%, #111827 65%, #1f2937 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        gap: "24px",
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.18)",
        position: "relative",
        zIndex: 10
    },
    logo: {
        fontSize: "18px",
        whiteSpace: "nowrap"
    },
    nav: {
        display: "flex",
        gap: "18px",
        flex: 1
    },
    searchForm: {
        display: "flex",
        alignItems: "center",
        gap: "8px"
    },
    searchInput: {
        width: "190px",
        padding: "8px 10px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        fontSize: "14px",
        outline: "none"
    },
    searchButton: {
        padding: "8px 10px",
        borderRadius: "8px",
        border: "1px solid #ffffff",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 700,
        whiteSpace: "nowrap"
    },
    userBox: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        whiteSpace: "nowrap"
    },
    userBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 10px",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.10)",
        border: "1px solid rgba(255, 255, 255, 0.18)"
    },
    userName: {
        color: "white",
        fontWeight: 700,
        fontSize: "14px"
    },
    userRole: {
        color: "#111827",
        background: "#fbbf24",
        padding: "3px 7px",
        borderRadius: "999px",
        fontWeight: 800,
        fontSize: "12px"
    },
    logoutButton: {
        padding: "8px 12px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.35)",
        background: "rgba(255, 255, 255, 0.08)",
        color: "white",
        cursor: "pointer",
        fontWeight: 700
    }
};