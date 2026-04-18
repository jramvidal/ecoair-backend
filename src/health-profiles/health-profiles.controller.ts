import { Controller } from '@nestjs/common';
// We keep the import to ensure consistency with the other controllers.
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Profiles')
@Controller('health-profiles')
export class HealthProfilesController {
  // Endpoints for updating will be added here in the future.
  // the user’s medical condition or sensitivity.
}