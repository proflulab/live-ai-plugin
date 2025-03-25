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
    <div style={{
      padding: "16px", // padding 是内边距
      position: "absolute", // position位置 这里是绝对
      overflowY: "auto", // 上下滑动自动(自动固定，如果额外内容产生才会出现滚动条)
      paddingBottom: "200px", // 除去内容，增加底部空的部分
    }}>
      
      <h1>Live AI Sidebar</h1>

      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>1</h1>
      <h1>2</h1>


      <button onClick={() => alert("Hello from side panel!")}>
        Click Me
      </button>

      {/* 开始按钮 */}
      <div style={{
        position: "fixed",
        bottom: 0,  // 改为零，完全伸展到底部
        left: 0,    // 改为零，完全伸展到左
        right: 0,   // 改为零，完全伸展到右
        display: "flex",
        justifyContent: "center",
        backgroundColor: "white",
        padding: "15px",  // 内边距
        borderTop: "1px solid #eee"  // 添加一个顶部边框
        
      }}>
        <button 
          style={{
            padding: "12px 24px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "15px",
            cursor: "pointer",
            fontSize: "16px",
            width: "100%",

            boxShadow: "0 5px 8px 5px rgba(0, 0, 0, 0.2)",  // 阴影: 水平偏移量,垂直偏移量,模糊半径,扩展半径,颜色
            // transition: "box-shadow 0.3s ease",  // 逐渐显现
            transition: "all 0.3s ease" // 逐渐显现

          }}
          onMouseEnter={(e) => {
            // 鼠标悬停时，增加阴影
            e.currentTarget.style.boxShadow = "0 5px 20px 5px rgba(0, 0, 0, 0.3)"
          }}

          onMouseLeave={(e) => {
            // 鼠标移出时，恢复阴影
            e.currentTarget.style.boxShadow = "0 5px 8px 5px rgba(0, 0, 0, 0.2)"
          }}

          onMouseDown={(e) => {
            // 鼠标落下，按钮变暗
            e.currentTarget.style.backgroundColor = "#3d8b40"  // 变成暗绿色
            e.currentTarget.style.boxShadow = "0 2px 4px 2px rgba(0, 0, 0, 0.2)"  // 更小的阴影
          }}

          onMouseUp={(e) => {
            // 鼠标抬起，按钮颜色恢复
            e.currentTarget.style.backgroundColor = "#4CAF50" // 回归默认的绿色

            // 检测鼠标是否移出了按钮
            if (e.currentTarget.matches(':hover')) {
              e.currentTarget.style.boxShadow = "0 5px 20px 5px rgba(0, 0, 0, 0.3)"
            } else {
              e.currentTarget.style.boxShadow = "0 5px 8px 5px rgba(0, 0, 0, 0.2)"
            }
          }}

          onClick={() => {
            console.log("Start button clicked");
          }}
        >
          START
        </button>
      </div>
    </div>
  )
}