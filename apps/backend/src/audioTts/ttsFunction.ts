import { UniversalEdgeTTS } from "edge-tts-universal";
import { prisma } from "../db";

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
  const filepath = `kokoro/${filename}`;

  await Bun.write(filepath, result.audio);

  return {
    success: true,
    filename,
    filepath,
  };
};