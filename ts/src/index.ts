import express from "express";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator"
import { drizzle } from "drizzle-orm/postgres-js"
import {
	errorMiddleWare,
	middlewareLogResponse,
	middlewareMetricsInc
} from "./api/middleware.js";
import {
	handlerLogin,
	handlerRefresh,
	handlerRevoke
} from './api/auth.js'
import {
	handlerAllChirps,
	handlerChirpById,
	handlerCreateChirp,
	handlerDeleteChirpById
} from "./api/chirps.js";
import { config } from "./config.js";
import { handlerReadiness } from "./api/readiness.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import {
	handlerCreateUser,
	handlerUpdateUser
} from "./api/users.js";
import { handlerPolkaWebhooks } from "./api/polka.js";


const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);
const app = express();

app.use(middlewareLogResponse);
app.use(express.json());
app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
	Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
	Promise.resolve(handlerCreateUser(req, res)).catch(next)
});
app.put("/api/users", (req, res, next) => {
	Promise.resolve(handlerUpdateUser(req, res)).catch(next)
});
app.post("/api/refresh", (req, res, next) => {
	Promise.resolve(handlerRefresh(req, res)).catch(next)
});
app.post("/api/revoke", (req, res, next) => {
	Promise.resolve(handlerRevoke(req, res)).catch(next)
});

app.post("/api/login", (req, res, next) => {
	Promise.resolve(handlerLogin(req, res)).catch(next)
});

app.get("/api/chirps", (req, res, next) => {
	Promise.resolve(handlerAllChirps(req, res)).catch(next)
});
app.get("/api/chirps/:id", (req, res, next) => {
	Promise.resolve(handlerChirpById(req, res)).catch(next)
});
app.delete("/api/chirps/:id", (req, res, next) => {
	Promise.resolve(handlerDeleteChirpById(req, res)).catch(next)
});
app.post("/api/chirps", (req, res, next) => {
	Promise.resolve(handlerCreateChirp(req, res)).catch(next)
});

app.post("/api/polka/webhooks", (req, res, next) => {
	Promise.resolve(handlerPolkaWebhooks(req, res)).catch(next)
});

app.get("/admin/metrics", (req, res, next) => {
	Promise.resolve(handlerMetrics(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
	Promise.resolve(handlerReset(req, res)).catch(next);
});

// // This needs to be under this route because of order of operations
app.use(errorMiddleWare)

app.listen(config.api.port, () => {
	console.log(`Server is running at http://localhost:${config.api.port}`);
});
