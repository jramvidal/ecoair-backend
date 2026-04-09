import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Station } from '../stations/station.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('float')
  aqi!: number;

  @Column('float', { nullable: true })
  pm25!: number;

  @Column('float', { nullable: true })
  no2!: number;

  @CreateDateColumn()
  timestamp!: Date;

  // Inverse One-to-Many relationship with the Station entity.
  @ManyToOne(() => Station, (station) => station.measurements)
  station!: Station;
}