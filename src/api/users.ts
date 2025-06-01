import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";

export async function handlerCreateUser(req: Request, res: Response) {
	try {
		console.log(req.body)
		if (req.body?.email === undefined || req.body?.email === "") {
			throw new BadRequestError("Email required")
		}
		let response = await createUser(req.body)
		console.log(response)
		respondWithJSON(res, 201, response)
	} catch (err) {
		respondWithError(res, 500, "Something went wrong")
	}
}
