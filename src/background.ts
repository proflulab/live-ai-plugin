// 存储当前打开的窗口ID
let popupId: number | null = null;

// 监听扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  // 如果窗口已存在，则激活该窗口
  if (popupId) {
    chrome.windows.update(popupId, { focused: true });
    return;
  }

  // 创建新的独立窗口
  chrome.windows.create({
    url: chrome.runtime.getURL("tabs/index.html"),
    type: "popup",
    width: 800,
    height: 600
  }, (window) => {
    // 保存新创建的窗口ID
    popupId = window.id;
    
    // 监听窗口关闭事件，清理窗口ID引用
    chrome.windows.onRemoved.addListener((windowId) => {
      if (windowId === popupId) popupId = null;
    });
  });
});