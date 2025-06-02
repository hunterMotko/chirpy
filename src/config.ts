import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
	api: APIConfig;
	db: DBConfig;
};

type APIConfig = {
	fileServerHits: number;
	sec: string;
	port: number;
};

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
};

process.loadEnvFile();

function envOrThrow(key: string) {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Environment variable ${key} is not set`);
	}
	return value;
}

const migrationConfig: MigrationConfig = {
	migrationsFolder: "./src/db/out",
};

export const config: Config = {
	api: {
		fileServerHits: 0,
		port: Number(envOrThrow("PORT")),
		sec: envOrThrow("SEC")
	},
	db: {
		url: envOrThrow("DB_URL"),
		migrationConfig: migrationConfig,
	},
};
