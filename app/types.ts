// app/types.ts
export interface Message {
    role: "user" | "assistant";
    content: string;
    id?: string; // Optional untuk unique identifier
  }