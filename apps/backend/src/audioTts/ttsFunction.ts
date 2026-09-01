import { UniversalEdgeTTS } from "edge-tts-universal";
import { prisma } from "../db";
import { getSocketForInterview } from "../socket.js";

export const ttsFunction = async (interviewId: string) => {
  const latestMessage = await prisma.message.findFirst({
    where: {
      InterviewId: interviewId,
      type: "Assistant",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!latestMessage?.message) {
    throw new Error("No assistant message found");
  }

  const text = latestMessage.message
    .replace(/\\n/g, " ")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const tts = new UniversalEdgeTTS(
    text,
    "en-US-EmmaMultilingualNeural"
  );

  const result = await tts.synthesize();
  
  const filename = `${Date.now()}.mp3`;
  const filepath = `audio/${filename}`;
  
  await Bun.write(filepath, result.audio);

  // Send audio filename via WebSocket to the specific client for this interview
  const socket = getSocketForInterview(interviewId);
  if (socket && socket.readyState === 1) { // WebSocket.OPEN
    socket.send(JSON.stringify({
      type: "audio",
      filename,
      message: latestMessage.message
    }));
  }

  return {
    success: true,
    filename,
    filepath,
  };
};