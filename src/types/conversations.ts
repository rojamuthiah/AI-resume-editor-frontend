export type ConversationMessage = 
  | {
      role: "user";
      type: "ask" | "edit";
      text: string;
    }
  | {
      role: "ai";
      type: "ask";
      text: string;
    }
  | {
      role: "ai";
      type: "edit";
      message: {
        messageinfo: string;
        keys: string[];
        keywords?: string[];
        edits: {
          [key: string]: {
            before: string[];      // For display
            after: string[];       // For display
            beforeJson: string | string[] | { [key: string]: any } | { [key: string]: any }[];  // Can be string, array, or object
            afterJson: string | string[] | { [key: string]: any } | { [key: string]: any }[];   // Can be string, array, or object
          };
        };
        acceptedSections?: string[];
      };
      text?: string;
    };