import SidebarService from "./services/sidebarService";
import { CommentController } from "./controllers/commentController";
//import { SyncToFeishu } from "./controllers/syncToFeishu";

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
// 初始化同步评论至飞书服务
//const syncToFeishu = new SyncToFeishu();

// 处理获取评论服务相关消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_RUNNING_STATE") {
    commentController.toggleRunningState();
    //syncToFeishu.syncRunningStateToFeishu();
  }
});