import TimerModel from "@/model/Timer.model";
import { localDateKey, localMidnight, weekEndDateKey } from "@/lib/dateKey";

export async function findTimerDoc(
  userId: string,
  opts: { isWeekly: boolean; date?: Date }
) {
  const isWeekly = opts.isWeekly;
  const key = isWeekly ? weekEndDateKey(opts.date) : localDateKey(opts.date);
  const midnight = localMidnight();
  const found = await TimerModel.findOne({
    userId,
    isWeekly,
    $or: [{ date: key }, { date: midnight as unknown as string }],
  });
  return { doc: found, key };
}
