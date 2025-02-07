import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

/**
 * Searches through the messages and replaces all PDFs with Markdown.
 * If the message content is an array, it will be converted to a single string after conversion.
 * @param messages Chat messages uploaded to the server.
 * @returns An error if something went wrong, or null if successful.
 */
export default async function replacePDFWithMarkdownInMessages(
  messages: any
): Promise<unknown | null> {
  for (const message of messages) {
    if (Array.isArray(message.content)) {
      // Process each item in the content array.
      for (let i = 0; i < message.content.length; i++) {
        const item = message.content[i];
        if (item && typeof item === "object" && item.type === "pdf_url") {
          try {
            let base64: string = item.pdf_url.url;
            base64 = base64.replace(/^data:application\/pdf;base64,/, "");
            const fileBuffer = decodeBase64(base64);
            const markdown = await fetchMarkdownForPDF(fileBuffer);
            // Replace the PDF item with the converted Markdown text.
            message.content[i] = markdown[0];
          } catch (e) {
            console.error(e);
            return e;
          }
        } else if (
          item &&
          typeof item === "object" &&
          item.type === "text" &&
          typeof item.content === "string"
        ) {
          // Replace text objects with their string content.
          message.content[i] = item.content;
        }
        // If the item is already a string, leave it as is.
      }
      // Join all items into a single string.
      message.content = message.content.join("\n");
    } else if (
      message.content &&
      typeof message.content === "object" &&
      message.content !== null
    ) {
      // Process content if it is a single object.
      if (message.content.type === "pdf_url") {
        try {
          let base64: string = message.content.pdf_url.url;
          base64 = base64.replace(/^data:application\/pdf;base64,/, "");
          const fileBuffer = decodeBase64(base64);
          const markdown = await fetchMarkdownForPDF(fileBuffer);
          // Replace the object with the converted Markdown text.
          message.content = markdown[0];
        } catch (e) {
          console.error(e);
          return e;
        }
      } else if (
        message.content.type === "text" &&
        typeof message.content.content === "string"
      ) {
        // If it's a text object, use its string content.
        message.content = message.content.content;
      }
    }
  }
  return null;
}

async function fetchMarkdownForPDF(pdf: Uint8Array) {
  const res = await fetch("http://localhost:8083/pdf_to_markdown", {
    method: "POST",
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="uploaded.pdf"`,
    },
    body: pdf,
  });
  const data = await res.json();

  if ("content" in data && typeof data.content === "string") {
    return [data.content, null];
  } else {
    return [
      null,
      "Received an invalid response when converting PDF to Markdown",
    ];
  }
}
