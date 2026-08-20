import { prisma } from "../db.js";
import { transcribe } from "../exec.js";
import { ttsFunction } from "../audioTts/ttsFunction.js";

export const preLlama = async (
  result: any,
  filteredRepos: any,
  interviewId: string,
) => {
  console.log("Entered Llama");
  const InitialMessage = `You are an experienced technical interviewer.
  
                Candidate Profile
                =================
  
                Resume
                ${JSON.stringify(result, null, 2)}
  
                GitHub
                ${JSON.stringify(filteredRepos, null, 2)}
  
                Instructions:
                - Ask only one question.
                - Base the question on the resume or GitHub.
                - Start with an easy question.
                - Wait for the user's answer.
                `;

  const message = await prisma.message.create({
    data: {
      type: "User",
      message: InitialMessage,
      InterviewId: interviewId,
    },
  });
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "poolside/laguna-s-2.1:free",
          messages: [
            {
              role: "user",
              content: InitialMessage,
            },
          ],
        }),
      },
    );
    console.log("OpenRouter status", response.status);
    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.status}`);
    }
    const data = await response.json();
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });
    if (!interview) {
      throw new Error("Interview not found");
    }
    const message = await prisma.message.create({
      data: {
        type: "Assistant",
        message: data.choices[0].message.content,
        InterviewId: interview.id,
      },
    });
    await ttsFunction(interviewId);
    console.log(data.choices[0].message);
    //  const audioPath = `uploads/audio-${Date.now()}.wav`
    //    const transcript = await transcribe(audioPath);
    //  console.log(transcript)
    return data.choices[0].message;
  } catch (error) {
    console.error("Llama() failed:", error);
    throw error;
  }
};

export const onLlama = async (interviewId: string) => {
  const messages = await prisma.message.findMany({
    where: {
      InterviewId: interviewId,
    },
  });
   try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "poolside/laguna-s-2.1:free",
          messages: [
            {
              role: "user",
              content: messages,
            },
          ],
        }),
      },
    );
    console.log("OpenRouter status", response.status);
    if (!response.ok) {
      throw new Error(`OpenRouter Error: ${response.status}`);
    }
    const data = await response.json();
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });
    if (!interview) {
      throw new Error("Interview not found");
    }
    const message = await prisma.message.create({
      data: {
        type: "Assistant",
        message: data.choices[0].message.content,
        InterviewId: interview.id,
      },
    });
    await ttsFunction(interviewId);
    console.log(data.choices[0].message);
    //  const audioPath = `uploads/audio-${Date.now()}.wav`
    //    const transcript = await transcribe(audioPath);
    //  console.log(transcript)
    return data.choices[0].message;
  } catch (error) {
    console.error("Llama() failed:", error);
    throw error;
  }
  console.log("messages ye rahe /n", messages);
};
