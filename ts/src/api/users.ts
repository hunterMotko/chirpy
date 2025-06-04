import { Request, Response } from "express";
import { createUser, updateUserCreds } from "../db/queries/users.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
	try {
		const { email, password } = req.body
		if (
			email === undefined || email === "" ||
			password === undefined || password === ""
		) {
			throw new BadRequestError("Bad Create Request")
		}
		const hashedPassword = await hashPassword(password)
		let response = await createUser({ email, hashedPassword })
		if (!response) {
			throw new BadRequestError("Email and Password Required")
		}
		respondWithJSON(res, 201, response)
	} catch (err) {
		throw err;

	}
}

export async function handlerUpdateUser(req: Request, res: Response) {
	try {
		const token = getBearerToken(req)
		const userId = validateJWT(token, config.jwt.secret)
		const { email, password } = req.body
		if (
			email === undefined || email === "" ||
			password === undefined || password === ""
		) {
			throw new BadRequestError("Email and Password Required")
		}
		const hashedPassword = await hashPassword(password)
		let response = await updateUserCreds({
			id: userId, email, hashedPassword, updatedAt: new Date()
		})
		respondWithJSON(res, 200, response)
	} catch (err) {
		throw err
	}
}
