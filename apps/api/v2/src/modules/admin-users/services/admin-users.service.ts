import { slugify } from "@calcom/platform-libraries";
import type { User } from "@calcom/prisma/client";
import { Injectable } from "@nestjs/common";
import { EventTypesService_2024_06_14 } from "@/platform/event-types/event-types_2024_06_14/services/event-types.service";
import { SchedulesService_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/services/schedules.service";
import { CreateManagedUserInput } from "@/modules/users/inputs/create-managed-user.input";
import { UsersRepository } from "@/modules/users/users.repository";

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly schedulesService: SchedulesService_2024_06_11,
    private readonly eventTypesService: EventTypesService_2024_06_14
  ) {}

  // A user without a default schedule and event types cannot be booked.
  async createUser(body: CreateManagedUserInput): Promise<User> {
    const user = await this.usersRepository.create(body, slugify(body.email));
    const defaultSchedule = await this.schedulesService.createUserDefaultSchedule(user.id, user.timeZone);
    await this.eventTypesService.createUserDefaultEventTypes(user.id);

    return { ...user, defaultScheduleId: defaultSchedule.id };
  }
}
