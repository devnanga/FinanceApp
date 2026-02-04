import React, { useState } from "react";
import Homepage from "./pages/HomePage";
import FinancialReports from "./pages/FinancialReports";


function GambleAnalysis() {
  return (
    <div style={{ padding: "1rem" }}>
      <h2>Gamble Analysis</h2>
      <p>Coming soon...</p>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("earnings");

  const tabs = [
    { id: "earnings", label: "Earnings Calendar" },
    { id: "financial", label: "Financial Reports" },
    { id: "gamble", label: "Gamble Analysis" },
  ];

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      {/* Tab buttons */}
      <div style={{ display: "flex", marginBottom: "1rem" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "0.5rem 1rem",
              marginRight: "0.5rem",
              border: activeTab === tab.id ? "2px solid #333" : "1px solid #ccc",
              borderBottom: activeTab === tab.id ? "none" : "1px solid #ccc",
              backgroundColor: activeTab === tab.id ? "#f0f0f0" : "#fff",
              cursor: "pointer",
              borderRadius: "4px 4px 0 0",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ border: "1px solid #ccc", borderRadius: "0 4px 4px 4px", padding: "1rem" }}>
        {activeTab === "earnings" && <Homepage />}
        {activeTab === "financial" && <FinancialReports />}
        {activeTab === "gamble" && <GambleAnalysis />}
      </div>
    </div>
  );
}
