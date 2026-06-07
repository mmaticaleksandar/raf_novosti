import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoutes } from "./routes/authRoutes";
import { errorMiddleware } from "./middleware/errorMiddleware";
import { categoryRoutes } from "./routes/categoryRoutes";
import { newsRoutes } from "./routes/newsRoutes";
import { userRoutes } from "./routes/userRoutes";
import { publicRoutes } from "./routes/publicRoutes";
import { visitorMiddleware } from "./middleware/visitorMiddleware";

export const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(visitorMiddleware);


app.get("/", (req, res) => {
    res.json({
        message: "RAF Novosti backend radi"
    });
});

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

//Uvezane rute
app.use("/api/auth", authRoutes);
app.use("/api/cms/categories", categoryRoutes);
app.use("/api/cms/news", newsRoutes);
app.use("/api/cms/users", userRoutes);
app.use("/api/public", publicRoutes);

app.use(errorMiddleware);