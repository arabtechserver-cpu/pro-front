import { Bot, Flame, Power } from "lucide-react";

export default function ToolMark({ tool, className }: { tool: string; className?: string }) {
  const mark = tool === "unlocktool" ? <Power /> : tool === "chimera" ? <Flame /> : tool === "amt" ? <Bot /> : <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 2h9c4 0 6 2 5 5-.3 2-1.3 3-3 4 2 1 3 3 2 5-1 4-3 6-8 6H2L6 2Zm4 4-1 4h4c2 0 3-4 0-4h-3Zm-2 8-1 4h5c2 0 3-4 0-4H8Z" /></svg>;
  const color = tool === "unlocktool" ? "#f4981c" : tool === "chimera" ? "#db9d16" : tool === "amt" ? "#81ac26" : "#d6263a";
  return <span className={className} style={{ color }} aria-hidden="true">{mark}</span>;
}
