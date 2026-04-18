import { ApiProperty } from '@nestjs/swagger';

export class CreateThresholdDto {
  @ApiProperty({ 
    example: 'Asma', 
    description: 'The health condition or pathology' 
  })
  readonly condition!: string;

  @ApiProperty({ 
    example: 'Alta', 
    description: 'Sensitivity level (e.g., Alta, Media, Baja)' 
  })
  readonly sensitivity!: string;

  @ApiProperty({ 
    example: 50, 
    description: 'Minimum AQI value to trigger the alert' 
  })
  readonly min_aqi!: number;

  @ApiProperty({ 
    example: 'Evite exteriores; use purificador.', 
    description: 'Health recommendation message for the user' 
  })
  readonly message_template!: string;
}