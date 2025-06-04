import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { sql, eq } from 'drizzle-orm'

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning({
			id: users.id,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			email: users.email,
			isChirpyRed: users.isChirpyRed
		});

	return result;
}

export async function updateUserCreds(user: NewUser) {
	const [result] = await db
		.update(users)
		.set({
			email: user.email,
			hashedPassword: user.hashedPassword
		})
		.where(sql`${users.id} = ${user.id}`)
		.returning({
			id: users.id,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			email: users.email,
			isChirpyRed: users.isChirpyRed
		})
	return result
}

export async function updateUserRed(id: string) {
	const [result] = await db
		.update(users)
		.set({ isChirpyRed: true })
		.where(eq(users.id, id))
		.returning({
			id: users.id,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			email: users.email,
			isChirpyRed: users.isChirpyRed
		})

	return result
}

export async function getUserByEmail(email: string) {
	const [result] = await db
		.select()
		.from(users)
		.where(eq(users.email, email))

	return result
}

export async function reset() {
	await db.delete(users)
}
