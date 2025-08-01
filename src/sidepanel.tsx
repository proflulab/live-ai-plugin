import { useEffect, useState, useRef } from "react";
import { commentDB } from "./services/commentDB"
import type { Comment } from "./services/commentDB"

export default function SidePanel() {
  const [isRunning, setIsRunning] = useState(false); // "获取直播评论"的开关状态
  const [headlineText, setHeadlineText] = useState("从这里，听见观众的声音"); // 侧边栏标语，初始化标语显示中文
  const [blurred, setBlurred] = useState(false); // 控制 侧边栏标语 模糊状态

  const [logs, setLogs] = useState<string[]>([]); // 日志列表状态
  const logContainerRef = useRef<HTMLDivElement>(null); // 日志面板 DOM 引用，用于自动滚动

  // "直播间评论"列表和评论容器引用
  const [comments, setComments] = useState<Comment[]>([]); // 存储从IndexedDB读取的评论
  const commentContainerRef = useRef<HTMLDivElement>(null); // 评论显示区域引用，用于滚动

  // 添加日志函数
  const addLog = (text: string) => {
    const time = new Date().toLocaleTimeString(); // 获取当前时间（只显示时分秒，例如 "14:23:10"）
    const newLogs = `[${time}] ${text}`; // 时间 + 日志内容
    // 用函数式 setLogs，确保并发状态下不会丢日志
    setLogs((prevLogs) => {
      const updatedLogs = [...prevLogs.slice(-99), newLogs]; // 保留最多100条
      chrome.storage.local.set({ sidepanelLogs: updatedLogs }); // 同步写入本地 storage
      return updatedLogs; // 最后返回最新的日志列表，用于更新状态
    });
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


  // 定时从数据库获取评论，并更新状态
  useEffect(() => {
    // 定义函数：从数据库获取评论
    const fetchComments = async () => {
      try {
        const allComments = await commentDB.getAllComments(); // 获取本地数据库所有评论
        setComments(allComments); // 更新侧边栏评论列表状态
      } catch (error) {
        console.error("读取评论失败", error);
      }
    };

    // 执行函数获取评论
    fetchComments();

    const interval = setInterval(fetchComments, 3000); // 每3秒刷新评论列表

    return () => clearInterval(interval); // 组件卸载时清理定时器
  }, []);

  // "直播间评论"列表更新时自动滚动到底部
  useEffect(() => {
    if (commentContainerRef.current) {
      // 滚动到底部，显示最新的一条评论
      commentContainerRef.current.scrollTop = commentContainerRef.current.scrollHeight;
    }
  }, [comments]);



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

    // 读取本地存储的日志，初始化日志列表状态 - 侧边栏"终端"
    chrome.storage.local.get(['sidepanelLogs'], (result) => {
      if (result.sidepanelLogs && Array.isArray(result.sidepanelLogs)) {
        setLogs(result.sidepanelLogs);
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


      {/* ===== 新增评论显示区 ===== */}
      <h2 style={{ marginTop: "24px" }}>观众评论</h2>
      
      {/* 评论显示区域容器 */}
      <div
        ref={commentContainerRef} // 用于获取DOM元素，方便后续控制滚动
        style={{
          backgroundColor: "#f0f0f0",
          padding: "10px",
          borderRadius: "8px",
          maxHeight: "200px",
          overflowY: "auto",
          fontSize: "13px",
          whiteSpace: "pre-wrap",
          border: "1px solid #ccc",
          boxShadow: "inset 0 0 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* 如果评论列表为空，显示提示文字 */}
        {comments.length === 0 ? (
          <div style={{ opacity: 0.6 }}>暂无评论</div>
        ) : (
          /* 否则遍历 comments 数组，逐条显示每条评论 */
          comments.map((c, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              {/* 评论用户名和用户类型 */}
              <div><strong>{c.userName}</strong>（{c.userType}）</div>

              {/* 评论时间，字体颜色变浅 */}
              <div style={{ color: "#666" }}>{c.commentTime}</div>

              {/* 评论正文内容 */}
              <div>{c.content}</div>

              {/* 如果有回复内容，则显示回复，字体颜色为青色，且上方有一点间距 */}
              {/* && 运算符的含义：如果 c.reply 存在（有值），则执行后面的代码 */}
              {c.reply && (
                <div style={{ color: "#008080", marginTop: "4px" }}>
                  ↪️ 回复：{c.reply}
                </div>
              )}

              {/* 每条评论底部的分割线，颜色浅，边距上下8px */}
              <hr style={{ border: "none", borderTop: "1px solid #ddd", margin: "8px 0" }} />
            </div>
          ))
        )}
      </div>


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
          height: "50vh",     // 高度改为50vh，即视口高度的50%
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