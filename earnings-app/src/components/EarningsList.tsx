import React from "react";

export interface CalendarEntry {
  "Earnings Date": string;
  Ticker: string;
  "Market Cap": string;
  "Market Cap Numeric": number;
  "Earnings Timing": string;
}

interface EarningsListProps {
  entries: CalendarEntry[];
}

const EarningsList: React.FC<EarningsListProps> = ({ entries }) => {
  if (!entries.length) return <p>No earnings for this date.</p>;

  return (
    <ul className="space-y-2">
      {entries.map((item) => (
        <li
          key={item.Ticker}
          className="p-3 bg-white rounded shadow flex justify-between items-center hover:bg-gray-50 transition"
        >
          <span className="font-semibold">{item.Ticker}</span>
          <span className="text-gray-500">{item["Earnings Timing"]}</span>
          <span className="text-gray-600">{item["Market Cap"]}</span>
        </li>
      ))}
    </ul>
  );
};

export default EarningsList;
