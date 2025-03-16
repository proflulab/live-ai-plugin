// 监听消息以打开侧边栏
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "OPEN_SIDEPANEL") {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id })
    })
  }
})

// 默认启用侧边栏
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))