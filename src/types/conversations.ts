export type ConversationMessage = {
    role: "user" | "ai";
    type: "ask" | "edit";
    text?: string;
    message?: {
      messageinfo: string;
      keys: string[];
      keywords?: string[];
      edits: {
        [key: string]: {
          before: string[];
          after: string[];
        };
      };
    };
    sections?: any[];
    previewJson?: any;
    collapsed?: boolean;
  };