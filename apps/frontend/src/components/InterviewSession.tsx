import { useMicVAD } from '@ricky0123/vad-react'
import axios from 'axios'
import { Button } from './ui/button'
import { BACKEND_URL } from '@/lib/config'
import toWav from "audiobuffer-to-wav"
const socket  = new WebSocket("ws://localhost:8080")

const InterviewSession = ({interviewId,started}:{interviewId:string,started:boolean}) => {
    socket.onopen = ()=>{
        console.log("Socket is connected")
    }
    const vad = useMicVAD({
            onnxWASMBasePath:
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    baseAssetPath:
      "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
            onSpeechStart: async()=>{
                     
                //    const stream = await navigator.mediaDevices.getUserMedia({
                //         audio: true
                //     });
                    
                //     const mediaRecorder = new MediaRecorder(stream);
                    
                //     mediaRecorder.ondataavailable = (event)=>{
                //         chunks.current.push(event.data)
                //     }
                console.log("Recording started")
                console.log(vad)
            },
            onSpeechEnd : async(audio)=>{
                const formData = new FormData();
                const audioContext = new AudioContext();
                const sample = new Float32Array(audio)
                const audioBuffer =  audioContext.createBuffer(1,audio.length,16000)
                audioBuffer.copyToChannel(sample,0)
                const wavArrayBuffer = toWav(audioBuffer)
                const arrayBuffer = audio.slice().buffer
               const wavBlob = new Blob([wavArrayBuffer], {
                    type: "audio/wav",
                });
                socket.send(wavBlob)
                // console.log(wavBlob)
                // formData.append("blob",wavBlob)
                // const res = await axios.post(`${BACKEND_URL}/api/v1/user/blob`,formData,{
                //     headers:{
                //   "Content-Type" : "multipart/form-data"
                //      }
                // })
                // if(res.status){
                //     console.log(res.data.message);
                // }

                // const audioBlob = new Blob(chunks.current,{
                //     type: "audio/webm",
                // })
                // const formData = new FormData();
                // formData.append("blob",audioBlob)
                // const data = await axios.post(`${BACKEND_URL}/api/v1/user/blob`,{formData},{
                //     headers:{
                //         "Content-Type": "multipart/form-Data"
                //     }
                // })
                // chunks.current = []
            }
        })
  return (
    <div>
        <Button onClick={vad.pause} >Stop</Button>
        {!started && <Button onClick={vad.start}>Start Interview</Button>}
    </div>
  )
}

export default InterviewSession