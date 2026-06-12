import express, { Express } from "express";
import cors from "cors";
import { errorHandler } from "./shared/errors/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import accountRoutes from "./modules/accounts/accounts.routes";
import tableRoutes from "./modules/tables/tables.routes";
import qrRoutes from "./modules/qr/qr.routes";

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin/accounts", accountRoutes);
app.use("/api/admin/tables", tableRoutes);
app.use("/api/admin/tables/:id/qr", qrRoutes);

app.use(errorHandler);

export default app;