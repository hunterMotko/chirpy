import type { Request, Response } from "express";
import { createChirp, getChirpById, getChirps } from "../db/queries/chirps.js";
import { getBearerToken, validateJWT } from "../auth.js";
import { config } from "../config.js";


export async function handlerAllChirps(req: Request, res: Response) {
	try {
		const result = await getChirps()
		if (!result) {
			res.status(404).json({ error: "Not Found" })
		}
		res.status(200).json(result)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Something went wrong" + err })
	}
}

export async function handlerChirpById(req: Request, res: Response) {
	try {
		if (!req.params.id) {
			res.status(400).json({ error: "Body and ID Required" })
		}
		const result = await getChirpById(req.params.id)
		if (!result) {
			res.status(404).json({ error: "Not Found" })
		}
		res.json(result)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Something went wrong" + err })
	}
}

export async function handlerCreateChirp(req: Request, res: Response) {
	try {
		const token = getBearerToken(req)
		if (token === "") {
			console.error("NO TOKEN FOUND")
			res.status(401).json({ error: "Unauthorized" })
		}
		const userId = validateJWT(token, config.jwt.secret)
		if (userId === "") {
			console.error("NO USER ID")
			res.status(401).json({ error: "Unauthorized" })
			return
		}
		const { body } = req.body
		if (!body) {
			console.error("NO BODY" + body)
			res.status(400).json({ error: "Body Required" })
		}
		const result = await createChirp({ body, userId })
		if (!result?.id || !result.createdAt) {
			console.error("CREATE RESULT ERROR")
			res.status(404).json({ error: "Not Found" })
		}

		res.status(201).json(result)
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: "Something went wrong" + err })
	}
}
