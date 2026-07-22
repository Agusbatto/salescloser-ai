export interface ClientChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
