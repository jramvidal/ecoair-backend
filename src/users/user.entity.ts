import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { HealthProfile } from '../health-profiles/health-profile.entity';
import { Role } from './enums/role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  createdAt: Date;

  @OneToOne(() => HealthProfile, (healthProfile) => healthProfile.user, { cascade: true })
  @JoinColumn()
  healthProfile: HealthProfile;
}