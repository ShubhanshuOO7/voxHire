import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import InterviewSession from "./InterviewSession";
import { useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "@/lib/config";
const socket  = new WebSocket("ws://localhost:8080")
const Interview = () => {
  const [started, setStarted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

useEffect(() => {                
        socket.onopen = ()=>{
            console.log("Socket is connected")
        }
  
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(data);
                if (data.type === 'audio') {
                    console.log('Received audio file:', data.filename);
                    // Play the audio file
                    const audioUrl = `${BACKEND_URL}/audio/${data.filename}`;
                    if (audioRef.current) {
                        audioRef.current.src = audioUrl;
                        audioRef.current.play().catch(err => {
                            console.error('Audio playback failed:', err);
                        });
                    }
                }
            } catch (e) {
                console.log('Received non-JSON message:', event.data);
            }
        }

        return () => {
            socket.onmessage = null;
        }
    }, []);
  
  const [searchParams] = useSearchParams();

  const interviewId = searchParams.get("id");

  if (!interviewId) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <p>Invalid interview ID</p>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Button onClick={() => setStarted(true)}>
          Start Interview
        </Button>
      </div>
    );
  }

  return <InterviewSession interviewId={interviewId} started={started} socket={socket}/>;
};

export default Interview;