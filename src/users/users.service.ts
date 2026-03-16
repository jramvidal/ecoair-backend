import { Injectable, UnauthorizedException } from '@nestjs/common';
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

  // Crea un usuario y, opcionalmente, su perfil de salud en cascada
  async create(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    
    // "Hasheamos" la contraseña por seguridad ética
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });
    
    return this.usersRepository.save(newUser);
  }

  // Valida al usuario y devuelve sus datos junto con su perfil de salud
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Buscamos al usuario incluyendo su relación con el perfil de salud
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

    // Quitamos la contraseña de la respuesta por seguridad
    const { password: _, ...result } = user;
    return result;
  }
}