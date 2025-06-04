import type { Request, Response } from "express";
import { config } from "../config.js";
import { reset } from "../db/queries/users.js";
import { ForbiddenError } from "./errors.js";
import { respondWithError } from "./json.js";

export async function handlerReset(_: Request, res: Response) {
	if (config.api.platform !== 'dev') {
		console.log(config.api.platform)
		respondWithError(res, 403, "Reset only allowed in dev env")
	}
	config.api.fileServerHits = 0;
	await reset()
	res.write("Hits reset to 0");
	res.end();
}
