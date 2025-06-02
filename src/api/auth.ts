import type { Request, Response } from "express";
import type { UserResponse } from "./users.js";
import { getUserByEmail } from "../db/queries/users.js";
import {
	comparePassword,
	getBearerToken,
	makeJWT,
	makeRefreshToken,
} from "../auth.js";
import { respondWithJSON } from "./json.js";
import { UnauthorizedError } from "./errors.js";
import { config } from "../config.js";
import {
	revokeRefreshToken,
	saveRefreshToken,
	userForRefreshToken,
} from "../db/queries/tokens.js";

type LoginResponse = UserResponse & {
	token: string;
	refreshToken: string;
};

export async function handlerLogin(req: Request, res: Response) {
	type parameters = {
		password: string;
		email: string;
	};

	const params: parameters = req.body;
	const user = await getUserByEmail(params.email);
	if (!user) {
		throw new UnauthorizedError("invalid username or password");
	}

	const matching = await comparePassword(
		params.password,
		user.hashedPassword,
	);
	if (!matching) {
		throw new UnauthorizedError("invalid username or password");
	}

	const accessToken = makeJWT(
		user.id,
		config.jwt.defaultDuration,
		config.jwt.secret,
	);
	const refreshToken = makeRefreshToken();

	const saved = await saveRefreshToken(user.id, refreshToken);
	if (!saved) {
		throw new UnauthorizedError("could not save refresh token");
	}

	respondWithJSON(res, 200, {
		id: user.id,
		email: user.email,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
		token: accessToken,
		refreshToken: refreshToken,
	} satisfies LoginResponse);
}

export async function handlerRefresh(req: Request, res: Response) {
	let refreshToken = getBearerToken(req);

	const result = await userForRefreshToken(refreshToken);
	if (!result) {
		throw new UnauthorizedError("invalid refresh token");
	}

	const user = result.user;
	const accessToken = makeJWT(
		user.id,
		config.jwt.defaultDuration,
		config.jwt.secret,
	);

	type response = {
		token: string;
	};

	respondWithJSON(res, 200, {
		token: accessToken,
	} satisfies response);
}

export async function handlerRevoke(req: Request, res: Response) {
	const refreshToken = getBearerToken(req);
	await revokeRefreshToken(refreshToken);
	res.status(204).send();
}
