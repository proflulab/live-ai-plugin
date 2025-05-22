interface CommentResult {
    type: string;
    username: string;
    content: string;
  }
  
  interface ScriptResult {
    initialCount?: number;
    commentInfo?: CommentResult;
    newCount?: number;
  }
  
  export class CommentController {
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private currentCommentCount: number = 0;
    private targetCommentCount: number = 0;
  
    public toggleRunningState() {
      this.isRunning = !this.isRunning;
      console.log(`Customer service running state: ${this.isRunning}`);
  
      if (this.isRunning) {
        this.intervalId = setInterval(async () => {
          // 获取所有标签页
          const tabs = await chrome.tabs.query({});
  
          // 检查是否存在微信视频号直播页面
          const liveTab = tabs.find(tab =>
            tab.url?.includes('channels.weixin.qq.com/platform/live/liveBuild')
          );
  
          // 如果没有找到直播页面，返回
          if (!liveTab) {
            console.log('未找到微信视频号直播页面');
            return;
          }
  
          console.log("找到直播页面，继续执行其他操作");
          // 这里可以继续添加其他操作
  
          // 在页面中执行脚本获取评论数量和内容
          chrome.scripting.executeScript({
            target: { tabId: liveTab.id },
            world: "MAIN",
            func: (current, target) => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  // 获取网页iframe
                  const iframe = document.querySelector('.wujie_iframe');
                  if (!iframe) {
                    console.log('未找到 wujie_iframe');
                    return resolve(null);
                  }
  
                  // 获取 shadow-root
                  const shadowRoot = iframe.shadowRoot;
                  if (!shadowRoot) {
                    console.log('未找到 shadow-root');
                    return resolve(null);
                  }
  
                  // 获取评论区，评论总数
                  const wrappers = shadowRoot.querySelectorAll('.vue-recycle-scroller__item-wrapper');
                  // wrappers.length 是它自己的数量，不是子项的数量
                  if (wrappers.length === 0) {
                    console.log('未找到评论容器');
                    return resolve(null);
                  }
  
                  // 获取详细评论信息
                  const itemViews = wrappers[0].querySelectorAll('.vue-recycle-scroller__item-view');
                  if (itemViews.length === 0) {
                    console.log('未找到评论项');
                    return resolve(null);
                  }
  
                  // 首次运行时初始化计数
                  if (current === 0) {
                    console.log('初始化评论数量');
                    return resolve({ initialCount: itemViews.length }); // 返回初始化计数
                  }
  
                  current = itemViews.length; // 设置最新的评论数量
                  console.log('当前评论数量:', current);
  
                  // 检查是否有新评论
                  if (current === target) {
                    console.log('没有新评论');
                    return resolve(null);
                  }
  
                  // 获取最新的一条评论
                  const targetComment = itemViews[target];
  
                  // 获取评论详细信息
                  const commentInfo: CommentResult = {
                    type: targetComment.querySelector('.message-type')?.textContent || '',
                    username: targetComment.querySelector('.message-username-desc')?.textContent || '',
                    content: targetComment.querySelector('.message-content')?.textContent || ''
                  };
  
                  console.log('获取到的评论信息:', commentInfo);
                  resolve({ commentInfo, newCount: current });
                }, 2000);
              });
            },
            args: [this.currentCommentCount, this.targetCommentCount],  // 传入计数器变量
          }, (results) => {
            if (chrome.runtime.lastError) {
              console.error('执行脚本出错:', chrome.runtime.lastError.message);
            } else if (results && results[0] && results[0].result) {
              const result = results[0].result as ScriptResult;  // 使用新的类型断言
  
              // 处理首次运行
              if (result.initialCount) {
                // 首次执行程序，初始化评论总数为当前评论总数，防止获取的评论是开始抓取之前的
                this.currentCommentCount = result.initialCount;
                this.targetCommentCount = result.initialCount;
                return;
              }
  
              // 处理新评论
              if (result.commentInfo) {
                const comment = result.commentInfo as CommentResult;
                console.log('评论类型:', comment.type);
                console.log('用户名:', comment.username);
                console.log('评论内容:', comment.content);
  
                // 更新计数器
                this.currentCommentCount = result.newCount || 0; // 更新当前评论总数
                this.targetCommentCount += 1; // 目标评论总数 +1
              }
            }
          });
  
          console.log("it is running");
  
        }, 5000);
      } else if (this.intervalId) {
        // 停止定时器
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
  