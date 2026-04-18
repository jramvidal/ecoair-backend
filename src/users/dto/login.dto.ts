import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ 
    example: 'usuario@ecoair.com', 
    description: 'Registered email address' 
  })
  readonly email!: string;

  @ApiProperty({ 
    example: 'Password123!', 
    description: 'The plain text password' 
  })
  readonly password!: string;
}