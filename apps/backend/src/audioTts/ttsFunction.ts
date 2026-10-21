import { UniversalEdgeTTS } from "edge-tts-universal";

import { prisma } from "../db";

import { wss } from "../socket.js";

export const ttsFunction = async (interviewId: string) => {
  console.log("Before message");

  const latestMessage = await prisma.message.findFirst({
    where: {
      InterviewId: interviewId,
      type: "Assistant",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  console.log(`latest message ${latestMessage}`);

  if (!latestMessage?.message) {
    throw new Error("No assistant message found");
  }

  const text = latestMessage.message
  .replace(/\\n/g, " ")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ")
  .trim();

  wss.clients.forEach((client: any) => {
    console.log("Total clients:", wss.clients.size);
    if (client.readyState === 1) {
      // WebSocket.OPEN
      console.log("Sending audio notification to client");
      client.send(
        JSON.stringify({
          type: "audio",
          message: latestMessage.message,
        }),
      );
    }
  });
  // const tts = new UniversalEdgeTTS(
  //   text,
  //   "en-US-AriaNeural",
  // );
  // console.log("Before synthesize");
  // const result = await tts.synthesize();
  // console.log("after synthesize");
  // console.log(result);
  // const filename = `${Date.now()}.mp3`;
  // const filepath = `audio/${filename}`;
  // await Bun.write(filepath, result.audio);
  // console.log(`Audio generated: ${filename}`);

  // Send audio filename via WebSocket to all connected clients

  return {
    success: true,
    // filename,
    // filepath,
  };
};
