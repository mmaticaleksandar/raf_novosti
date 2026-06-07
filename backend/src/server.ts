import dotenv from "dotenv";
import { app } from "./app";
import { testDbConnection } from "./config/db";

dotenv.config();

const PORT = process.env.PORT || 8081;

async function startServer() {
    try {
        await testDbConnection();

        app.listen(PORT, () => {
            console.log(`Backend running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server");
        console.error(error);
        process.exit(1);
    }
}

startServer();