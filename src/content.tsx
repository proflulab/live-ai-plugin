import { type PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

const arrow = document.createElement("div")
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
  box-shadow: -3px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 2147483647;
  font-size: 20px;
  transition: all 0.3s ease;
`
arrow.textContent = "◀"

// 添加点击事件打开侧边栏
arrow.addEventListener('click', () => {
  chrome.runtime.sendMessage({ type: "OPEN_SIDEPANEL" })
})

arrow.addEventListener('mouseover', () => {
  arrow.style.width = '45px'
  arrow.style.color = '#1557b0'
  arrow.style.boxShadow = '-4px 0 12px rgba(0, 0, 0, 0.15)'
})

arrow.addEventListener('mouseout', () => {
  arrow.style.width = '30px'
  arrow.style.color = '#1a73e8'
  arrow.style.boxShadow = '-3px 0 8px rgba(0, 0, 0, 0.1)'
})

window.addEventListener('load', () => {
  document.body.appendChild(arrow)
})

const Content = () => null
export default Content