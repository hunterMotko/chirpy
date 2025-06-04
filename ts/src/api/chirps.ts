import type { Request, Response } from "express";
import { createChirp, deleteChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";
import {
	BadRequestError,
	ForbiddenError,
	NotFoundError
} from "./errors.js";
import { respondWithJSON } from "./json.js";

export async function handlerAllChirps(req: Request, res: Response) {
	try {
		let orderBy = "";
		let sortBy = req.query.sort;
		if (typeof sortBy === "string") {
			orderBy = sortBy;
		}
		const result = await getChirps(orderBy)
		if (!result) {
			throw new NotFoundError("Chirps Not Found")
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		throw err;
	}
}

export async function handlerChirpById(req: Request, res: Response) {
	try {
		if (!req.params.id) {
			throw new BadRequestError("Bad Request")
		}
		const result = await getChirpById(req.params.id)
		if (!result) {
			throw new NotFoundError("Not Found")
		}
		respondWithJSON(res, 200, result)
	} catch (err) {
		throw err
	}
}

export async function handlerCreateChirp(req: Request, res: Response) {
	try {
		const token = getBearerToken(req)
		const userId = validateJWT(token, config.jwt.secret)
		const { body } = req.body
		if (!body) {
			throw new BadRequestError("Bad Create Request")
		}
		const result = await createChirp({ body, userId })
		if (!result?.id || !result.createdAt) {
			throw new NotFoundError("Not Found")
		}
		respondWithJSON(res, 201, result)
	} catch (err) {
		throw err
	}
}

export async function handlerDeleteChirpById(req: Request, res: Response) {
	try {
		const token = getBearerToken(req)
		const userId = validateJWT(token, config.jwt.secret)
		const chirp = await getChirpById(req.params.id)
		if (chirp.userId !== userId) {
			throw new ForbiddenError("Forbidden")
		}
		const result = await deleteChirp(req.params.id)
		if (!result) {
			throw new NotFoundError("Chirp Not Found")
		}
		res.status(204).send()
	} catch (err) {
		throw err
	}
}
