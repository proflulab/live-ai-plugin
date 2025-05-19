// // 监听消息以打开侧边栏
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "TOGGLE_SIDEPANEL") {
//     chrome.windows.getCurrent((window) => {
//       chrome.sidePanel.open({ windowId: window.id })
//     })
//   }
// })

// // 监听消息以关闭侧边栏
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "TOGGLE_SIDEPANEL") {
//     try {
//       // 禁用侧边栏
//       chrome.sidePanel.setOptions({ enabled: false }, () => {
//         console.log("Side panel disabled");

//         // 在禁用后，稍微延时后重新启用侧边栏
//         setTimeout(() => {
//           chrome.sidePanel.setOptions({ enabled: true }, () => {
//             console.log("Side panel enabled and should now appear");
//           });
//         }, 50); // 延时50毫秒，确保禁用操作完成
//       });
//     } catch (error) {
//       console.error("Error toggling side panel:", error);
//     }
//   }
// });


// // 获取侧边栏状态
// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "TOGGLE_SIDEPANEL") {
//     try {
//       chrome.runtime.sendMessage({ type: "CHECK_SIDEPANEL_LOADED" })
//         .then(response => {
//           if (response === true) {
//             console.log('侧边栏已加载');
//           }
//         })
//         .catch(() => {
//           console.log('侧边栏未加载');
//         });
//     } catch (error) {
//       console.error('侧边栏方法调用失败:', error);
//     }
//   }
// });


// 监听侧边栏状态
export function getSidebarStatus(): Promise<boolean | null> {
  return chrome.runtime.sendMessage({ type: "CHECK_SIDEPANEL_LOADED" })
    .then(response => {
      if (response === true) {
        console.log('侧边栏已加载');
        return true;  // 侧边栏已打开
      } else {
        console.log('侧边栏未加载');
        return false;  // 侧边栏未打开
      }
    })
    .catch((error) => {
      console.error('侧边栏方法调用失败:', error);
      return null;  // 发生错误时返回 null
    });
}


// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   if (message.type === "TOGGLE_SIDEPANEL") {
//     let sidebarStatus = await getSidebarStatus(); // **等待获取状态**

//     if (sidebarStatus === true) {
//       try {
//         // 先禁用侧边栏
//         chrome.sidePanel.setOptions({ enabled: false }, () => {
//           console.log("Side panel disabled");

//           // 等待50ms后重新启用
//           setTimeout(() => {
//             chrome.sidePanel.setOptions({ enabled: true }, () => {
//               console.log("Side panel enabled and should now appear");
//             });
//           }, 50);
//         });
//       } catch (error) {
//         console.error("Error toggling side panel:", error);
//       }
//     }

//     if (sidebarStatus === false) {
//       chrome.windows.getCurrent((window) => {
//         chrome.sidePanel.open({ windowId: window.id });
//       });
//     }

//   }
// });



// 打开和关闭侧边栏操作
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  // 如果接收到 content.tsx 的点击事件
  if (message.type === "TOGGLE_SIDEPANEL") {
    // 默认先打开侧边栏
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id });
    });

    // 获取侧边栏状态
    let sidebarStatus = await getSidebarStatus(); // **等待获取状态**


    // 如果侧边栏已打开 就关闭它
    if (sidebarStatus === true) {
      try {
        // 先禁用侧边栏
        chrome.sidePanel.setOptions({ enabled: false }, () => {
          console.log("Side panel disabled");

          // 等待50ms后重新启用
          setTimeout(() => {
            chrome.sidePanel.setOptions({ enabled: true }, () => {
              console.log("Side panel enabled and should now appear");
            });
          }, 50);
        });
      } catch (error) {
        console.error("Error toggling side panel:", error);
      }
    }

  }
});




// 默认启用侧边栏
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))




let isRunning = false; // 客服运行状态，初始状态为 false
let intervalId: NodeJS.Timeout | null = null; // 定时器的 ID 初始化

// Handle running state toggle
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_RUNNING_STATE") {
    isRunning = !isRunning;
    console.log(`Customer service running state: ${isRunning}`);

    let currentCommentCount = 0;  // 当前评论总数
    let targetCommentCount = 0;   // 目标评论数（用于比较）

    if (isRunning) {
      // 启动定时器 interval
      intervalId = setInterval(async() => {

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


        // 定义返回数据接口
        interface CommentResult {
          type: string;
          username: string;
          content: string;
        }

        // 添加新的返回值接口
        interface ScriptResult {
          initialCount?: number;
          commentInfo?: CommentResult;
          newCount?: number;
        }

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
                  return resolve({initialCount: itemViews.length}); // 返回初始化计数
                }

                current = itemViews.length // 设置最新的评论数量
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
                resolve({commentInfo, newCount: current});
              }, 2000);
            });
          },
          args: [currentCommentCount, targetCommentCount],  // 传入计数器变量
        }, (results) => {
          if (chrome.runtime.lastError) {
            console.error('执行脚本出错:', chrome.runtime.lastError.message);
          } else if (results && results[0] && results[0].result) {
            // const comment = results[0].result as CommentResult;  // 添加类型断言
            const result = results[0].result as ScriptResult;  // 使用新的类型断言

            // 处理首次运行
            if (result.initialCount) {
              // 首次执行程序，初始化评论总数为当前评论总数，防止获取的评论是开始抓取之前的
              currentCommentCount = result.initialCount;
              targetCommentCount = result.initialCount ;
              return;
            }
            
            // 处理新评论
            if (result.commentInfo) {
              const comment = result.commentInfo as CommentResult;
              console.log('评论类型:', comment.type);
              console.log('用户名:', comment.username);
              console.log('评论内容:', comment.content);
              
              // 更新计数器
              currentCommentCount = result.newCount || 0; // 更新当前评论总数
              targetCommentCount += 1; // 目标评论总数 +1
            }
          }
        });

        console.log("it is running");
        
      }, 5000);
    } else if (intervalId) {
      // 停止定时器
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});