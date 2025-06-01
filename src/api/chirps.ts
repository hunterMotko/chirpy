import type { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, NotFoundError } from "./errors.js";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";


export async function handlerAllChirps(req: Request, res: Response) {
	try {
		const result = await getChirps()
		if (!result) {
			throw new NotFoundError('Resource Not Found')
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}
export async function handlerChirpById(req: Request, res: Response) {
	try {
		if (!req.params.id) {
			throw new BadRequestError("UserId param required")
		}
		const result = await getChirpById(req.params.id)
		if (!result) {
			throw new NotFoundError('Resource Not Found')
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}

export async function handlerCreateChirp(req: Request, res: Response) {
	try {
		const { body, userId } = req.body
		if (!body || !userId) {
			throw new BadRequestError("Body and UserId required")
		}
		const result = await createChirp({ body, userId })
		if (!result) {
			throw new NotFoundError('Resource Not Found')
		}
		respondWithJSON(res, 201, result)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong trying to chirp")
	}
}
