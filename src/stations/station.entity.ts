import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Measurement } from '../measurements/measurement.entity';
import { UserFavorite } from '../user-favorites/user-favorite.entity'; 

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  external_id!: string; 

  @Column()
  name!: string;

  @Column('float')
  lat!: number;

  @Column('float')
  lon!: number;

  @OneToMany(() => Measurement, (measurement) => measurement.station)
  measurements!: Measurement[];

  // The relational link to favorites.
  @OneToMany(() => UserFavorite, (userFavorite) => userFavorite.station)
  userFavorites!: UserFavorite[];
}