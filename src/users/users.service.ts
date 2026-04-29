import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['healthProfile'], 
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...result } = user;
    return result;
  }

  // --- NEW: Update Profile Method ---
  async updateProfile(id: number, updateData: any) {
    // 1. Find user with their health profile relation
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['healthProfile'],
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // 2. Update basic info
    if (updateData.name) user.name = updateData.name;

    // 3. Update Health Profile info
    // If the user didn't have a health profile (edge case), we create it
    if (!user.healthProfile) {
      user.healthProfile = { condition: '', sensitivityLevel: '' } as any;
    }

    if (updateData.condition) {
      user.healthProfile.condition = updateData.condition;
    }

    if (updateData.sensitivity) {
      user.healthProfile.sensitivityLevel = updateData.sensitivity;
    }

    // 4. Save changes (cascade will handle the health_profiles table update)
    const updatedUser = await this.usersRepository.save(user);

    // Return the updated user without the password
    const { password: _, ...result } = updatedUser;
    return result;
  }
}