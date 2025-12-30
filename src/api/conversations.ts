import api from "./api";

/**
 * Dropdown – titles only
 */
export const getConversationTitles = async (resumeId: string) => {
  const res = await api.get(`/convo/${resumeId}/conversations`);
  return res.data.conversations;
};

/**
 * Auto-open on first load
 */
export const getLatestConversation = async (resumeId: string) => {
  const res = await api.get(`/convo/${resumeId}/conversations/latest`);
  return res.data.conversation;
};

/**
 * Full conversation by click
 */
export const getConversationById = async (
  resumeId: string,
  conversationId: string
) => {
  const res = await api.get(
    `/convo/${resumeId}/conversations/${conversationId}`
  );
  return res.data.conversation;
};
