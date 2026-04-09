import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('alert_thresholds')
export class AlertThreshold {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  condition!: string; // Example: 'Asma', 'Alergia', 'General'

  @Column()
  sensitivity!: string; // Example: 'Alta', 'Media', 'Baja'

  @Column('int')
  min_aqi!: number; // The AQI threshold at which the alert is triggered.

  @Column({ type: 'text' })
  message_template!: string; // The message to be sent. (ex: 'Niveles altos detectados para tu perfil')
}