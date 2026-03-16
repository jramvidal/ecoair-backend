import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('alert_thresholds')
export class AlertThreshold {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  condition: string; // Ejemplo: 'Asma', 'Alergia', 'General'

  @Column()
  sensitivity: string; // Ejemplo: 'Alta', 'Media', 'Baja'

  @Column('int')
  min_aqi: number; // El valor de AQI a partir del cual se dispara la alerta

  @Column({ type: 'text' })
  message_template: string; // El mensaje que se enviará (ej: 'Niveles altos detectados para tu perfil')
}