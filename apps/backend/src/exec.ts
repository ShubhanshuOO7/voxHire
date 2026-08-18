import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";

const execFileAsync = promisify(execFile);

export async function transcribe(audioPath: string) {
  
  // const wav = toWav(audioBuffer)
  const whisperPath = path.join(
    process.cwd(),
    "bin",
    "whisper-cli.exe"
  );

  const modelPath = path.join(
    process.cwd(),
    "models",
    "ggml-base.en.bin"
  );

  const { stdout } = await execFileAsync(
    whisperPath,
    [
      "-m",
      modelPath,
      "-f",
      audioPath,
      "-nt"
    ]
  );

  return stdout.trim();
}