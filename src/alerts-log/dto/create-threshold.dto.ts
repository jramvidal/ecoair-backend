export class CreateThresholdDto {
  readonly condition: string;
  readonly sensitivity: string;
  readonly min_aqi: number;
  readonly message_template: string;
}