import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Measurement } from '../measurements/measurement.entity';

@Entity('stations')
export class Station {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  external_id: string; 

  @Column()
  name: string;

  @Column('float')
  lat: number;

  @Column('float')
  lon: number;

  // Usamos una función flecha () => Measurement para manejar la carga diferida
  @OneToMany(() => Measurement, (measurement) => measurement.station)
  measurements: Measurement[];
}