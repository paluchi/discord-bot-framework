import { ChatApp } from "../../framework/ChatApp";

let chatApp: ChatApp;

export const getChatApp = async () => {
  if (chatApp) return chatApp;

  chatApp = new ChatApp();
  await chatApp.init();
  return chatApp;
};
