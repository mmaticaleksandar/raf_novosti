import {type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    createCmsUser,
    getCmsUserById,
    updateCmsUser
} from "../../api/cmsUserApi";
import type {UserRole} from "../../types/user";
import { ErrorMessage } from "../../components/common/ErrorMessage";
import { LoadingMessage } from "../../components/common/LoadingMessage";

export function CmsUserFormPage() {
    const navigate = useNavigate();
    const params = useParams();

    const userId = params.id ? Number(params.id) : null;
    const isEditMode = Boolean(userId);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>("CONTENT_CREATOR");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    async function loadUser() {
        if (!userId) {
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const data = await getCmsUserById(userId);

            setFirstName(data.user.first_name);
            setLastName(data.user.last_name);
            setEmail(data.user.email);
            setRole(data.user.role);
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom učitavanja korisnika.";

            setError(message);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        if (!firstName.trim()) {
            setError("Ime je obavezno.");
            return;
        }

        if (!lastName.trim()) {
            setError("Prezime je obavezno.");
            return;
        }

        if (!email.trim()) {
            setError("Email je obavezan.");
            return;
        }

        if (!isEditMode) {
            if (!password.trim()) {
                setError("Lozinka je obavezna.");
                return;
            }

            if (password.length < 6) {
                setError("Lozinka mora imati najmanje 6 karaktera.");
                return;
            }

            if (password !== confirmPassword) {
                setError("Lozinke se ne poklapaju.");
                return;
            }
        }

        try {
            setIsSaving(true);

            if (isEditMode && userId) {
                await updateCmsUser(userId, {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    role
                });
            } else {
                await createCmsUser({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    role,
                    password,
                    confirmPassword
                });
            }

            navigate("/cms/users");
        } catch (error: any) {
            const message =
                error.response?.data?.message || "Greška prilikom čuvanja korisnika.";

            setError(message);
        } finally {
            setIsSaving(false);
        }
    }

    useEffect(() => {
        loadUser();
    }, [userId]);

    if (isLoading) {
        return <LoadingMessage message="Učitavanje korisnika..." />;
    }

    return (
        <section>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>
                        {isEditMode ? "Izmena korisnika" : "Dodavanje korisnika"}
                    </h1>

                    <p style={styles.subtitle}>
                        {isEditMode
                            ? "Izmeni podatke i tip postojećeg korisnika."
                            : "Dodaj novog CMS korisnika."}
                    </p>
                </div>

                <button
                    type="button"
                    style={styles.secondaryButton}
                    onClick={() => navigate("/cms/users")}
                >
                    Nazad
                </button>
            </div>

            <ErrorMessage message={error} />

            <form onSubmit={handleSubmit} style={styles.card}>
                <div style={styles.grid}>
                    <label style={styles.label}>
                        Ime
                        <input
                            style={styles.input}
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            placeholder="Ime"
                        />
                    </label>

                    <label style={styles.label}>
                        Prezime
                        <input
                            style={styles.input}
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            placeholder="Prezime"
                        />
                    </label>
                </div>

                <label style={styles.label}>
                    Email
                    <input
                        style={styles.input}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="korisnik@raf.rs"
                    />
                </label>

                <label style={styles.label}>
                    Tip korisnika
                    <select
                        style={styles.input}
                        value={role}
                        onChange={(event) => setRole(event.target.value as UserRole)}
                    >
                        <option value="CONTENT_CREATOR">Stvaralac sadržaja</option>
                        <option value="ADMIN">Administrator</option>
                    </select>
                </label>

                {!isEditMode && (
                    <>
                        <div style={styles.grid}>
                            <label style={styles.label}>
                                Lozinka
                                <input
                                    style={styles.input}
                                    type="password"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                    placeholder="Najmanje 6 karaktera"
                                />
                            </label>

                            <label style={styles.label}>
                                Potvrda lozinke
                                <input
                                    style={styles.input}
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    placeholder="Ponovi lozinku"
                                />
                            </label>
                        </div>
                    </>
                )}

                {isEditMode && (
                    <p style={styles.helpText}>
                        Lozinka se ne menja na ovoj formi. Menjaju se samo ime, prezime, email i tip korisnika.
                    </p>
                )}

                <div style={styles.actions}>
                    <button
                        type="button"
                        style={styles.secondaryButton}
                        onClick={() => navigate("/cms/users")}
                    >
                        Odustani
                    </button>

                    <button
                        type="submit"
                        style={styles.primaryButton}
                        disabled={isSaving}
                    >
                        {isSaving ? "Čuvanje..." : "Sačuvaj"}
                    </button>
                </div>
            </form>
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
        maxWidth: "860px",
        background: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: "18px"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "16px"
    },
    label: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        fontWeight: 700,
        color: "#374151"
    },
    input: {
        padding: "10px 12px",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        background: "#ffffff",
        color: "#111827",
        fontSize: "15px"
    },
    helpText: {
        margin: 0,
        color: "#6b7280",
        fontSize: "14px"
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "12px",
        marginTop: "8px"
    },
    primaryButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #111827",
        background: "#111827",
        color: "#ffffff",
        cursor: "pointer",
        fontWeight: 700
    },
    secondaryButton: {
        padding: "10px 14px",
        borderRadius: "8px",
        border: "1px solid #9ca3af",
        background: "#ffffff",
        color: "#111827",
        cursor: "pointer",
        fontWeight: 600
    }
};