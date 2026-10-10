// Stub the dependencies so the test does not load Prisma and the platform libraries.
jest.mock("@calcom/platform-libraries", () => ({}), { virtual: true });
jest.mock(
  "@calcom/platform-libraries/event-types",
  () => ({ EventTypeMetaDataSchema: { parse: () => null } }),
  { virtual: true }
);
jest.mock("@calcom/platform-libraries/schedules", () => ({ getWorkingHoursInMillis: jest.fn() }), {
  virtual: true,
});
jest.mock("@/lib/api-key", () => ({}));
jest.mock("@/modules/api-keys/api-keys-repository", () => ({}));
jest.mock("@/modules/booking-seat/booking-seat.repository", () => ({}));
jest.mock("@/modules/oauth-clients/services/oauth-clients-users.service", () => ({}));
jest.mock("@/modules/oauth-clients/services/oauth-flow.service", () => ({}));
jest.mock("@/modules/users/users.repository", () => ({}));
jest.mock("@/platform/bookings/2024-08-13/repositories/bookings.repository", () => ({}));
jest.mock("@/platform/bookings/2024-08-13/services/bookings.service", () => ({}));
jest.mock("@/platform/bookings/2024-08-13/services/output.service", () => ({}));
jest.mock("@/platform/bookings/shared/platform-bookings.service", () => ({}));
jest.mock("@/platform/event-types/event-types_2024_06_14/event-types.repository", () => ({}));
jest.mock("@/platform/event-types/event-types_2024_06_14/services/output-event-types.service", () => ({}));
jest.mock("@/platform/event-types/event-types_2024_06_14/transformers", () => ({}));
jest.mock("@/platform/schedules/schedules_2024_04_15/schedules.repository", () => ({}));

import { FrequencyInput } from "@calcom/platform-enums";
import { getWorkingHoursInMillis } from "@calcom/platform-libraries/schedules";
import type { CreateRecurringBookingInput_2024_08_13 } from "@calcom/platform-types";
import type { EventTypeWithOwnerAndTeam } from "@/platform/bookings/2024-08-13/services/bookings.service";
import { InputBookingsService_2024_08_13 } from "@/platform/bookings/2024-08-13/services/input.service";

describe("InputBookingsService_2024_08_13 recurrence", () => {
  const timeZone = "America/Sao_Paulo";
  const eventType = {
    id: 1,
    length: 60,
    recurringEvent: null,
    scheduleId: null,
    schedulingType: null,
    owner: { timeZone, defaultScheduleId: 5 },
  } as unknown as EventTypeWithOwnerAndTeam;
  const service: InputBookingsService_2024_08_13 = Object.assign(
    Object.create(InputBookingsService_2024_08_13.prototype),
    { schedulesRepository: { getScheduleById: async () => ({ timeZone, availability: [] }) } }
  );
  const millis = (iso: string) => new Date(iso).getTime();

  const transform = (start: string, frequency: FrequencyInput, count: number) =>
    service.transformInputCreateRecurringBooking(
      {
        start,
        eventTypeId: 1,
        attendee: { name: "Ana", email: "ana@example.com", timeZone: "Europe/Lisbon" },
        metadata: { chatbotBookingId: "b-1" },
        recurrence: { frequency, count },
      } as CreateRecurringBookingInput_2024_08_13,
      eventType
    );

  it("keeps the day of the month and uses the last day when a month is shorter", async () => {
    jest.mocked(getWorkingHoursInMillis).mockReturnValue([{ start: 0, end: millis("2028-01-01") }]);

    const events = await transform("2027-01-31T18:00:00Z", FrequencyInput.monthly, 4);

    expect(events.map((event) => event.start)).toEqual([
      "2027-01-31T15:00:00.000-03:00",
      "2027-02-28T15:00:00.000-03:00",
      "2027-03-31T15:00:00.000-03:00",
      "2027-04-30T15:00:00.000-03:00",
    ]);
    expect(new Set(events.map((event) => event.recurringEventId)).size).toBe(1);
    expect(events.every((event) => event.metadata.chatbotBookingId === "b-1")).toBe(true);
  });

  it("removes the dates outside the working hours but never the first date", async () => {
    // Friday and Sunday until 18:00, Saturday until 12:00.
    jest.mocked(getWorkingHoursInMillis).mockReturnValue([
      { start: millis("2027-01-01T12:00:00Z"), end: millis("2027-01-01T21:00:00Z") },
      { start: millis("2027-01-02T12:00:00Z"), end: millis("2027-01-02T15:00:00Z") },
      { start: millis("2027-01-03T12:00:00Z"), end: millis("2027-01-03T21:00:00Z") },
    ]);

    const fromFriday = await transform("2027-01-01T18:00:00Z", FrequencyInput.daily, 3);
    const fromSaturday = await transform("2027-01-02T18:00:00Z", FrequencyInput.daily, 2);

    expect(fromFriday.map((event) => event.start)).toEqual([
      "2027-01-01T15:00:00.000-03:00",
      "2027-01-03T15:00:00.000-03:00",
    ]);
    expect(fromSaturday).toHaveLength(2);
  });
});
