import { useMicVAD } from "@ricky0123/vad-react";
import axios from "axios";
import { Button } from "./ui/button";
import { BACKEND_URL } from "@/lib/config";
import toWav from "audiobuffer-to-wav";
import { useEffect, useRef, useState } from "react";
type VoiceState = "aiResponse" | "userResponse";

const InterviewSession = ({ interviewId }: { interviewId: string }) => {
  const [voiceState, setVoicestate] = useState<VoiceState>("aiResponse");
  const audioRef = useRef<HTMLAudioElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const collectedAudio = useRef<Blob[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startInterview = () => {
    socketRef.current = new WebSocket("ws://localhost:8080");
    console.log("socket connected");
    socketRef.current.onopen = async () => {
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
    // socketRef.current.onmessage = (event) => {
    //   try {
    //     const data = JSON.parse(event.data);
    //     console.log("WebSocket message received:", data);
    //     const utterance = new SpeechSynthesisUtterance(data.message);
    //      speechSynthesis.speak(utterance);
    //     utterance.onend = async () => {
    //       console.log("AI finished speaking");
    //       try {
    //         await vad.start();
    //         console.log("VAD started");
    //       } catch (error) {
    //         console.error("VAD failed to start:", error);
    //       }
    //     };

    //     // if (data.type === "audio") {
    //     //   console.log("Received audio file:", data.filename);
    //     //   // Play the audio file
    //     //   const audioUrl = `${BACKEND_URL}/audio/${data.filename}`;
    //     //   console.log("Audio URL:", audioUrl);
    //     //   if (!audioRef.current) {
    //     //     console.error("audioRef.current is NULL");
    //     //     return;
    //     //   }
    //     //   if (audioRef.current) {
    //     //     audioRef.current.src = audioUrl;
    //     //     audioRef.current.play().catch((err) => {
    //     //       console.error("Audio playback failed:", err);
    //     //     });
    //     //   }
    //     // }
    //   } catch (e) {
    //     console.log("Received non-JSON message:", event.data);
    //   }
    // };
    socketRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        vad.pause();
        setVoicestate("aiResponse");

        const utterance = new SpeechSynthesisUtterance(data.message);
        utteranceRef.current = utterance;

        utterance.onend = async () => {
          setVoicestate("userResponse");
          try {
            await vad.start();
          } catch (error) {
            console.error("VAD failed to start:", error);
          }
        };
        utterance.onerror = (e) => console.error("TTS error:", e);

        window.speechSynthesis.cancel(); // clear anything stuck in the queue
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.log("Received non-JSON message:", event.data);
      }
    };
    return () => {
      socketRef.current = null;
    };
  };

  const vad = useMicVAD({
    onnxWASMBasePath:
      "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/",
    baseAssetPath:
      "https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.27/dist/",
    onSpeechStart: async () => {
      if (silenceTimer.current) {
        clearTimeout(silenceTimer.current);
        silenceTimer.current = null;
      }
      if (voiceState == "aiResponse") return;
      console.log("🗣️ SPEECH DETECTED");
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
      collectedAudio.current.push(wavBlob);

      const finalBlob = new Blob(collectedAudio.current, {
        type: "audio/wav",
      });
      silenceTimer.current = setTimeout(() => {
        socketRef.current?.send(finalBlob);
        collectedAudio.current = [];
        console.log("📤 Sent audio to backend");
      }, 5000);
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
      <div className="grid flex justify-center items-center grid-cols-2">
        <div className="mt-40 ml-20">
          <div className="font-semibold">
            Practice interviews with AI. <br /> Get interview-ready.
          <audio
            ref={audioRef}
            onPlay={() => {
              vad.pause();
              console.log(`Voice state at onplay -> ${voiceState}`);
            }}
            onEnded={async () => {
              console.log("🤖 AI finished speaking");
              console.log("🎤 Starting VAD...");
              try {
                await vad.start();
                console.log("✅ VAD started successfully");
              } catch (error) {
                console.error("❌ VAD start failed:", error);
              }
            }}
          />
          </div>
          <Button onClick={vad.pause}>Stop</Button>
          <Button
            onClick={() => {
              startInterview();
              vad.pause();
              setVoicestate("userResponse");
            }}
          >
            Start Interview
          </Button>
        </div>
        <div>Amma sakuri hoon main.</div>
      </div>
    </div>
  );
};

export default InterviewSession;
