import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('health_profiles')
export class HealthProfile {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  condition!: string; // Example: 'Asma', 'Alergia al polen', 'EPOC'

  @Column()
  sensitivityLevel!: string; // Example: 'Alta', 'Media', 'Baja'

  // Inverse 1:1 relationship with the User entity.
  // The @JoinColumn() decorator is omitted because the User entity is the owning side of the relationship.
  @OneToOne(() => User, (user) => user.healthProfile)
  user!: User;
}