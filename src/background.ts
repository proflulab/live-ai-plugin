import SidebarService from "./services/sidebarService";
import { CommentController } from "./controllers/commentController";

// 初始化侧边栏服务
const sidebarService = new SidebarService();

// 当用户点击侧边栏箭头，处理侧边栏事件
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "TOGGLE_SIDEPANEL") {
    await sidebarService.handleSidebarToggle();
  }
});

// 初始化获取评论服务
const commentController = new CommentController();

// 处理获取评论服务相关消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_RUNNING_STATE") {
    commentController.toggleRunningState();
  }
});






// import { commentDB } from './services/commentDB'


// // 保存 token
// commentDB.saveFeishuToken({
//   token: 'AJDSAKJDAK',
//   expire: 7200,
//   fetchedAt: Date.now() // 毫秒级时间戳
// })

// // 添加一条评论
// commentDB.addComment({
//   userId: "123123123123123",
//   userName: 'Alice',
//   userType: 'VIP',
//   timestamp: Date.now(),
//   commentTime: new Date().toLocaleString(),
//   content: '这个功能真棒！',
//   reply: '谢谢你的反馈！'
// })