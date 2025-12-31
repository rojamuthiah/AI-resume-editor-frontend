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


export interface ChatPanelProps {
  conversation: ConversationMessage[];
  setConversation: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;

  resumeJson: any;
  setResumeJson: React.Dispatch<React.SetStateAction<any>>;
  setPreviewJson: React.Dispatch<React.SetStateAction<any | null>>;

  conversationId: string | null;
  conversationList: { id: string; title: string }[];

  onSelectConversation: (id: string | null) => void;
  onConversationCreated: (meta: { id: string; title: string }) => void;
  onVersionBump: () => void;

  resumeId: string;
}
