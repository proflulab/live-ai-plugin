// 导入 Plasmo 配置类型
import { type PlasmoCSConfig } from "plasmo"

// 配置扩展在所有网址上运行
export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// 创建悬浮箭头元素
const arrow = document.createElement("div")
// 设置箭头的样式
arrow.style.cssText = `
  position: fixed;          
  right: 0;      
  top: 50%;        
  transform: translateY(-50%); 
  width: 30px;            
  height: 60px;           
  background-color: white; 
  color: #1a73e8;       
  display: flex;        
  align-items: center;     
  justify-content: center; 
  cursor: pointer;         
  border-radius: 8px 0 0 8px;  
  border: 1px solid #e8e8e8;   
  border-right: none;          
  box-shadow: -3px 0 8px rgba(0,0,0,0.1);  
  z-index: 2147483647;    
  font-size: 20px;        
  transition: all 0.3s ease;  
`
// 设置箭头文本
arrow.textContent = "◀"

// 点击箭头时切换侧边栏
arrow.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: "TOGGLE_SIDEPANEL" });
});

// 鼠标悬停效果
arrow.addEventListener('mouseover', () => {
  arrow.style.width = '45px'               // 增加宽度
  arrow.style.color = '#1557b0'           // 加深颜色
  arrow.style.boxShadow = '-4px 0 12px rgba(0, 0, 0, 0.15)'  // 增强阴影
})

// 鼠标移出效果
arrow.addEventListener('mouseout', () => {
  arrow.style.width = '30px'               // 恢复宽度
  arrow.style.color = '#1a73e8'           // 恢复颜色
  arrow.style.boxShadow = '-3px 0 8px rgba(0, 0, 0, 0.1)'   // 恢复阴影
})

// 页面加载完成后添加箭头到页面
window.addEventListener('load', () => {
  document.body.appendChild(arrow)
})

// Plasmo 要求的默认导出组件
const Content = () => null
export default Content