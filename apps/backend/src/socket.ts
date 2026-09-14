import fs from "fs/promises"
import { WebSocketServer } from "ws";
import { transcribe } from "./exec.js";
import { prisma } from "./db.js";
import { onLlama } from "./Llama/Llama.js";

export const wss = new WebSocketServer({port:8080})

export const socketHandler = (interviewId:string)=>{
     wss.on("connection",(ws)=>{
        console.log("Client connected for interview:", interviewId);

        ws.on('message',async(data:any)=>{
                console.log("Received audio data for interview:", interviewId);
                   const audioPath = `uploads/audio-${Date.now()}.wav`
                   await fs.writeFile(audioPath,data)
                   // get data in structure format
                   const transcript = await transcribe(audioPath);
                   console.log("Transcript:", transcript)
                   const userReply = await prisma.message.create({
                    data:{
                        type: "User",
                        message: transcript,
                        InterviewId: interviewId
                    }
                   })
                   await onLlama(interviewId)
                   console.log("Llama response generated")

        })
        ws.on('close',()=>{
            console.log("Client disconnected");
        })
    })
}


