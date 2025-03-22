import { useEffect } from "react";

export default function SidePanel() {
  // 使用 useEffect 钩子在组件挂载时设置消息监听器
  useEffect(() => {
    // 定义消息处理函数
    const handleMessage = (message, sender, sendResponse) => {
      // 当收到 "CHECK_SIDEPANEL_LOADED" 消息时，返回 true，表示侧边栏已加载
      if (message.type === "CHECK_SIDEPANEL_LOADED") {
        sendResponse(true);
        return true; // 保持消息通道开启
      }
    };
    
    // 添加消息监听器，监听来自 background.ts 的消息
    chrome.runtime.onMessage.addListener(handleMessage);

    // 组件卸载时，移除监听器，防止重复绑定
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  return (
    <div style={{ padding: "16px" }}>
      <h1>Live AI Sidebar</h1>
      <button onClick={() => alert("Hello from side panel!")}>
        Click Me
      </button>
    </div>
  )
}