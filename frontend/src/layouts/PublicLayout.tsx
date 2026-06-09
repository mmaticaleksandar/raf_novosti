import { type FormEvent, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getPublicCategories } from "../api/publicApi";
import type{ Category } from "../types/category";
import { getCurrentUser, isLoggedIn } from "../utils/authStorage";

export function PublicLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isCategoryPageActive = location.pathname.startsWith("/categories/");
    const currentUser = getCurrentUser();


    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);

    async function loadCategories() {
        try {
            const data = await getPublicCategories();
            setCategories(data.items);
        } catch {
            setCategories([]);
        }
    }
    function handleCategoryClick() {
        setIsCategoriesMenuOpen(false);
    }
    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const q = searchTerm.trim();

        if (!q) {
            return;
        }

        navigate(`/search?q=${encodeURIComponent(q)}`);
        setSearchTerm("");
        setIsCategoriesMenuOpen(false);
    }

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <div>
            <header style={styles.header}>
                <Link
                    to="/"
                    style={styles.logo}
                    onClick={() => setIsCategoriesMenuOpen(false)}
                >
                    RAF Novosti
                </Link>

                <nav style={styles.nav}>
                    <NavLink
                        to="/"
                        style={getLinkStyle}
                        onClick={() => setIsCategoriesMenuOpen(false)}
                    >
                        Početna
                    </NavLink>

                    <NavLink
                        to="/most-read"
                        style={getLinkStyle}
                        onClick={() => setIsCategoriesMenuOpen(false)}
                    >
                        Najčitanije
                    </NavLink>

                    <div style={styles.dropdownWrapper}>
                        <button
                            type="button"
                            style={getCategoryButtonStyle(isCategoryPageActive, isCategoriesMenuOpen)}
                            onClick={() => setIsCategoriesMenuOpen((isOpen) => !isOpen)}
                            aria-expanded={isCategoriesMenuOpen}
                            aria-haspopup="menu"
                        >
                            Kategorije
                            <span style={styles.dropdownArrow}>
            {isCategoriesMenuOpen ? "▲" : "▼"}
        </span>
                        </button>

                        {isCategoriesMenuOpen && (
                            <div style={styles.dropdownMenu} role="menu">
                                {categories.length === 0 ? (
                                    <span style={styles.dropdownEmpty}>Nema kategorija</span>
                                ) : (
                                    categories.map((category) => (
                                        <NavLink
                                            key={category.id}
                                            to={`/categories/${category.id}`}
                                            style={getDropdownLinkStyle}
                                            onClick={handleCategoryClick}
                                            role="menuitem"
                                        >
                                            {category.name}
                                        </NavLink>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <NavLink
                        to={isLoggedIn() ? "/cms/categories" : "/cms/login"}
                        style={getAuthLinkStyle}
                        onClick={() => setIsCategoriesMenuOpen(false)}
                    >
                        {isLoggedIn() ? "CMS panel" : "Prijavi se"}
                    </NavLink>
                    {currentUser && (<div style={styles.publicUserBadge}>
                        <span style={styles.publicUserName}>
                            {currentUser.firstName} {currentUser.lastName}
                        </span>
                        <span style={styles.publicUserRole}>
                            {currentUser.role === "ADMIN" ? "Admin" : "Creator"}
                        </span>
                    </div>
                    )}
                </nav>

                <form onSubmit={handleSearch} style={styles.searchForm}>
                    <input
                        style={styles.searchInput}
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Pretraga..."
                    />

                    <button style={styles.searchButton} type="submit">
                        Traži
                    </button>
                </form>
            </header>

            <main style={styles.main} onClick={() => setIsCategoriesMenuOpen(false)}>
                <Outlet />
            </main>
        </div>
    );
}
function getCategoryButtonStyle(isActive: boolean, isOpen: boolean): React.CSSProperties {
    return {
        color: "white",
        background: isOpen ? "rgba(255, 255, 255, 0.12)" : "transparent",
        border: "none",
        borderBottom: isActive ? "2px solid white" : "2px solid transparent",
        padding: "0 0 4px 0",
        font: "inherit",
        fontWeight: isActive ? 700 : 400,
        cursor: "pointer",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        gap: "6px"
    };
}
function getDropdownLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
    return {
        color: "#111827",
        textDecoration: "none",
        fontWeight: isActive ? 700 : 500,
        background: isActive ? "#e5e7eb" : "white",
        padding: "10px 14px",
        borderRadius: "8px",
        whiteSpace: "nowrap"
    };
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
function getAuthLinkStyle({ isActive }: { isActive: boolean }): React.CSSProperties {
    return {
        color: "#0f172a",
        background: "white",
        textDecoration: "none",
        fontWeight: 900,
        border: isActive ? "2px solid #fbbf24" : "2px solid white",
        padding: "9px 14px",
        borderRadius: "999px",
        whiteSpace: "nowrap",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.18)"
    };
}
const styles: Record<string, React.CSSProperties> = {
    header: {
        minHeight: "76px",
        background: "linear-gradient(135deg, #0f172a 0%, #1f2937 65%, #334155 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "22px",
        padding: "0 32px",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 10,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.20)"
    },
    logo: {
        color: "white",
        textDecoration: "none",
        fontWeight: 900,
        fontSize: "22px",
        letterSpacing: "-0.03em",
        whiteSpace: "nowrap"
    },
    nav: {
        display: "flex",
        gap: "18px",
        alignItems: "center",
        flex: 1,
        flexWrap: "wrap"
    },
    searchForm: {
        display: "flex",
        gap: "8px",
        alignItems: "center",
        marginLeft: "auto"
    },
    searchInput: {
        width: "230px",
        padding: "10px 14px",
        borderRadius: "999px",
        border: "1px solid rgba(255, 255, 255, 0.65)",
        background: "white",
        color: "#111827",
        outline: "none",
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)"
    },
    searchButton: {
        padding: "10px 16px",
        borderRadius: "999px",
        border: "1px solid white",
        background: "white",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 900,
        boxShadow: "0 8px 18px rgba(0, 0, 0, 0.12)"
    },
    main: {
        padding: "32px",
        background: "#f4f6f8",
        minHeight: "calc(100vh - 72px)"
    },
    dropdownWrapper: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },
    dropdownArrow: {
        fontSize: "10px",
        lineHeight: 1
    },
    dropdownMenu: {
        position: "absolute",
        top: "calc(100% + 12px)",
        left: 0,
        minWidth: "220px",
        maxHeight: "320px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        padding: "8px",
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 16px 35px rgba(0, 0, 0, 0.22)",
        zIndex: 1000
    },
    dropdownEmpty: {
        color: "#6b7280",
        padding: "10px 14px",
        whiteSpace: "nowrap"
    },
    publicUserBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 10px",
        borderRadius: "999px",
        background: "rgba(255, 255, 255, 0.10)",
        border: "1px solid rgba(255, 255, 255, 0.20)",
        whiteSpace: "nowrap",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.12)"
    },
    publicUserName: {
        color: "white",
        fontWeight: 800,
        fontSize: "14px"
    },
    publicUserRole: {
        color: "#111827",
        background: "#fbbf24",
        padding: "3px 8px",
        borderRadius: "999px",
        fontWeight: 900,
        fontSize: "12px"
    },
};