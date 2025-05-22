
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

const commentController = new CommentController();  // 添加这行,初始化

// 处理获取评论服务相关消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_RUNNING_STATE") {
    commentController.toggleRunningState();
  }
});