import dayjs from "@calcom/dayjs";
import { buildDateRanges } from "@calcom/features/schedules/lib/date-ranges";

export {
  ScheduleRepository,
  type FindDetailedScheduleByIdReturnType,
} from "@calcom/features/schedules/repositories/ScheduleRepository";

export {
  updateSchedule,
  type UpdateScheduleResponse,
} from "@calcom/features/schedules/services/ScheduleService";
export { UserAvailabilityService } from "@calcom/features/availability/lib/getUserAvailability";

export {
  createHandler as createScheduleHandler,
  type CreateScheduleHandlerReturn,
} from "@calcom/trpc/server/routers/viewer/availability/schedule/create.handler";
export { ZCreateInputSchema as CreateScheduleSchema } from "@calcom/trpc/server/routers/viewer/availability/schedule/create.schema";

export {
  listHandler as getAvailabilityListHandler,
  type GetAvailabilityListHandlerReturn,
} from "@calcom/trpc/server/routers/viewer/availability/list.handler";
export {
  duplicateHandler as duplicateScheduleHandler,
  type DuplicateScheduleHandlerReturn,
} from "@calcom/trpc/server/routers/viewer/availability/schedule/duplicate.handler";

export { getScheduleByEventSlugHandler } from "@calcom/trpc/server/routers/viewer/availability/schedule/getScheduleByEventTypeSlug.handler";

export function getWorkingHoursInMillis(input: {
  availability: Parameters<typeof buildDateRanges>[0]["availability"];
  timeZone: string;
  dateFrom: Date;
  dateTo: Date;
}) {
  const { dateRanges } = buildDateRanges({
    availability: input.availability,
    timeZone: input.timeZone,
    dateFrom: dayjs(input.dateFrom),
    dateTo: dayjs(input.dateTo),
    travelSchedules: [],
  });
  return dateRanges.map(({ start, end }) => ({ start: start.valueOf(), end: end.valueOf() }));
}
