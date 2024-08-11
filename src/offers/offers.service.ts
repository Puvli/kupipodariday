import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { DataSource, Repository } from 'typeorm';
  import { OfferEntity } from './offers.entity';
  import { CreateOfferDto } from './dto/create-offer.dto';
  import { UserEntity } from '../users/users.entity';
  import { WishesService } from '../wishes/wishes.service';
  
  @Injectable()
  export class OffersService {
    constructor(
      @InjectRepository(OfferEntity)
      private offersRepository: Repository<OfferEntity>,
      @Inject(WishesService)
      private readonly wishesService: WishesService,
      private dataSource: DataSource,
    ) {}
  
    getAll(): Promise<OfferEntity[]> {
      return this.offersRepository.find({
        where: {},
        relations: ['user', 'item'],
      });
    }
  
    async getOfferById(id): Promise<OfferEntity> {
      const offer = await this.offersRepository.findOne({
        where: {
          id,
        },
        relations: ['item', 'user'],
      });
      if (!offer) {
        throw new NotFoundException(`Оффер под номером ${id} не существует`);
      }
      return offer;
    }
  
    async createOffer(
      createOfferDto: CreateOfferDto,
      user: UserEntity,
    ): Promise<OfferEntity> {
      const { amount, hidden, itemId } = createOfferDto;
      const wish = await this.wishesService.getWishById(itemId);
      if (this.wishesService.checkOwner(wish, user)) {
        throw new ForbiddenException(
          'Вы не можете скидываться на собственные подарки',
        );
      } else if (wish.raised + amount > wish.price) {
        throw new BadRequestException(
          `Вы можете скинуть ${wish.price - wish.raised}`,
        );
      }
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const newOffer = this.offersRepository.create({
        amount,
        hidden,
        item: wish,
        user,
      });
      try {
        await this.offersRepository.save(newOffer);
        await this.wishesService.updateWishRaised(wish, amount);
        return newOffer;
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(err.code);
      } finally {
        await queryRunner.release();
      }
    }
  }
  