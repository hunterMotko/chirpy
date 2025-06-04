import { Request, Response } from "express";
import { updateUserRed } from "../db/queries/users.js";
import { NotFoundError, UnauthorizedError } from "./errors.js";
import { getAPIKey } from "../auth.js";
import { config } from "../config.js"


export async function handlerPolkaWebhooks(req: Request, res: Response) {
	type params = {
		data: { userId: string },
		event: string;
	}
	const apiKey = getAPIKey(req)
	if (apiKey !== config.api.polka) {
		throw new UnauthorizedError("Unauthorized")
	}
	const { event, data }: params = req.body
	if (event === "user.upgraded") {
		const response = await updateUserRed(data.userId)
		if (!response) {
			throw new NotFoundError("Not Found")
		}
		console.log("update res", response)
		return res.status(204).send()
	}

	res.status(204).send()
}
