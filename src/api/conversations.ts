import api from "./api";

/** Dropdown – titles only */
export const getConversationTitles = async (templateKey: string) => {
  const res = await api.get(
    `/convo/${templateKey}/conversations`
  );
  return res.data.conversations;
};

/** Auto-open on first load */
export const getLatestConversation = async (templateKey: string) => {
  const res = await api.get(
    `/convo/${templateKey}/conversations/latest`
  );
  return res.data.conversation;
};

/** Full conversation by click */
export const getConversationById = async (
  templateKey: string,
  conversationId: string
) => {
  const res = await api.get(
    `/convo/${templateKey}/conversations/${conversationId}`
  );
  return res.data.conversation;
};
