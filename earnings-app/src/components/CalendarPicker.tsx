import React from "react";

interface CalendarPickerProps {
  date: string;
  setDate: (date: string) => void;
}

const CalendarPicker: React.FC<CalendarPickerProps> = ({ date, setDate }) => {
  return (
    <div className="mb-4">
      <label className="block mb-2 font-medium text-gray-700">Pick a date:</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export default CalendarPicker;
