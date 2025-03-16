export default function SidePanel() {
    return (
      <div style={{ padding: "16px" }}>
        <h1>Live AI Sidebar</h1>
        <button onClick={() => alert("Hello from side panel!")}>
          Click Me
        </button>
      </div>
    )
  }