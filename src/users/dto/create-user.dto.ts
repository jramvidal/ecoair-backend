import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @ApiProperty({ 
    example: 'usuario@ecoair.com', 
    description: 'The email address used for login and notifications' 
  })
  readonly email!: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'User password (must be at least 6 characters)' 
  })
  readonly password!: string;

  @ApiProperty({ 
    example: 'Juan Pérez', 
    required: false,
    description: 'Full name of the user' 
  })
  readonly name?: string;

  @ApiProperty({ 
    enum: Role, 
    example: Role.USER, 
    required: false,
    description: 'User role within the platform' 
  })
  readonly role?: Role;

  @ApiProperty({
    required: false,
    description: 'Initial health profile data for personalized alerts',
    example: {
      condition: 'Asma',
      sensitivityLevel: 'Alta'
    }
  })
  readonly healthProfile?: {
    readonly condition: string;
    readonly sensitivityLevel: string;
  };
}