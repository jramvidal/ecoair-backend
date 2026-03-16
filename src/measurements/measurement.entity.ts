import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Station } from '../stations/station.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  aqi: number;

  @Column('float', { nullable: true })
  pm25: number;

  @Column('float', { nullable: true })
  no2: number;

  @CreateDateColumn()
  timestamp: Date;

  // Relación inversa: Muchas mediciones para una sola estación
  @ManyToOne(() => Station, (station) => station.measurements)
  station: Station;
}