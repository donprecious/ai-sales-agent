import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000'; // Default if not set
  const allowCredentials = corsOrigin !== '*';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: allowCredentials,
  });
  await app.listen(process.env.PORT ?? 3000);
  console.info(`app runing on port + ${process.env.PORT ?? 3000}`);
}
bootstrap();
