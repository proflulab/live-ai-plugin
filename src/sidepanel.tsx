import { useEffect } from "react";

export default function SidePanel() {
  // 使用 useEffect 钩子在组件挂载时设置消息监听器
  useEffect(() => {
    // 添加 Chrome 扩展消息监听器，用于接收来自 background.ts 的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      // 通过发送信息到侧边栏，检测侧边栏状态
      // 如果是关闭状态，它将会无响应，如果是开启状态，它就会返回true
      if (message.type === "CHECK_SIDEPANEL_LOADED") {
        sendResponse(true); // 只要能收到响应，就说明侧边栏已加载
        return true; // 保持消息通道开启
      }
    });
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