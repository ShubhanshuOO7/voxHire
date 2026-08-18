import { useState } from "react";
import { Button } from "./ui/button";
import InterviewSession from "./InterviewSession";
import { useSearchParams } from "react-router-dom";

const Interview = () => {
  const [started, setStarted] = useState(false);

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

  return <InterviewSession interviewId={interviewId} started={started} />;
};

export default Interview;