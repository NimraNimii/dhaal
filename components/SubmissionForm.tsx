"use client";

import { useRef, useState } from "react";
import type { AnalyzeRequestBody } from "@/lib/types";

interface Props {
  onSubmit: (body: AnalyzeRequestBody) => void;
  isLoading: boolean;
}

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

export default function SubmissionForm({ onSubmit, isLoading }: Props) {
  const [text, setText] = useState("");
  const [image, setImage] = useState<{ file: File; previewUrl: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("That file type isn't supported — try a PNG, JPG, or WEBP screenshot.");
      return;
    }
    setError(null);
    setImage({ file, previewUrl: URL.createObjectURL(file) });
  }

  function clearImage() {
    if (image) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!text.trim() && !image) {
      setError("Paste the message or add a screenshot first.");
      return;
    }

    if (image) {
      try {
        const imageBase64 = await fileToBase64(image.file);
        onSubmit({
          text: text.trim() || undefined,
          imageBase64,
          imageMediaType: image.file.type as AnalyzeRequestBody["imageMediaType"],
        });
      } catch {
        setError("Couldn't read that image — try a different file.");
      }
    } else {
      onSubmit({ text: text.trim() });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="chit p-6 sm:p-8">
      <label htmlFor="submission" className="block text-sm text-graphite mb-2">
        Paste the message, email, or forward — koi bhi cheez jo ajeeb lagi ho.
      </label>
      <textarea
        id="submission"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder="e.g. 'Dear customer, your account will be suspended in 24 hours unless you verify at this link...'"
        className="w-full resize-none bg-paper border border-line rounded-sm p-3 text-ink placeholder:text-graphite/60 focus:border-shield outline-none"
      />

      <div className="mt-4 flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
          id="file-upload"
        />
        {!image ? (
          <label
            htmlFor="file-upload"
            className="cursor-pointer text-sm text-shield underline decoration-shield/40 underline-offset-4 hover:decoration-shield"
          >
            or add a screenshot instead
          </label>
        ) : (
          <div className="flex items-center gap-2 text-sm">
          {/* Local blob preview; next/image is unnecessary here. */}
{/* eslint-disable-next-line @next/next/no-img-element */}
<img
  src={image.previewUrl}
  alt="Screenshot to analyze"
  className="h-10 w-10 object-cover rounded-sm border border-line"
/>
            <span className="text-graphite">{image.file.name}</span>
            <button
              type="button"
              onClick={clearImage}
              className="text-clay underline underline-offset-4"
            >
              remove
            </button>
          </div>
        )}
      </div>

      {error && <p className="mt-3 text-sm text-clay">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-6 w-full sm:w-auto bg-shield hover:bg-shield-dark disabled:opacity-60 text-paper font-body font-medium px-6 py-3 rounded-sm transition-colors"
      >
        {isLoading ? "Dekh rahe hain…" : "Check this for me"}
      </button>
    </form>
  );
}
