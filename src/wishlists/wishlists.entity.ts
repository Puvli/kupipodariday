import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsUrl, Length } from 'class-validator';
import { UserEntity } from '../users/users.entity';
import { WishEntity } from '../wishes/wishes.entity';

@Entity()
export class WishlistEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Length(0, 250)
  @IsNotEmpty()
  name: string;

  @Column()
  @IsUrl()
  image: string;

  @Column({ default: '' })
  @IsOptional()
  @Length(0, 1500)
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.wishlists)
  owner: UserEntity;

  @ManyToMany(() => WishEntity, (wish) => wish.id)
  @JoinTable()
  items: WishEntity[];
}
