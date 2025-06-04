import type { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
	api: APIConfig;
	db: DBConfig;
	jwt: JWTConfig;
};

type APIConfig = {
	fileServerHits: number;
	port: number;
	platform: string;
	polka: string;
};

type DBConfig = {
	url: string;
	migrationConfig: MigrationConfig;
};

type JWTConfig = {
	defaultDuration: number;
	refreshDuration: number;
	secret: string;
	issuer: string;
}

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
		platform: envOrThrow("PLATFORM"),
		polka: envOrThrow("POLKA_KEY")
	},
	db: {
		url: envOrThrow("DB_URL"),
		migrationConfig: migrationConfig,
	},
	jwt: {
		defaultDuration: 3600,
		refreshDuration: 60 * 60 * 24 * 60 * 1000,
		secret: envOrThrow("SEC"),
		issuer: "chirpy"
	}
};
