import { commentDB } from '../services/commentDB'
import { v4 as uuidv4 } from 'uuid'

interface CommentResult {
    type: string;
    username: string;
    content: string;
  }
  
  interface ScriptResult {
    initialCount?: number;
    commentInfo?: CommentResult[];
    newCurren?: number;
    newTarget?: number;
  }
  
  export class CommentController {
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;
    private currentCommentCount: number = 0; // 时刻更新的总项目数
    private targetCommentCount: number = 0; // 程序推进到的存储的数量
  
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
            console.log('Customer service ：未找到微信视频号直播页面');
            return;
          }
  
          console.log("Customer service ：找到直播页面，继续执行其他操作");
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

                  // 获取最后一个 itemView ，目的是获取真实的总评论数量
                  const lastView = itemViews[itemViews.length - 1];
                  const dataIndex = lastView.firstElementChild?.getAttribute('data-index');
                  //console.log('data-index:', dataIndex);


                  // 首次运行时初始化计数
                  if (current === 0) {
                    console.log('初始化评论项目数');
                    return resolve({ initialCount: Number(dataIndex) }); // 返回初始化计数
                  }
                  
                  current = Number(dataIndex); // 设置最新的评论数量
                  console.log('最新评论项目数:', current);
                  console.log("已存储到的项目数", target)
                  // console.log('当前评论总数:', itemViews.length);
  
                  // 检查是否有新评论
                  if (current === target) {
                    console.log('没有新评论');
                    return resolve(null);
                  }

                  // 遍历所有的 itemViews
                  const commentInfo = Array.from(itemViews).map(view => {
                    // 获取每个视图的 data-index 属性
                    const dataIndex = view.firstElementChild?.getAttribute('data-index');

                    // 检查当前检测的 data-index 是否大于目标值
                    if (dataIndex && Number(dataIndex) > target) {
                      // 返回包含类型、用户名和内容的对象
                      return {
                        type: view.querySelector('.message-type')?.textContent || '',
                        username: view.querySelector('.message-username-desc')?.textContent || '',
                        content: view.querySelector('.message-content')?.textContent || ''
                      };
                    }
                    // 如果不符合条件，返回 null
                    return null;
                  }).filter(comment => comment !== null); // 过滤掉所有 null 值

                  // 检查是否有新评论，如果没有说明有问题
                  if (commentInfo.length === 0) {
                    console.log('返回评论值报错：没有返回值，但程序已经过了开始的检测新评论');
                    return resolve(null);
                  }

                  // 更新保存到的评论数量
                  target += commentInfo.length

                  // 输出获取到的评论信息
                  console.log('获取到的评论信息:', commentInfo);
                  // 解析并返回评论信息和更新后的目标值
                  resolve({ commentInfo, newCurren: current, newTarget: target });

                }, );
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
                const comment = result.commentInfo as CommentResult[];
                console.log("获取到的评论信息:", comment)
  
                // 更新计数器
                this.currentCommentCount = result.newCurren ; // 更新当前评论总数
                this.targetCommentCount = result.newTarget ; // 目标评论总数

                // // 储存评论到数据库
                // commentDB.addComment({
                //   userId: uuidv4(),
                //   userName: comment.username,
                //   userType: comment.type,
                //   timestamp: Date.now(),
                //   commentTime: new Date().toLocaleString(),
                //   content: comment.content,
                //   reply: ''
                // })

                // 将 commentInfo 列表中每一行评论详细信息储存到数据库
                result.commentInfo.forEach(comment => {
                  commentDB.addComment({
                    userId: uuidv4(),
                    userName: comment.username,
                    userType: comment.type,
                    timestamp: Date.now(),
                    commentTime: new Date().toLocaleString(),
                    content: comment.content,
                    reply: ''
                  });
                });

  
              }
            }
          });


          // (async () => {
          //   await new Promise(resolve => setTimeout(resolve, 10000));
          //   console.log("1212121212");
          // })();

          // private canPrint = true; // 标志变量，用于控制打印

          // // 使用标志控制打印
          // if (this.canPrint) {
          //   console.log("SyncToFeishu service is running");
          //   this.canPrint = false;
          //   setTimeout(() => {
          //     this.canPrint = true;
          //   }, 5000);
          // }


  
          console.log("CommentController service is running");
  
        }, 5000);
      } else if (this.intervalId) {
        // 停止定时器
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  }
  