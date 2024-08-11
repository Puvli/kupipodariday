import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import { WishEntity } from './wishes.entity';
  import { CreateWishDto } from './dto/create-wish.dto';
  import { UserEntity } from '../users/users.entity';
  import { UpdateWishDto } from './dto/update-wish.dto';
  
  @Injectable()
  export class WishesService {
    constructor(
      @InjectRepository(WishEntity)
      private wishesRepository: Repository<WishEntity>,
    ) {}
  
    async getAllWishes(): Promise<WishEntity[]> {
      return this.wishesRepository.find();
    }
  
    async createWish(createWishDto: CreateWishDto, user): Promise<WishEntity> {
      const { name, image, link, price, description } = createWishDto;
      const newWish = this.wishesRepository.create({
        name,
        image,
        link,
        price,
        description,
        owner: user,
      });
      await this.wishesRepository.save(newWish);
      return newWish;
    }
    getLast(): Promise<WishEntity[]> {
      return this.wishesRepository.find({
        where: {},
        order: { createdAt: 'DESC' },
        take: Number(40),
      });
    }
    getTop(): Promise<WishEntity[]> {
      return this.wishesRepository.find({
        where: {},
        order: { copied: 'DESC' },
        take: Number(20),
      });
    }
    async getWishById(wishId: number): Promise<WishEntity> {
      const wish = await this.wishesRepository.findOne({
        where: { id: wishId },
        relations: ['owner', 'offers'],
      });
      if (!wish) {
        throw new NotFoundException(`Подарок с номером ${wishId} не существует`);
      }
      return wish;
    }
    checkOwner(wish, user): boolean {
      return wish.owner.id === user.id;
    }
    async updateWish(
      wishId: number,
      user: UserEntity,
      updateWishDto: UpdateWishDto,
    ): Promise<WishEntity> {
      const wish = await this.getWishById(wishId);
      if (!this.checkOwner(wish, user)) {
        throw new ForbiddenException('Вы можете обновлять только свои подарки');
      } else if (wish.raised > 0) {
        throw new BadRequestException('Нельзя менять подарок, на который уже скинулись');
      } else {
        try {
          await this.wishesRepository.update({ id: wishId }, updateWishDto);
          return this.getWishById(wishId);
        } catch (err) {
          throw new BadRequestException(`${err.detail}`);
        }
      }
    }
    updateWishRaised(wish: WishEntity, amount: number) {
      return this.wishesRepository.update(
        { id: wish.id },
        { raised: wish.raised + amount },
      );
    }
    async removeOne(wishId, user): Promise<{ message: string }> {
      const wish = await this.getWishById(wishId);
      if (!this.checkOwner(wish, user)) {
        throw new ForbiddenException('Вы можете удалить только свои подарки');
      } else {
        try {
          await this.wishesRepository.delete(wishId);
          return { message: `Подарок под номером ${wishId} был успешно удален` };
        } catch (err) {
          throw new BadRequestException(`${err.detail}`);
        }
      }
    }
    async copyWish(wishId, user): Promise<WishEntity> {
      const wish = await this.getWishById(wishId);
      if (this.checkOwner(wish, user)) {
        throw new BadRequestException('Вы не можете копировать свои подарки к себе');
      }
      const newWish = await this.createWish({ ...wish }, user);
      this.wishesRepository.update({ id: wishId }, { copied: wish.copied + 1 });
      return newWish;
    }
  }
  