import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Measurement } from '../measurements/measurement.entity';

@Entity('alerts_log')
export class AlertLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  message: string; // Ejemplo: "Calidad del aire mala para tu asma en Eixample"

  @CreateDateColumn()
  sent_at: Date;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Measurement)
  measurement: Measurement;
}