import { Module } from "@nestjs/common";
import { EventTypesModule_2024_06_14 } from "@/platform/event-types/event-types_2024_06_14/event-types.module";
import { SchedulesModule_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/schedules.module";
import { AdminUsersController } from "@/modules/admin-users/controllers/admin-users.controller";
import { AdminUsersService } from "@/modules/admin-users/services/admin-users.service";
import { UsersModule } from "@/modules/users/users.module";

@Module({
  imports: [UsersModule, SchedulesModule_2024_06_11, EventTypesModule_2024_06_14],
  providers: [AdminUsersService],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
