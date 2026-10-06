import { slugify } from "@calcom/platform-libraries";
import type { User } from "@calcom/prisma/client";
import { Injectable } from "@nestjs/common";
import { CreateManagedUserInput } from "@/modules/users/inputs/create-managed-user.input";
import { UsersRepository } from "@/modules/users/users.repository";
import { SchedulesService_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/services/schedules.service";

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly schedulesService: SchedulesService_2024_06_11
  ) {}

  // A user without a default schedule cannot be booked.
  async createUser(body: CreateManagedUserInput): Promise<User> {
    const user = await this.usersRepository.create(body, slugify(body.email));
    const defaultSchedule = await this.schedulesService.createUserDefaultSchedule(user.id, user.timeZone);

    return { ...user, defaultScheduleId: defaultSchedule.id };
  }
}
