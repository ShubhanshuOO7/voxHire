import { prisma } from "../db.js";
import { transcribe } from "../exec.js";
import { ttsFunction } from "../audioTts/ttsFunction.js";
import { error } from "node:console";

export const preLlama = async (
  result: any,
  filteredRepos: any,
  interviewId: string
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
          model: "dots-studio/dots-3-note-preview:free",
           // model: "apodex/apodex-1.1-mini:free",
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
      throw new Error(`OpenRouter Error: ${response.statusText}`);
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
    console.log(error)
    if(error instanceof Error)
    console.error(`HTTP status code -> ${error}`)
    console.error("Llama() failed:", error);
    throw error;
  }
};

export const onLlama = async (interviewId: string) => {
  const dbMessages = await prisma.message.findMany({
    where: {
      InterviewId: interviewId,
    },
  });

  const messages = dbMessages.map((msg) => ({
    role: msg.type === "User" ? "user" : "assistant",
    content: msg.message,
  }));

  console.log(
    "Messages being sent to OpenRouter:",
    JSON.stringify(messages, null, 2),
  );

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
          model: "dots-studio/dots-3-note-preview:free",
          messages: messages,
        }),
      },
    );

    console.log("OpenRouter status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();

      console.error("OpenRouter error:", errorText);

      throw new Error(
        `OpenRouter Error: ${response.status} - ${errorText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content
    if(!content){
      console.log("No response recieved from AI")
      throw new Error("No response recieved from AI")
    }
    const interview = await prisma.interview.findUnique({
      where: {
        id: interviewId,
      },
    });

    if (!interview) {
      throw new Error("Interview not found");
    }

    await prisma.message.create({
      data: {
        type: "Assistant",
        message: data.choices[0].message.content,
        InterviewId: interview.id,
      },
    });
    
    await ttsFunction(interviewId);

    console.log("AI Response:", data.choices[0].message);

    return data.choices[0].message;
  } catch (error) {
    console.error("Llama() failed:", error);
    throw error;
  }
};
