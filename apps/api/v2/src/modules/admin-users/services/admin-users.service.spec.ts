// Stub the dependencies so the test does not load Prisma and the platform libraries.
jest.mock("@calcom/platform-libraries", () => ({ slugify: jest.fn(() => "alice-example.com") }), {
  virtual: true,
});
jest.mock("@/platform/schedules/schedules_2024_06_11/services/schedules.service", () => ({
  SchedulesService_2024_06_11: class {},
}));
jest.mock("@/modules/users/users.repository", () => ({ UsersRepository: class {} }));

import { Test } from "@nestjs/testing";
import { AdminUsersService } from "@/modules/admin-users/services/admin-users.service";
import { UsersRepository } from "@/modules/users/users.repository";
import { SchedulesService_2024_06_11 } from "@/platform/schedules/schedules_2024_06_11/services/schedules.service";

describe("AdminUsersService", () => {
  const usersRepository = { create: jest.fn() };
  const schedulesService = { createUserDefaultSchedule: jest.fn() };

  it("creates the user with a default schedule in the user time zone", async () => {
    const module = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: UsersRepository, useValue: usersRepository },
        { provide: SchedulesService_2024_06_11, useValue: schedulesService },
      ],
    }).compile();
    usersRepository.create.mockResolvedValue({
      id: 7,
      timeZone: "America/Sao_Paulo",
      defaultScheduleId: null,
    });
    schedulesService.createUserDefaultSchedule.mockResolvedValue({ id: 3 });
    const body = { email: "alice@example.com", name: "Alice", metadata: { chatbotUserId: "chatbot-7" } };

    const user = await module.get(AdminUsersService).createUser(body);

    expect(usersRepository.create).toHaveBeenCalledWith(body, "alice-example.com");
    expect(schedulesService.createUserDefaultSchedule).toHaveBeenCalledWith(7, "America/Sao_Paulo");
    expect(user.defaultScheduleId).toBe(3);
  });
});
