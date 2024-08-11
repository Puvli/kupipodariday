import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { WishlistEntity } from './wishlists.entity';
  import { Repository } from 'typeorm';
  import { UserEntity } from '../users/users.entity';
  import { CreateWishlistDto } from './dto/create-wishlists.dto.';
  import { WishEntity } from '../wishes/wishes.entity';
  import { UpdateWishlistDto } from './dto/update-wishlistsdto.';
  
  @Injectable()
  export class WishlistsService {
    constructor(
      @InjectRepository(WishlistEntity)
      private readonly wishlistRepository: Repository<WishlistEntity>,
    ) {}
  
    getWishlists(): Promise<WishlistEntity[]> {
      return this.wishlistRepository.find({});
    }
  
    async getWishlistById(id): Promise<WishlistEntity> {
      const wishlist = await this.wishlistRepository.findOne({
        where: { id },
        relations: ['owner', 'items'],
      });
      if (!wishlist) {
        throw new NotFoundException(`Список под номером ${id} не найден`);
      }
      return wishlist;
    }
  
    async createWishlist(
      user: UserEntity,
      createWishlistDto: CreateWishlistDto,
    ): Promise<WishlistEntity> {
      const { name, description = '', image, itemsId } = createWishlistDto;
      const items = itemsId.map((id) => ({ id } as WishEntity));
      try {
        const newWishlist = this.wishlistRepository.create({
          name,
          description,
          image,
          items,
          owner: user,
        });
        return await this.wishlistRepository.save(newWishlist);
      } catch (err) {
        console.log(err);
        throw new BadRequestException(`${err.detail}`);
      }
    }
    async updateWishlist(
      user: UserEntity,
      updateWishlistDto: UpdateWishlistDto,
      id: number,
    ): Promise<WishlistEntity> {
      const wishlist = await this.getWishlistById(id);
      if (wishlist.owner.id !== user.id) {
        throw new ForbiddenException('Вы можете обновлять только свой список');
      } else {
        try {
          const { itemsId, ...rest } = updateWishlistDto;
          const items = itemsId.map((id) => ({ id } as WishlistEntity));
          await this.wishlistRepository.save({ id, ...rest, items });
          return this.getWishlistById(wishlist.id);
        } catch (err) {
          throw new BadRequestException(`${err.detail}`);
        }
      }
    }
  
    async removeOne(id, user): Promise<{ message: string }> {
      const wishlist = await this.getWishlistById(id);
      if (wishlist.owner.id !== user.id) {
        throw new ForbiddenException('Вы можете удалять только свои подарки');
      } else {
        try {
          await this.wishlistRepository.delete(id);
          return { message: `Подарок под номером ${id} был успешно удален` };
        } catch (err) {
          throw new BadRequestException(`${err.detail}`);
        }
      }
    }
  }
  