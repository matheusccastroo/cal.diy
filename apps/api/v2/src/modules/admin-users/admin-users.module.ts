import { Module } from "@nestjs/common";
import { AdminUsersController } from "@/modules/admin-users/controllers/admin-users.controller";
import { AdminUsersService } from "@/modules/admin-users/services/admin-users.service";
import { UsersModule } from "@/modules/users/users.module";
import { SchedulesModule_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/schedules.module";

@Module({
  imports: [UsersModule, SchedulesModule_2024_06_11],
  providers: [AdminUsersService],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
