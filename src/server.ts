import "reflect-metadata";
import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { seedRoles } from "./seeds/role.seed";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();
  await seedRoles(AppDataSource);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
