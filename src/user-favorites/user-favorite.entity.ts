import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Station } from '../stations/station.entity';

@Entity('user_favorites')
export class UserFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  alias: string; // Ejemplo: "Estación cerca de casa"

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Station)
  station: Station;
}