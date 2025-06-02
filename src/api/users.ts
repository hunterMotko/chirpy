import { Request, Response } from "express";
import { createUser, getUserByEmail } from "../db/queries/users.js";
import { BadRequestError, UnauthorizedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { comparePassword, hashPassword, makeJWT } from "../auth.js";
import { config } from "../config.js";

type LoginRequest = {
	email: string;
	password: string;
	expiresInSeconds: number | null;
}

type UserResponse = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	email: string;
	token: string;
}

export async function handlerCreateUser(req: Request, res: Response) {
	try {
		const { email, password } = req.body
		if (
			email === undefined || email === "" ||
			password === undefined || password === ""
		) {
			throw new BadRequestError("Email and Password Required")
		}
		const hashedPassword = await hashPassword(password)
		let response = await createUser({ email, hashedPassword })
		respondWithJSON(res, 201, response)
	} catch (err) {
		throw err
	}
}

export async function handlerLogin(req: Request, res: Response) {
	try {
		const { email, password, expiresInSeconds }: LoginRequest = req.body
		if (email === undefined || email === "" || password === undefined || password === "") {
			res.status(400).json({ error: "Bad Request" })
		}

		const result = await getUserByEmail(email)
		if (!result) {
			res.status(401).json({ error: "Incorrect email or password" })
		}

		const isPass = await comparePassword(password, result.hashedPassword as string)
		if (!isPass) {
			res.status(401).json({ error: "Incorrect email or password" })
		}

		const token = makeJWT(result.id, expiresInSeconds ?? 3600, config.api.sec)

		const resp: UserResponse = {
			id: result.id,
			createdAt: result.createdAt,
			updatedAt: result.updatedAt,
			email: result.email,
			token: token
		}

		respondWithJSON(res, 200, resp)
	} catch (err) {
		throw err
	}
}
