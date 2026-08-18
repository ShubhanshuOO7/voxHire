import "dotenv/config"
import { prisma } from "./db"

export const onLlama = async(interviewId:string)=>{
    const messages = await prisma.message.findMany({
        where:{
          InterviewId: interviewId
        }
    })
    console.log('messages ye rahe /n',messages)
}
