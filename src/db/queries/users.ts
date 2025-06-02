import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from 'drizzle-orm'

export async function createUser(user: NewUser) {
	const [result] = await db
		.insert(users)
		.values(user)
		.onConflictDoNothing()
		.returning({
			id: users.id,
			createdAt: users.createdAt,
			updatedAt: users.updatedAt,
			email: users.email
		});

	return result;
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
