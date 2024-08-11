import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import config from './config/config';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './users/users.entity';
import { WishEntity } from './wishes/wishes.entity';
import { WishlistEntity } from './wishlists/wishlists.entity';
import { OfferEntity } from './offers/offers.entity';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { UsersModule } from './users/users.module';
import { OffersModule } from './offers/offers.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [config] }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: config().db.host,
      port: config().db.port,
      username: config().db.username,
      password: config().db.password,
      database: config().db.databaseName,
      entities: [UserEntity, WishEntity, WishlistEntity, OfferEntity],
      synchronize: true,
    }),
    WishesModule,
    WishlistsModule,
    UsersModule,
    OffersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      useClass: ClassSerializerInterceptor,
      provide: APP_INTERCEPTOR,
    },
  ],
})
export class AppModule {}
