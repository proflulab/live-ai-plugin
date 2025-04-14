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

    if (isRunning) {
      // 初始化评论内容
      let old_comments_num = 0; // 旧评论总数

      // 启动定时器 interval
      intervalId = setInterval(async () => {
        // 获取所有标签页
        const tabs = await chrome.tabs.query({});
        
        // 检查是否存在微信视频号直播页面
        const liveTab = tabs.find(tab => 
          tab.url?.includes('channels.weixin.qq.com/platform/live/liveBuild')
        );
        
        if (liveTab && liveTab.id) {
          console.log('成功链接到微信视频号');

          // chrome.scripting.executeScript({
          //   target: { tabId: liveTab.id },
          //   world: "MAIN", // ✅ 主世界
          //   func: () => {
          //     return new Promise((resolve) => {
          //       console.log('【页面】等待 2 秒后获取列表项目数量');
          //       setTimeout(() => {
          //         // 确保元素加载完成
          //         const items = document.querySelectorAll('.vue-recycle-scroller__item-wrapper');
          //         if (items.length > 0) {
          //           console.log('【页面】获取到的数量:', items.length);
          //           resolve(items.length);
          //         } else {
          //           console.log('【页面】未能找到列表项，重试中...');
          //           resolve(0); // 如果没找到元素，返回 0
          //         }
          //       }, 3000); // 增加延迟时间
          //     });
          //   }
          // }, (results) => {
          //   if (chrome.runtime.lastError) {
          //     console.error('执行脚本出错:', chrome.runtime.lastError.message);
          //   } else if (results && results[0]) {
          //     console.log('列表项目数:', results[0].result);
          //   } else {
          //     console.log('未能获取到元素数量');
          //   }
          // });


          // 可以获取内容了

          // chrome.scripting.executeScript({
          //   target: { tabId: liveTab.id },
          //   world: "MAIN",  // 主世界
          //   func: () => {
          //     return new Promise((resolve) => {
          //       console.log('【页面】等待 2 秒后获取列表项目数量');
          //       setTimeout(() => {
          //         // 获取 wujie_iframe 中的 iframe
          //         const iframe = document.querySelector('.wujie_iframe');
          //         if (iframe) {
          //           // 获取 iframe 的 shadowRoot
          //           const shadowRoot = iframe.shadowRoot;
          //           // console.log(shadowRoot) // 显示所有回复内容
              
          //           if (shadowRoot) {
          //             // 确保获取到 #shadow-root 下的 vue-recycle-scroller__item-wrapper 元素
          //             const items = shadowRoot.querySelectorAll('.vue-recycle-scroller__item-wrapper');
          //             console.log(items) // 显示回复内容
          //             console.log('【页面】获取到的数量:', items.length);
          //             resolve(items.length); // 返回找到的数量
          //           } else {
          //             console.log('【页面】未能找到 shadowRoot');
          //             resolve(0);  // 如果没有 shadowRoot，返回 0
          //           }
          //         } else {
          //           console.log('【页面】未找到 iframe');
          //           resolve(0);  // 如果没有找到 iframe，返回 0
          //         }
          //       }, 3000); // 延迟时间，确保页面内容加载完毕
          //     });
          //   }
          // }, (results) => {
          //   if (chrome.runtime.lastError) {
          //     console.error('执行脚本出错:', chrome.runtime.lastError.message);
          //   } else if (results && results[0]) {
          //     console.log('列表项目数:', results[0].result);
          //   } else {
          //     console.log('未能获取到元素数量');
          //   }
          // });



          interface Result {
            changed: boolean;
            totalNum: number;
          }

          chrome.scripting.executeScript({
            target: { tabId: liveTab.id },
            world: "MAIN", // 主世界
            func: (prevCount) => {
              return new Promise((resolve) => {
                console.log('【页面】等待 3 秒后获取 childNodes.length');
                setTimeout(() => {
                  // 获取页面中的 iframe 元素
                  const iframe = document.querySelector('.wujie_iframe');
                  if (!iframe) {
                    console.log('【页面】未找到 iframe');
                    return resolve(0);
                  }
                  
                  // 获取 iframe 的 shadowRoot（vue特色，不能直接获取内容）
                  const shadowRoot = iframe.shadowRoot;
                  if (!shadowRoot) {
                    console.log('【页面】未能找到 shadowRoot');
                    return resolve(0);
                  }
                  
                  // 获取所有的 wrapper 评论元素
                  const wrappers = shadowRoot.querySelectorAll('.vue-recycle-scroller__item-wrapper');
                  if (wrappers.length === 0) {
                    console.log('【页面】未找到任何 wrapper');
                    return resolve(0);
                  }
                  
                  // 获取第一个 wrapper 的 childNodes.length
                  const childCount = wrappers[0].childNodes.length;
                  console.log('【页面】第一个 wrapper 的 childNodes.length:', childCount);
                  // resolve(childCount);

                  // 比较新旧评论数量
                  if (childCount > prevCount) {
                    console.log('【页面】评论数量增加了！');
                    // ✅ 数量变化，返回需要处理
                    resolve({ changed: true, totalNum: childCount });
                  } else {
                    console.log('【页面】评论数量没有变化！');
                    // ❌ 无变化
                    resolve({ changed: false, totalNum: childCount });
                  }


                }, 3000);
              });

            },
            args: [old_comments_num], // ✅ 把 old_comments_num 传进 func 中
            
          }, (results) => {
            if (chrome.runtime.lastError) {
              console.error('执行脚本出错:', chrome.runtime.lastError.message);
            } else if (results && results[0]) {
              // console.log('列表项目数:', results[0].result);
  
              // const result: Result = results[0].result;
              const result = results[0].result as Result;
              const changed = result.changed;
              const comments_num = result.totalNum;

              console.log('评论是否有变动:', changed);
              console.log('当前评论数:', comments_num);

              if (changed){
                old_comments_num += 1; // 更新旧评论总数
              } else {
                console.log('评论数量没有变化');
              }

            } else {
              console.log('未能获取到元素数量');
            }
          });


          
        } else {
          console.log('无法链接到微信视频号');
        }
      }, 5000);
    } else if (intervalId) {
      // 停止定时器
      clearInterval(intervalId);
      intervalId = null;
    }
  }
});