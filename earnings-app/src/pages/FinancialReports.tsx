import React, { useState, useEffect } from "react";

interface CalendarItem {
  "Earnings Date": string;
  Ticker: string;
  "Market Cap": number;
  "Earnings Timing": "After Market Close" | "Before Market Open";
}

interface ReactionItem {
  Ticker: string;
  "Earnings Date": string;
  "Close Before": number | null;
  "Close DayOf": number | null;
  "Close After": number | null;
  "% Before→DayOf": number | null;
  "% DayOf→After": number | null;
  "% Before→After": number | null;
}

interface CombinedItem extends ReactionItem {
  "Earnings Timing": "After Market Close" | "Before Market Open" | "-";
  "Market Cap": number;
}

export default function FinancialReports() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [calendarData, setCalendarData] = useState<CalendarItem[]>([]);
  const [reactionsData, setReactionsData] = useState<ReactionItem[]>([]);
  const [filteredData, setFilteredData] = useState<CombinedItem[]>([]);

  const timingOrder = {
    "After Market Close": 0,
    "Before Market Open": 1,
  };

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}earnings_calendar.json`)
      .then((res) => res.json())
      .then(setCalendarData)
      .catch(console.error);

      fetch(`${import.meta.env.BASE_URL}earnings_reactions.json`)
      .then((res) => res.json())
      .then(setReactionsData)
      .catch(console.error);
  }, []);

  useEffect(() => {
    const today = selectedDate;
    const tomorrow = new Date(selectedDate);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Filter calendar for today/tomorrow
    const relevantCalendar = calendarData.filter(
      (c) =>
        (c["Earnings Date"] === today && c["Earnings Timing"] === "After Market Close") ||
        (c["Earnings Date"] === tomorrowStr && c["Earnings Timing"] === "Before Market Open")
    );

    // Sort calendar: date → timing → market cap desc
    relevantCalendar.sort((a, b) => {
      if (a["Earnings Date"] < b["Earnings Date"]) return -1;
      if (a["Earnings Date"] > b["Earnings Date"]) return 1;
      return timingOrder[a["Earnings Timing"]] - timingOrder[b["Earnings Timing"]] || b["Market Cap"] - a["Market Cap"];
    });

    // Merge reactions with calendar info
    const merged: CombinedItem[] = relevantCalendar.flatMap((cal) => {
      const reactions = reactionsData.filter((r) => r.Ticker === cal.Ticker);
      return reactions.map((r) => ({
        ...r,
        "Earnings Timing": cal["Earnings Timing"],
        "Market Cap": cal["Market Cap"],
      }));
    });

    setFilteredData(merged);
  }, [selectedDate, calendarData, reactionsData]);

  const groupedByTicker: Record<string, CombinedItem[]> = {};
  filteredData.forEach((item) => {
    if (!groupedByTicker[item.Ticker]) groupedByTicker[item.Ticker] = [];
    groupedByTicker[item.Ticker].push(item);
  });

  const fmt = (num: number | null | undefined) => (num != null ? num.toFixed(2) : "-");

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Financial Reports</h1>

      <label style={{ display: "block", marginBottom: "1rem" }}>
        Select Date:{" "}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "0.25rem", fontSize: "1rem" }}
        />
      </label>

      <p style={{ marginBottom: "1rem" }}>
        Showing earnings reactions for{" "}
        <strong>
          {selectedDate} (After Market Close) and{" "}
          {new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))
            .toISOString()
            .split("T")[0]}{" "}
          (Before Market Open)
        </strong>
      </p>

      {filteredData.length === 0 ? (
        <p>No earnings reactions found for the selected dates.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ backgroundColor: "#f2f2f2" }}>
            <tr>
              <th>Ticker</th>
              <th>Earnings Date</th>
              <th>Timing</th>
              <th>Close Before</th>
              <th>Close DayOf</th>
              <th>Close After</th>
              <th>% Before→DayOf</th>
              <th>% DayOf→After</th>
              <th>% Before→After</th>
            </tr>
          </thead>
          <tbody>
          {Object.entries(groupedByTicker).map(([ticker, items], idx) => {
  const bgColor = idx % 2 === 0 ? "#f9f9f9" : "#fafafa";

  // Find the earliest calendar entry for this ticker among the filtered dates
  const calendarEntry = calendarData.find(
    (c) =>
      c.Ticker === ticker &&
      ((c["Earnings Date"] === selectedDate && c["Earnings Timing"] === "After Market Close") ||
       (new Date(c["Earnings Date"]).toISOString().split("T")[0] ===
        new Date(new Date(selectedDate).setDate(new Date(selectedDate).getDate() + 1))
          .toISOString()
          .split("T")[0] &&
        c["Earnings Timing"] === "Before Market Open"))
  );

  const headerDate = calendarEntry?.["Earnings Date"] ?? "-";
  const headerTiming = calendarEntry?.["Earnings Timing"] ?? "-";

  return (
    <React.Fragment key={ticker}>
      <tr style={{ backgroundColor: "#ddd", fontWeight: "bold" }}>
        <td colSpan={9} style={{ padding: "0.5rem" }}>
          {ticker} - {headerDate} ({headerTiming})
        </td>
      </tr>
      {items.map((item, i) => (
        <tr key={`${ticker}-${i}`} style={{ backgroundColor: bgColor }}>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item.Ticker}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item["Earnings Date"]}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{item["Earnings Timing"]}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["Close Before"])}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["Close DayOf"])}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["Close After"])}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["% Before→DayOf"])}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["% DayOf→After"])}</td>
          <td style={{ padding: "0.5rem", borderBottom: "1px solid #ddd" }}>{fmt(item["% Before→After"])}</td>
        </tr>
      ))}
    </React.Fragment>
  );
})}

          </tbody>
        </table>
      )}
    </div>
  );
}
