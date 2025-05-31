process.loadEnvFile(".env")
import type { MigrationConfig } from "drizzle-orm/migrator";

const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/db/migrations",
};

type APIConfig = {
	fileServerHits: number;
	db: {
		url: string,
		migrationsConfig: MigrationConfig
	}
};

export const config: APIConfig = {
	fileServerHits: 0,
	db: {
		url: process.env.DB_URL || "",
		migrationsConfig: migrationConfig
	}
}
