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