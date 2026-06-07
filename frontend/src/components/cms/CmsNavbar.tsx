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
                <strong style={styles.logo}>RAF Novosti CMS</strong>
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
                    Javni deo
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
                <span>
                    {user?.firstName} {user?.lastName}
                </span>

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
        background: "#111827",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        gap: "24px"
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
    logoutButton: {
        padding: "8px 12px",
        borderRadius: "6px",
        border: "none",
        cursor: "pointer",
        color: "black"
    }
};