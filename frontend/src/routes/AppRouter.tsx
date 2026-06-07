import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { PublicLayout } from "../layouts/PublicLayout";
import { HomePage } from "../pages/public/HomePage";

import { LoginPage } from "../pages/cms/LoginPage";
import { CmsLayout } from "../layouts/CmsLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminRoute } from "./AdminRoute";

import { CmsCategoriesPage } from "../pages/cms/CmsCategoriesPage";
import { CmsCategoryFormPage } from "../pages/cms/CmsCategoryFormPage";

import { CmsNewsPage } from "../pages/cms/CmsNewsPage";
import { CmsNewsFormPage } from "../pages/cms/CmsNewsFormPage";

import { CmsUsersPage } from "../pages/cms/CmsUsersPage";
import { CmsUserFormPage } from "../pages/cms/CmsUserFormPage";

import { NewsDetailsPage } from "../pages/public/NewsDetailsPage";
import { MostReadPage } from "../pages/public/MostReadPage";
import { CategoryNewsPage } from "../pages/public/CategoryNewsPage";
import { TagNewsPage } from "../pages/public/TagNewsPage";
import { SearchPage } from "../pages/public/SearchPage";
import { GuestRoute } from "./GuestRoute";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/most-read" element={<MostReadPage />} />
                    <Route path="/categories/:id" element={<CategoryNewsPage />} />
                    <Route path="/tags/:tagName" element={<TagNewsPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/news/:id" element={<NewsDetailsPage />} />
                </Route>

                <Route element={<GuestRoute />}>
                    <Route path="/cms/login" element={<LoginPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<CmsLayout />}>
                        <Route
                            path="/cms"
                            element={<Navigate to="/cms/categories" replace />}
                        />

                        <Route
                            path="/cms/categories"
                            element={<CmsCategoriesPage />}
                        />

                        <Route
                            path="/cms/categories/new"
                            element={<CmsCategoryFormPage />}
                        />

                        <Route
                            path="/cms/categories/:id/edit"
                            element={<CmsCategoryFormPage />}
                        />

                        <Route
                            path="/cms/news"
                            element={<CmsNewsPage />}
                        />

                        <Route
                            path="/cms/news/new"
                            element={<CmsNewsFormPage />}
                        />

                        <Route
                            path="/cms/news/:id/edit"
                            element={<CmsNewsFormPage />}
                        />

                        <Route element={<AdminRoute />}>
                            <Route
                                path="/cms/users"
                                element={<CmsUsersPage />}
                            />

                            <Route
                                path="/cms/users/new"
                                element={<CmsUserFormPage />}
                            />

                            <Route
                                path="/cms/users/:id/edit"
                                element={<CmsUserFormPage />}
                            />

                        </Route>
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    );
}