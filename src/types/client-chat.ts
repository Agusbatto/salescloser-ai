export interface ClientChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  imageDataUrl?: string | null;
  createdAt: string;
}
