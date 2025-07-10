import { useEffect, useState } from "react";

export default function SidePanel() {
  const [isRunning, setIsRunning] = useState(false); // "获取直播评论"的开关状态

  // 这是调用函数，调用它可以发送切换"获取直播评论"程序的状态
  const toggleRunningState = () => {
    const newState = !isRunning; // 计算新的状态

    // 发送消息给后台切换状态-开始获取评论
    chrome.runtime.sendMessage({ type: "TOGGLE_RUNNING_STATE" });
    // 本地缓存状态
    chrome.storage.local.set({ isRunning: newState });
    // 更新本地状态
    setIsRunning(newState);
  };


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

    // 从本地存储读取  获取评论 运行状态
    chrome.storage.local.get(['isRunning'], (result) => {
      if (typeof result.isRunning === 'boolean') {
        setIsRunning(result.isRunning);
      }
    });
    
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
            backgroundColor: isRunning ? "#f44336" : "#4CAF50",
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
          onMouseEnter={(e) => { // 鼠标悬停时
            // e.currentTarget.style.borderRadius = "20px"; // 更圆的角

          }}

          onMouseLeave={(e) => { // 鼠标离开
            // 按钮颜色恢复
            e.currentTarget.style.backgroundColor = isRunning ? "#f44336" : "#4CAF50"; // 回归默认颜色
            e.currentTarget.style.transform = "scale(1.00)"; // 按钮大小恢复
            e.currentTarget.style.borderRadius = "15px"; // 按钮圆角恢复
          }}

          onMouseDown={(e) => { // 鼠标落下
            // 按钮变暗
            e.currentTarget.style.backgroundColor = isRunning ? "#d32f2f" : "#3d8b40";  // 变成对应属性的暗色
            e.currentTarget.style.transform = "scale(0.95)"; // 按钮变小
            e.currentTarget.style.borderRadius = "20px"; // 更圆的角

          }}

          onMouseUp={(e) => { // 鼠标抬起
            // 按钮颜色恢复
            e.currentTarget.style.backgroundColor = isRunning ? "#f44336" : "#4CAF50"; // 回归默认颜色
            // 按钮大小恢复
            e.currentTarget.style.transform = "scale(1.00)";

            // 按钮圆角恢复
            e.currentTarget.style.borderRadius = "15px";

          }}

          // onClick={() => {
          //   console.log("Start button clicked");
          //   // 发送消息给 background.ts 以切换 获取直播间信息 运行状态(开始或者停止)
          //   chrome.runtime.sendMessage({ type: "TOGGLE_RUNNING_STATE" });
          // }}


          

          onClick={toggleRunningState}
        >
          {isRunning ? "STOP" : "START"}
        </button>
      </div>
    </div>
  )
}