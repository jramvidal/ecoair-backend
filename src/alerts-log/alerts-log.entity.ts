import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Measurement } from '../measurements/measurement.entity';

@Entity('alerts_log')
export class AlertLog {
  @PrimaryGeneratedColumn()
  id!: number; 

  @Column('text')
  message!: string; 

  @CreateDateColumn()
  sent_at!: Date; 

  @Column({ default: false })
  is_read!: boolean; 

  @ManyToOne(() => User, (user) => user.alerts)
  user!: User; 

  @ManyToOne(() => Measurement)
  measurement!: Measurement; 
}