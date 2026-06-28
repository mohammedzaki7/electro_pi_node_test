import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: parseInt(process.env.PORT ?? "3000"),

  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: parseInt(process.env.DB_PORT ?? "5432"),
    username: process.env.DB_USERNAME ?? "postgres",
    password: process.env.DB_PASSWORD ?? "postgres",
    name: process.env.DB_NAME ?? "electro_pi",
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? "very_secret_key",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "1h",
  },

  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? "20"),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT ?? "100"),
  },
};
