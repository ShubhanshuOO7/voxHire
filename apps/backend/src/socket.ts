import fs from "fs/promises"
import { WebSocketServer } from "ws";
import { transcribe } from "./exec.js";
import { prisma } from "./db.js";
import { onLlama } from "./Llama/Llama.js";


const wss = new WebSocketServer({port:8080})
export const socketHandler = (interviewId:string)=>{
     wss.on("connection",(ws)=>{
        console.log("socket is connected")
        ws.send("Surprise surprise motherfuckers the king is back")
        ws.on('message',async(data:any)=>{
                //    const receivedData = JSON.parse(data)
                //    console.log(receivedData)
                const audioPath = `uploads/audio-${Date.now()}.wav`
                   await fs.writeFile(audioPath,data)
                   const transcript = await transcribe(audioPath);
                   const userReply = await prisma.message.create({
                    data:{
                        type: "User",
                        message: transcript,
                        InterviewId: interviewId
                    }
                   })
                   await onLlama(interviewId)
                   console.log(transcript)
                           
        })
        ws.on('close',()=>{
            console.log("Client disconnected")
        })
        // ws.send({
        //     file: 
        // })
    })
}

