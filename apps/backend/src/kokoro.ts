import { KokoroTTS } from "kokoro-js";
import { prisma } from "./db";

export async function kokoro(interviewId: string) {
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

  // Don't use JSON.stringify here
 const text = latestMessage.message
  .replace(/\\n/g, " ")
  .replace(/\*\*/g, "")
  .replace(/\s+/g, " ")
  .trim();

  const tts = await KokoroTTS.from_pretrained(
    "onnx-community/Kokoro-82M-ONNX",
    {
      dtype: "q8",
    }
  );

  const audio = await tts.generate(text, {
    voice: "af_sky",
  });

  const filename = `${Date.now()}.wav`;
 
  audio.save(`kokoro/${filename}`);
  
  return filename;
}