import { type FormEvent, useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getPublicCategories } from "../api/publicApi";
import type{ Category } from "../types/category";
import { isLoggedIn } from "../utils/authStorage";

export function PublicLayout() {
    const navigate = useNavigate();

    const [categories, setCategories] = useState<Category[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    async function loadCategories() {
        try {
            const data = await getPublicCategories();
            setCategories(data.items);
        } catch {
            setCategories([]);
        }
    }

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const q = searchTerm.trim();

        if (!q) {
            return;
        }

        navigate(`/search?q=${encodeURIComponent(q)}`);
        setSearchTerm("");
    }

    useEffect(() => {
        loadCategories();
    }, []);

    return (
        <div>
            <header style={styles.header}>
                <Link to="/" style={styles.logo}>
                    RAF Novosti
                </Link>

                <nav style={styles.nav}>
                    <NavLink to="/" style={getLinkStyle}>
                        Početna
                    </NavLink>

                    <NavLink to="/most-read" style={getLinkStyle}>
                        Najčitanije
                    </NavLink>

                    {categories.map((category) => (
                        <NavLink
                            key={category.id}
                            to={`/categories/${category.id}`}
                            style={getLinkStyle}
                        >
                            {category.name}
                        </NavLink>
                    ))}

                    <NavLink
                        to={isLoggedIn() ? "/cms/categories" : "/cms/login"}
                        style={getLinkStyle}
                    >
                        CMS
                    </NavLink>
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

            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
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
        minHeight: "72px",
        background: "#111827",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: "24px",
        padding: "0 28px",
        flexWrap: "wrap"
    },
    logo: {
        color: "white",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: "20px"
    },
    nav: {
        display: "flex",
        gap: "16px",
        alignItems: "center",
        flex: 1,
        flexWrap: "wrap"
    },
    searchForm: {
        display: "flex",
        gap: "8px"
    },
    searchInput: {
        padding: "8px 10px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827"
    },
    searchButton: {
        padding: "8px 12px",
        borderRadius: "8px",
        border: "1px solid white",
        background: "white",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 700
    },
    main: {
        padding: "32px",
        background: "#f4f6f8",
        minHeight: "calc(100vh - 72px)"
    }
};