import React, { useState, useEffect } from "react";

interface EarningsItem {
  "Earnings Date": string;
  Ticker: string;
  "Market Cap": number;
  "Earnings Timing": string;
}

export default function Homepage() {
    const [earningsData, setEarningsData] = useState<EarningsItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [filteredEarnings, setFilteredEarnings] = useState<EarningsItem[]>([]);
  
    // Load JSON from public folder
    useEffect(() => {
      fetch("/earnings_calendar.json")
        .then((res) => res.json())
        .then((data) => setEarningsData(data))
        .catch((err) => console.error("Error loading earnings data:", err));
    }, []);
  
    // Filter earnings based on selected date and timing rules
    useEffect(() => {
      const selectedStr = selectedDate.toISOString().split("T")[0];
  
      const dayOfWeek = selectedDate.getDay(); // 0=Sun, 1=Mon, etc.
      const tomorrow = new Date(selectedDate);
      tomorrow.setDate(selectedDate.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split("T")[0];
  
      let filtered = earningsData.filter((item) => {
        if (dayOfWeek === 1) {
          return (
            (item["Earnings Date"] === selectedStr &&
              item["Earnings Timing"] === "After Market Close") ||
            (item["Earnings Date"] === tomorrowStr &&
              item["Earnings Timing"] === "Before Market Open")
          );
        } else {
          return item["Earnings Date"] === selectedStr;
        }
      });
  
      // Sort by date first, then timing
      filtered.sort((a, b) => {
        const dateA = new Date(a["Earnings Date"]).getTime();
        const dateB = new Date(b["Earnings Date"]).getTime();
        if (dateA !== dateB) return dateA - dateB;
  
        // If same date, sort Before Market Open first
        const timingOrder = {
          "Before Market Open": 0,
          "After Market Close": 1,
        };
        return timingOrder[a["Earnings Timing"] as keyof typeof timingOrder] - timingOrder[b["Earnings Timing"] as keyof typeof timingOrder];
    });
  
      setFilteredEarnings(filtered);
    }, [earningsData, selectedDate]);
  
    // Calendar generation same as before
    const getMonthDates = () => {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const days: Date[] = [];
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push(new Date(year, month, i));
      }
      return days;
    };
  
    const monthDates = getMonthDates();
  
    return (
      <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif", maxWidth: "900px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Earnings Calendar</h1>
        <p style={{ marginBottom: "1rem" }}>
          Showing earnings for: <strong>{selectedDate.toISOString().split("T")[0]}</strong>
        </p>
  
        {/* Month Calendar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.5rem",
            marginBottom: "2rem",
          }}
        >
          {monthDates.map((day) => {
            const dayStr = day.toISOString().split("T")[0];
            const isSelected = dayStr === selectedDate.toISOString().split("T")[0];
            const isToday = dayStr === new Date().toISOString().split("T")[0];
  
            return (
              <div
                key={dayStr}
                onClick={() => setSelectedDate(day)}
                style={{
                  padding: "0.5rem",
                  borderRadius: "6px",
                  textAlign: "center",
                  cursor: "pointer",
                  backgroundColor: isSelected ? "#646cff" : isToday ? "#e0e0ff" : "#f2f2f2",
                  color: isSelected ? "#fff" : "#000",
                  fontWeight: isSelected ? 600 : 400,
                }}
              >
                {day.getDate()}
              </div>
            );
          })}
        </div>
  
        {/* Earnings Table */}
        {filteredEarnings.length === 0 ? (
          <p>No earnings reports on this day.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <thead style={{ backgroundColor: "#f2f2f2" }}>
              <tr>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Date</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Ticker</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Market Cap</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Earnings Timing</th>
              </tr>
            </thead>
            <tbody>
              {filteredEarnings.map((item) => (
                <tr key={item.Ticker + item["Earnings Date"]}>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item["Earnings Date"]}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item.Ticker}</td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>
                    ${item["Market Cap"].toLocaleString()}
                  </td>
                  <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item["Earnings Timing"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  }