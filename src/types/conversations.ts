export type ConversationMessage = {
    role: "user" | "ai";
    type: "ask" | "edit";
    text?: string;
    message?: string;
    sections?: any[];
    previewJson?: any;
    collapsed?: boolean;
  };
  