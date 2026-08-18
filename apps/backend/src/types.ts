import z from "zod"

export const preInterviewBody = z.object({
    githubUrl: z.string()
})