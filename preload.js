const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getMarkdownFiles: (directoryPath) =>
    ipcRenderer.invoke("get-markdown-files", directoryPath),
  saveMarkdownFile: (fileName, content) =>
    ipcRenderer.invoke("save-markdown-file", fileName, content),
  removeMarkdownFile: (fileName) =>
    ipcRenderer.invoke("remove-markdown-file", fileName),
  send: (channel, data) => {
    ipcRenderer.send(channel, data);
  },
  receive: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
});
