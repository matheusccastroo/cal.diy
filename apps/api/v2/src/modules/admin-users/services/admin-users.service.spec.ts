// Stub the dependencies so the test does not load Prisma and the platform libraries.
jest.mock("@calcom/platform-libraries", () => ({ slugify: jest.fn(() => "alice-example.com") }), {
  virtual: true,
});
jest.mock("@/platform/event-types/event-types_2024_06_14/services/event-types.service", () => ({
  EventTypesService_2024_06_14: class {},
}));
jest.mock("@/platform/schedules/schedules_2024_06_11/services/schedules.service", () => ({
  SchedulesService_2024_06_11: class {},
}));
jest.mock("@/modules/users/users.repository", () => ({ UsersRepository: class {} }));

import { Test } from "@nestjs/testing";
import { AdminUsersService } from "@/modules/admin-users/services/admin-users.service";
import { EventTypesService_2024_06_14 } from "@/platform/event-types/event-types_2024_06_14/services/event-types.service";
import { SchedulesService_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/services/schedules.service";
import { UsersRepository } from "@/modules/users/users.repository";

describe("AdminUsersService", () => {
  const usersRepository = { create: jest.fn() };
  const schedulesService = { createUserDefaultSchedule: jest.fn() };
  const eventTypesService = { createUserDefaultEventTypes: jest.fn() };

  it("creates the user with a default schedule in the user time zone and the default event types", async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: SchedulesService_2024_06_11, useValue: schedulesService },
        { provide: EventTypesService_2024_06_14, useValue: eventTypesService },
      ],
    }).compile();
    usersRepository.create.mockResolvedValue({ id: 7, timeZone: "America/Sao_Paulo", defaultScheduleId: null });
    schedulesService.createUserDefaultSchedule.mockResolvedValue({ id: 3 });
    eventTypesService.createUserDefaultEventTypes.mockResolvedValue([]);
    const body = { email: "alice@example.com", name: "Alice", metadata: { chatbotUserId: "chatbot-7" } };

    const user = await module.get(AdminUsersService).createUser(body);

    expect(usersRepository.create).toHaveBeenCalledWith(body, "alice-example.com");
    expect(schedulesService.createUserDefaultSchedule).toHaveBeenCalledWith(7, "America/Sao_Paulo");
    expect(eventTypesService.createUserDefaultEventTypes).toHaveBeenCalledWith(7);
    expect(user.defaultScheduleId).toBe(3);
  });
});
