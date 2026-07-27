"use client";
import Image from "next/image";
type Pose =
  | "reading"
  | "writing"
  | "thinking"
  | "celebrating"
  | "warning"
  | "questioning"
  | "sleeping"
  | "experimenting"
  | "pointing"
  | "welcoming";
interface PickleStickerProps {
  pose: Pose;
  size?: "small" | "medium" | "large";
  message?: string;
  className?: string;
}
const POSE_MAP: Record<Pose, string> = {
  reading: "/stickers/pickle-reading-a-book-v01-01.png",
  writing: "/stickers/pickle-writing-v01-01.png",
  thinking: "/stickers/pickle-thinking-v01-01.png",
  celebrating: "/stickers/pickle-celebrating-v01-01.png",
  warning: "/stickers/pickle-holding-a-warning-sign-v01-01.png",
  questioning: "/stickers/pickle-asking-a-question-v01-01.png",
  sleeping: "/stickers/pickle-sleeping-beside-a-bookmark-v01-01.png",
  experimenting: "/stickers/pickle-performing-an-experiment-v01-01.png",
  pointing: "/stickers/pickle-pointing-v01-01.png",
  welcoming: "/stickers/pickle-welcoming-the-reader-v01-01.png",
};
const SIZE_MAP: Record<"small" | "medium" | "large", number> = {
  small: 64,
  medium: 128,
  large: 256,
};
export default function PickleSticker({
  pose,
  size = "medium",
  message,
  className = "",
}: PickleStickerProps) {
  const src = POSE_MAP[pose];
  const px = SIZE_MAP[size];
  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <Image
        src={src}
        alt={`Chibi pickle sticker - ${pose}`}
        width={px}
        height={px}
        className="drop-shadow-sm"
        unoptimized
      />
      {message && (
        <span className="text-xs text-muted text-center max-w-[120px] leading-tight italic">
          {message}
        </span>
      )}
    </div>
  );
}
