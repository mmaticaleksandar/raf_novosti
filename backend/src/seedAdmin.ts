import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { db } from "./config/db";

dotenv.config();

async function seedAdmin() {
    const email = "admin@raf.rs";
    const password = "admin123";

    const firstName = "Admin";
    const lastName = "RAF";

    try {
        const [existingUsers] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        const users = existingUsers as { id: number }[];

        if (users.length > 0) {
            console.log("Admin user already exists.");
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await db.query(
            `
      INSERT INTO users 
        (email, first_name, last_name, role, status, password_hash)
      VALUES 
        (?, ?, ?, ?, ?, ?)
      `,
            [
                email,
                firstName,
                lastName,
                "ADMIN",
                "ACTIVE",
                passwordHash
            ]
        );

        console.log("Admin user created successfully.");
        console.log("Email:", email);
        console.log("Password:", password);

        process.exit(0);
    } catch (error) {
        console.error("Failed to seed admin user.");
        console.error(error);
        process.exit(1);
    }
}

seedAdmin();