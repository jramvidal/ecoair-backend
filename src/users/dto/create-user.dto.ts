import { Role } from '../enums/role.enum';

export class CreateUserDto {
  readonly email!: string;
  readonly password!: string;
  readonly name?: string;
  readonly role?: Role; // Optional, if not provided, it will be 'user'

  readonly healthProfile?: {
    readonly condition: string;
    readonly sensitivityLevel: string;
  };
}
