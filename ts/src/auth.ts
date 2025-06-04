import { compare, hash } from 'bcrypt'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { BadRequestError, UnauthorizedError } from './api/errors.js'
import { config } from './config.js'
import crypto from 'crypto'
import { Request } from 'express'

export async function hashPassword(pw: string): Promise<string> {
	return await hash(pw, 10)
}

export async function comparePassword(pw: string, hash: string) {
	return await compare(pw, hash)
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
	const issued = Math.floor(Date.now() / 1000)
	let p: payload = {
		iss: 'chirpy',
		sub: userID,
		iat: issued,
		exp: issued + expiresIn
	}
	return jwt.sign(p, secret, { algorithm: "HS256" })
}

export function validateJWT(tokenString: string, secret: string): string {
	let decoded: payload
	try {
		decoded = jwt.verify(tokenString, secret) as JwtPayload
	} catch (err) {
		throw new UnauthorizedError("UnauthorizedError")
	}
	if (decoded.iss !== config.jwt.issuer) {
		throw new UnauthorizedError("UnauthorizedError")
	}
	if (!decoded.sub) {
		throw new UnauthorizedError("UnauthorizedError")
	}
	return decoded.sub
}

export function getBearerToken(req: Request) {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		throw new UnauthorizedError("Malformed authorization header");
	}
	return extractBearerToken(authHeader);
}

export function extractBearerToken(header: string) {
	const splitAuth = header.split(" ");
	if (splitAuth.length < 2 || splitAuth[0] !== "Bearer") {
		throw new UnauthorizedError("Malformed authorization header");
	}
	return splitAuth[1];
}

export function getAPIKey(req: Request) {
	const authHeader = req.get("Authorization");
	if (!authHeader) {
		throw new UnauthorizedError("Malformed authorization header");
	}
	const splitAuth = authHeader.split(" ");
	if (splitAuth.length < 2 || splitAuth[0] !== "ApiKey") {
		throw new UnauthorizedError("Malformed authorization header");
	}
	return splitAuth[1];
}


export function makeRefreshToken() {
	return crypto.randomBytes(256).toString('hex')
}

