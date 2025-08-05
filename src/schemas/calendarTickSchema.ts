import * as z from "zod"

export const calendarTickSchema = z.object({
    // refine checks custom validation logic 
    date: z.string().refine(val => /^\d{4}-\d{2}-\d{2}$/.test(val), {
        message: "Date must be in YYYY-MM-DD format",
      })
})