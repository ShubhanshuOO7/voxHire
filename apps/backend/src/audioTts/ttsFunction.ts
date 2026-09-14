import { UniversalEdgeTTS } from "edge-tts-universal";
import { prisma } from "../db";
import { wss } from "../socket.js";

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

  console.log(`Audio generated: ${filename}`);

  // Send audio filename via WebSocket to all connected clients
  wss.clients.forEach((client: any) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      console.log("Sending audio notification to client");
      client.send(JSON.stringify({
        type: "audio",
        filename,
        message: latestMessage.message
      }));
    }
  });

  return {
    success: true,
    filename,
    filepath,
  };
};