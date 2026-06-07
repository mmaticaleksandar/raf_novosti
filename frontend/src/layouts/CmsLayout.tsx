import { Outlet } from "react-router-dom";
import { CmsNavbar } from "../components/cms/CmsNavbar";

export function CmsLayout() {
    return (
        <div>
            <CmsNavbar />

            <main style={styles.main}>
                <Outlet />
            </main>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    main: {
        padding: "32px",
        background: "#f4f6f8",
        minHeight: "calc(100vh - 64px)"
    }
};