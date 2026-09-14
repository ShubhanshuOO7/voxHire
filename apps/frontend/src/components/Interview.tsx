import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import InterviewSession from "./InterviewSession";
import { useSearchParams } from "react-router-dom";
import { BACKEND_URL } from "@/lib/config";

import axios from "axios";
const Interview = () => {
  const [started, setStarted] = useState(false);  
  const [searchParams] = useSearchParams();
  const audioRef = useRef<HTMLAudioElement>(null);
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
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <audio ref={audioRef}/>
        <Button onClick={() => setStarted(true)}
        >
          Start
        </Button>
      </div>
    );
  }

  return (
    <div>
      <InterviewSession interviewId={interviewId} started={started}/>
    </div>
  );
};

export default Interview;