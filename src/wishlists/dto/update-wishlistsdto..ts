import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  Length,
} from 'class-validator';

export class UpdateWishlistDto {
  @IsOptional()
  @Length(0, 250)
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @Length(0, 1500)
  description: string;

  @IsOptional()
  @IsUrl()
  image;

  @IsOptional()
  @IsArray()
  itemsId: Array<number>;
}
