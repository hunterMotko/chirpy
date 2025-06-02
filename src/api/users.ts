import { Request, Response } from "express";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "../auth.js";
import { NewUser } from "../db/schema.js";

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
		res.status(500).json({ error: "something went wrong create: " + err })
	}
}
