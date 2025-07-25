import { db } from '../index.js'
import { chirps, NewChirp } from '../schema.js';
import { desc, asc, eq } from 'drizzle-orm';

export async function getChirps(orderBy: string) {
	let result = await db
		.select()
		.from(chirps)
		.orderBy(orderBy === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt))

	return result
}

export async function getChirpById(id: string) {
	let [result] = await db
		.select()
		.from(chirps)
		.where(eq(chirps.id, id))

	return result
}

export async function createChirp(chirp: NewChirp) {
	const [result] = await db
		.insert(chirps)
		.values(chirp)
		.onConflictDoNothing()
		.returning();

	return result
}

export async function deleteChirp(id: string) {
	const [result] = await db
		.delete(chirps)
		.where(eq(chirps.id, id))
		.returning()

	return result
}
