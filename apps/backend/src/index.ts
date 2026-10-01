
import express from "express"
import axios from "axios";
import { preInterviewBody } from "./types.js";
import cors from "cors"
import {singleUpload } from "./multer.js";
import path from "path";
import {extractText,getDocumentProxy} from "unpdf"
import { socketHandler } from "./socket.js";
import {prisma} from "./db.js"
import {preLlama} from "./Llama/Llama.js"
import { ttsFunction } from "./audioTts/ttsFunction.js";
import { any, string } from "zod";

const app = express();
app.use(cors())
app.use(express.json());

app.use("/audio",express.static(path.join(__dirname,"../audio")))
app.post("/api/v1/user/pre-interview",singleUpload,async(req,res)=>{
    try {
        // console.log(req.body)
        const {success,data} = preInterviewBody.safeParse(req.body)
        const file = req.file;
        let result = null
        if(file){
            //   const data = new Uint8Array(file.buffer)
            //   const parser = new PDFParse(data)
            const pdf = await getDocumentProxy(new Uint8Array(file.buffer))
            result = await extractText(pdf)
        }
        //  console.log(success)
        //  console.log(data)
        if(!success){
            res.status(411).json({
                message: "Incorrect body"
            })
            return
        }
        const interview = await prisma.interview.create({
            data:{
                Status: "InProgress",
                githubUrl: data.githubUrl
            }
        })
        console.log(interview)
        const github = data.githubUrl.endsWith('/') ? data.githubUrl.slice(0,-1) : data.githubUrl;
        const githubUsername = github.split("/").pop();
        
        const userRepos = await axios.get(`https://api.github.com/users/${githubUsername}/repos`)
        const filteredRepos = userRepos.data.map((x:any)=>({
            description : x.description,
            name: x.name,
            fullName: x.fullName,
            starCount: x.starCount
            
        }))
        console.log("Before Llama");
        
        socketHandler(interview.id,filteredRepos,result)
        
        
        // onLlama(interview.id)
                //    console.log("After Llama")
                //    console.log(response)
                //    console.log(transcript)
                //    console.log(userReply)
                return res.status(200).json({
                    interviewId: interview.id,
                    
                })
                // TODO url can be very malformed use a SLM here
                
                //    const conversation = await prisma.message.create({
                    //       data:{
                        //         message: response.content,
                        //         type: "Assistant",
                        //         InterviewId: interview.id
                        //       }
                        //    })
                    } catch (error) {
                        console.error("pre-interview route failed:", error)   
                        return res.status(500).json({ message: "Something went wrong", error: error })
                    }
                    
                })
                
                // app.post('/api/v1/user/')
                
                // app.post("/api/v1/user/blob",blobUpload,async(req,res)=>{
                    //     try {
                        //         if (!req.file) {
                            //         return res.status(400).json({
                                //             success: false,
                                //             message: "No audio file uploaded",
                                //         });
                                //         }
                                
                                //         //   console.log(type); 
                                //         const transcript = await transcribe(req.file.path);
                                //         console.log(transcript)
                                //          return res.status(200).json({
                                    //             success: true,
                                    //             transcript,
                                    //     });
                                    
                                    //     } catch (error) {
                                        //         console.log(error)
                                        //          return res.status(500).json({
                                            //       success: false,
//       message: "Transcription failed",
//     });
//     }
// })

app.listen(3001,()=>{
    console.log(process.env.DATABASE_URL)
    console.log('App is running on port 3001')
})