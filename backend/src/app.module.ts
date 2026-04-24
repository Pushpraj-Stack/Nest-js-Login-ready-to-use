import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    // Load .env globally
    ConfigModule.forRoot({ isGlobal: true }),

    // MongoDB connection
    MongooseModule.forRoot(process.env.MONGODB_URI as string),

    // Feature modules
    MailModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
