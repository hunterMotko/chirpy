import { compare, hash } from 'bcrypt'
import { Request } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export async function hashPassword(pw: string): Promise<string> {
	return await hash(pw, 10)
}

export async function comparePassword(pw: string, hash: string) {
	return await compare(pw, hash)
}

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">

export function makeJWT(userID: string, expiresIn: number, secret: string): string {
	let p: payload = {
		iss: 'chirpy',
		sub: userID,
		iat: Math.floor(Date.now() / 1000),
		exp: Math.floor(Date.now() / 1000) + expiresIn
	}

	return jwt.sign(p, secret)
}

export function validateJWT(tokenString: string, secret: string): string {
	let res = ""
	jwt.verify(tokenString, secret, (err, decoded) => {
		if (err !== null) {
			console.error(err)
		}
		if (typeof decoded?.sub === 'string') {
			res = decoded?.sub
		}
	})
	return res
}

export function getBearerToken(req: Request): string {
	let token = req.get('Authorization')
	if (!token) {
		return ""
	}
	return token.split(" ")[1]
}
