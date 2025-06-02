import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError, UnauthorizedError } from "./errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";


export async function handlerAllChirps(req: Request, res: Response) {
	try {
		const result = await getChirps()
		if (!result) {
			respondWithError(res, 404, "Not Found")
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}

export async function handlerChirpById(req: Request, res: Response) {
	try {
		if (!req.params.id) {
			respondWithError(res, 400, "Body and ID Required")
		}
		const result = await getChirpById(req.params.id)
		if (!result) {
			respondWithError(res, 404, "Not Found")
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}

export async function handlerCreateChirp(req: Request, res: Response) {
	try {
		const token = getBearerToken(req)
		const userId = validateJWT(token, config.api.sec)
		if (userId === "") {
			respondWithError(res, 401, "Unauthorized")
		}

		const { body } = req.body
		if (!body) {
			respondWithError(res, 400, "Body Required")
		}

		const result = await createChirp({ body, userId })
		if (!result) {
			respondWithError(res, 404, "Not Found")
		}

		respondWithJSON(res, 201, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}
