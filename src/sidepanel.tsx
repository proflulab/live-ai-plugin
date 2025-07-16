import { useEffect, useState, useRef } from "react";

export default function SidePanel() {
  const [isRunning, setIsRunning] = useState(false); // "获取直播评论"的开关状态
  const [headlineText, setHeadlineText] = useState("从这里，听见观众的声音"); // 侧边栏标语，初始化标语显示中文
  const [blurred, setBlurred] = useState(false); // 控制 侧边栏标语 模糊状态

  const [logs, setLogs] = useState<string[]>([]); // 日志列表状态
  const logContainerRef = useRef<HTMLDivElement>(null); // 日志面板 DOM 引用，用于自动滚动

  // ✅ 新增: 添加日志函数
  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString(); // 获取当前时间（只显示时分秒，例如 "14:23:10"）
    setLogs((prev) => [...prev.slice(-100), `[${time}] ${text}`]); // 保留最近100条
  };

  // 当日志列表 logs 更新时，自动将日志面板滚动到底部
  useEffect(() => {
    // 检查日志容器是否存在
    if (logContainerRef.current) {
      // 将日志容器的滚动条位置设置为内容的总高度
      // 意思是：滚动到底部，显示最新的一条日志
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]); // ✅ 依赖项是 logs：只要日志发生变化，就会触发这个 useEffect


  // 这是调用函数，调用它可以发送切换"获取直播评论"程序的状态
  const toggleRunningState = () => {
    const newState = !isRunning; // 计算新的状态

    // 发送消息给后台切换状态-开始获取评论
    chrome.runtime.sendMessage({ type: "TOGGLE_RUNNING_STATE" });
    // 本地缓存状态
    chrome.storage.local.set({ isRunning: newState });
    // 更新本地状态
    setIsRunning(newState);

    addLog(newState ? "开始获取评论" : "停止获取评论"); // 状态变更写入"终端"日志
  };

  // 侧边栏标语，多语言轮播：中、英、日、韩
  useEffect(() => {
    const messages = [
      "从这里，听见观众的声音",                // 中文
      "Hear the audience from here",            // English
      "ここから、視聴者の声が聞こえる",         // 日本語
      "여기서, 시청자의 목소리를 들어보세요",     // 한국어
    ];
    let index = 0; // 初始化了索引为0，不是初始显示
    const interval = setInterval(() => {
      // 先触发模糊渐隐动画
      setBlurred(true);

      // 等800ms动画结束后，再进行文字切换
      setTimeout(() => {
        // 1 % 4 = 1 （因为 1 ÷ 4 商 0 余 1）
        // 2 % 4 = 2 （2 ÷ 4 商 0 余 2）
        // 3 % 4 = 3 （3 ÷ 4 商 0 余 3）
        // 4 % 4 = 0 （4 ÷ 4 商 1 余 0）开始新的循环了
        // 5 % 4 = 1 （5 ÷ 4 商 1 余 1）
        // 6 % 4 = 2 （6 ÷ 4 商 1 余 2）
        index = (index + 1) % messages.length;
        setHeadlineText(messages[index]); // 切换标题
        setBlurred(false); // 设置为非模糊状态
      }, 800);
    }, 5000);

    return () => clearInterval(interval); // 组件卸载时，清理它
  }, []);


  // 使用 useEffect 钩子在组件挂载时设置消息监听器
  useEffect(() => {
    // 定义消息处理函数
    const handleMessage = (message, sender, sendResponse) => {
      // 当收到 "CHECK_SIDEPANEL_LOADED" 消息时，返回 true，表示侧边栏已加载
      if (message.type === "CHECK_SIDEPANEL_LOADED") {
        sendResponse(true);
        return true; // 保持消息通道开启
      }

      // 接收 background 发来的日志，并打印到侧边栏"终端"
      if (message.type === "LOG" && message.text) {
        addLog(message.text);
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
      
      {/* <h1>从这里，听见观众的声音</h1> */}

      {/* 加入模糊和渐隐动画样式 */}
      <h1
        id="headline"
        style={{
          transition: "opacity 0.8s ease, filter 0.8s ease", // 效果持续0.8秒
          opacity: blurred ? 0 : 1, // 透明度，0是完全透明，1是完全可见
          filter: blurred ? "blur(4px)" : "blur(0)" // 模糊程度，4px是模糊，0是清晰
        }}
      >
        {headlineText}
      </h1>


      {/* ✅ 新增: 浅灰色日志终端区域 */}
      <div
        ref={logContainerRef}
        style={{
          marginTop: "24px",
          backgroundColor: "#f5f5f5",         // ✅ 背景改为浅灰色
          color: "#333",                      // ✅ 字体颜色改为深灰
          fontFamily: "monospace",
          fontSize: "13px",
          padding: "10px",
          borderRadius: "8px",
          height: "200px",
          overflowY: "auto",
          whiteSpace: "pre-wrap",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.1)", // ✅ 更柔和的内阴影
          border: "1px solid #ccc",           // ✅ 边框改为浅灰色
        }}
      >
        {logs.length === 0 ? (
          <div style={{ opacity: 0.5 }}>终端就绪...</div>
        ) : (
          logs.map((line, idx) => <div key={idx}>{line}</div>)
        )}
      </div>





      {/* <button onClick={() => alert("Hello from side panel!")}>
        Click Me
      </button> */}

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


// 调用方式：添加一条信息至侧边栏"终端"
// chrome.runtime.sendMessage({
//   type: "LOG",             // 类型是 LOG，对应 SidePanel 中 handleMessage 的判断
//   text: "正在获取直播间评论...", // 你想显示在侧边栏终端的文本
// });