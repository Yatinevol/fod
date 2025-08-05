
import * as z from "zod"

export const goaltitleSchema = z.object({
    title: z.string().min(3,{message: "title must be atleast of 3 characters"}),
    category: z.string()
})