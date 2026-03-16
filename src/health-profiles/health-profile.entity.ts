import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  condition: string; // Ejemplo: 'Asma', 'Alergia al polen', 'EPOC'

  @Column()
  sensitivityLevel: string; // Ejemplo: 'Alta', 'Media', 'Baja'

  // Relación 1:1 inversa con el Usuario
  // No lleva @JoinColumn() porque el "dueño" de la relación es el Usuario
  @OneToOne(() => User, (user) => user.healthProfile)
  user: User;
}