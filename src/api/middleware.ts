import type { Request, Response, NextFunction } from "express";
import { config } from "../config.js";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors.js";
import { respondWithError } from "./json.js";

export function middlewareLogResponse(
	req: Request, res: Response, next: NextFunction,
) {
	res.on("finish", () => {
		const statusCode = res.statusCode;
		if (statusCode >= 300) {
			console.log(`[NON-OK] ${req.method} ${req.url}\n - Body: ${JSON.stringify(req.body)} - Status: ${statusCode}`);
		}
		console.log(`[OK] ${req.method} ${req.url}\n - Body: ${JSON.stringify(req.body)} - Status: ${statusCode}`);
	});
	next();
}

export function middlewareMetricsInc(
	_: Request, __: Response, next: NextFunction,
) {
	config.api.fileServerHits++;
	next();
}

export function errorMiddleWare(
	err: Error, _: Request, res: Response, ____: NextFunction,
) {
	let statusCode = 500
	let message = "Something went wrong on out end"
	console.log("I HIT THE MIDDLEWARE")
	if (err instanceof BadRequestError) {
		statusCode = 400
		message = err.message
	} else if (err instanceof UnauthorizedError) {
		statusCode = 401
		message = err.message
	} else if (err instanceof ForbiddenError) {
		statusCode = 403
		message = err.message
	} else if (err instanceof NotFoundError) {
		statusCode = 404
		message = err.message
	}
	if (statusCode >= 500) {
		console.log(err.message)
	}
	respondWithError(res, statusCode, message)
}
