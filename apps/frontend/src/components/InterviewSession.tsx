import { useMicVAD } from "@ricky0123/vad-react";
import axios from "axios";
import { Button } from "./ui/button";
import { BACKEND_URL } from "@/lib/config";
import toWav from "audiobuffer-to-wav";
import { useEffect, useRef, useState } from "react";
type VoiceState = "aiResponse" | "userResponse";
const socket = new WebSocket("ws://localhost:8080");
const InterviewSession = ({
  interviewId,
  started,
}: {
  interviewId: string;
  started: boolean;
}) => {
  const [voiceState, setVoicestate] = useState<VoiceState>("aiResponse");
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioPlay = async () => {};
  useEffect(() => {
    socket.onopen = async () => {
    //   try {
    //     const filename = await axios.get(`${BACKEND_URL}/api/v1/user/firstAud`);
    //     const audio = filename.data;
    //     const audioUrl = `${BACKEND_URL}/audio/${audio}`;
    //     if (!audioRef.current) {
    //       console.error("❌ audioRef.current is NULL");
    //       return;
    //     }
    //     if (audioRef.current) {
    //       audioRef.current.src = audioUrl;
    //       audioRef.current.play().catch((err) => {
    //         console.error("Audio playback failed:", err);
    //       });
    //     }
    //   } catch (error) {
    //     console.error("Something is wrong in getting 1st audio");
    //   }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);
        if (data.type === "audio") {
          console.log("Received audio file:", data.filename);
          // Play the audio file
          const audioUrl = `${BACKEND_URL}/audio/${data.filename}`;
          console.log("Audio URL:", audioUrl);
          if (!audioRef.current) {
            console.error("audioRef.current is NULL");
            return;
          }
          if (audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch((err) => {
              console.error("Audio playback failed:", err);
            });
          }
        }
      } catch (e) {
        console.log("Received non-JSON message:", event.data);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, []);

  const vad = useMicVAD({
    onnxWASMBasePath:
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    baseAssetPath:
      "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
    onSpeechStart: async () => {
      if (voiceState == "aiResponse") {
        return;
      }

      //    const stream = await navigator.mediaDevices.getUserMedia({
      //         audio: true
      //     });

      //     const mediaRecorder = new MediaRecorder(stream);

      //     mediaRecorder.ondataavailable = (event)=>{
      //         chunks.current.push(event.data)
      //     }
      console.log("Recording started");
      console.log(vad);
    },
    onSpeechEnd: async (audio) => {
      const formData = new FormData();
      const audioContext = new AudioContext();
      const sample = new Float32Array(audio);
      const audioBuffer = audioContext.createBuffer(1, audio.length, 16000);
      audioBuffer.copyToChannel(sample, 0);
      const wavArrayBuffer = toWav(audioBuffer);
      const arrayBuffer = audio.slice().buffer;
      const wavBlob = new Blob([wavArrayBuffer], {
        type: "audio/wav",
      });
      socket.send(wavBlob);
      console.log("📤 Sent audio to backend");
      setVoicestate("aiResponse");
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
    },
  });
  return (
    // try to put these vad.start after socker connection and try to put these socket render on clicking start
    <div>
      <audio
        ref={audioRef}
        onPlay={() => {
          setVoicestate("aiResponse");
          vad.pause();
        }}
        onEnded={() => {
          console.log("🤖 AI finished speaking");
          console.log("🎤 Starting VAD");
          vad.start();
        }}
      />
      <Button onClick={vad.pause}>Stop</Button>
      {!started && <Button>Start Interview</Button>}
    </div>
  );
};

export default InterviewSession;
