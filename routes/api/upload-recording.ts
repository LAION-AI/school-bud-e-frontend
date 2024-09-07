import { Handlers } from "$fresh/server.ts";
// import { ensureDir } from "https://deno.land/std/fs/mod.ts";
import Groq from 'npm:groq-sdk';

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY') || ""
const GROQ_API_MODEL = Deno.env.get('GROQ_API_MODEL') || ""

const groq = new Groq({
    apiKey: GROQ_API_KEY, // This is the default and can be omitted
  });

export const handler: Handlers = {
  async POST(req) {
    try {
      const formData = await req.formData();
      const audioFile = formData.get("audio") as File;

      if (!audioFile) {
        return new Response("No audio file uploaded", { status: 400 });
      }

      // Create an instance of the Transcriptions API
    //   const transcriptions = new Transcriptions({ apiKey: GROQ_API_KEY });

      // Prepare the transcription parameters
      const params: Groq.Audio.TranscriptionCreateParams = {
        file: audioFile,
        model: GROQ_API_MODEL,
        response_format: "json",
      };

      // Transcribe the audio file
      const transcription = await groq.audio.transcriptions.create(params);

      console.log(transcription);

      return new Response(transcription.text, {
        status: 200,
        headers: { "Content-Type": "application/text" },
      });
    } catch (error) {
      console.error("Error transcribing audio file:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

// export const handler: Handlers = {
//   async POST(req) {
//     try {
//       const formData = await req.formData();
//       const audioFile = formData.get("audio") as File;

//       if (!audioFile) {
//         return new Response("No audio file uploaded", { status: 400 });
//       }

//       // Ensure the upload directory exists
//       const uploadDir = "./uploads";
//       await ensureDir(uploadDir);

//       // Save the audio file
//       const filePath = `${uploadDir}/${audioFile.name}`;
//       const fileData = await audioFile.arrayBuffer();
//       await Deno.writeFile(filePath, new Uint8Array(fileData));

//       return new Response("Audio file uploaded successfully", { status: 200 });
//     } catch (error) {
//       console.error("Error uploading audio file:", error);
//       return new Response("Internal Server Error", { status: 500 });
//     }
//   },
// };