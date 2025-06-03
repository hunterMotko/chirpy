import { Request, Response } from "express";
import { createUser, updateUser } from "../db/queries/users.js";
import { getBearerToken, hashPassword, validateJWT } from "../auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";
import { hash } from "crypto";

export type UserResponse = Omit<NewUser, "hashedPassword">;

export async function handlerCreateUser(req: Request, res: Response) {
	try {
		const { email, password } = req.body
		if (
			email === undefined || email === "" ||
			password === undefined || password === ""
		) {
			res.status(400).json({ error: "Email and Password Required" })
		}
		const hashedPassword = await hashPassword(password)
		if (!hashedPassword) {
			res.status(500).json({ error: "Hash Error" })
		}
		let response = await createUser({ email, hashedPassword })
		if (!response) {
			res.status(400).json({ error: "Email and Password Required" })
		}
		res.status(201).json(response)
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
			res.status(400).json({ error: "Email and Password Required" })
		}
		const hashedPassword = await hashPassword(password)
		if (!hashedPassword) {
			res.status(500).json({ error: "Hash Error" })
		}
		let response = await updateUser({
			id: userId, email, hashedPassword, updatedAt: new Date()
		})
		console.log(response)
		res.status(200).json(response)
	} catch (err) {
		throw err
	}
}
