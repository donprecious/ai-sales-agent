import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = [...(process.env.CORS_ORIGIN as string).split(',')]; // Default if not set
  let allowCredentials = ['*'];
  if (corsOrigin.length > 0) {
    allowCredentials = corsOrigin;
  }

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: allowCredentials,
  });
  await app.listen(process.env.PORT ?? 3000);
  console.info(`app runing on port + ${process.env.PORT ?? 3000}`);
}
bootstrap();
