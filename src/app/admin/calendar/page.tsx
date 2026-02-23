export default function AdminCalendarPage() {
  const today = new Date();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <h1 className="text-2xl font-bold text-forest-800 mb-6">Availability Calendar</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button className="text-sm text-gray-500 hover:text-gray-700">&larr; Previous</button>
          <h2 className="font-semibold text-forest-800 text-lg">{monthName}</h2>
          <button className="text-sm text-gray-500 hover:text-gray-700">Next &rarr;</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 py-2">{day}</div>
          ))}
          {Array.from({ length: 35 }, (_, i) => {
            const dayNum = i - (new Date(today.getFullYear(), today.getMonth(), 1).getDay() || 7) + 2;
            const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
            const isCurrentMonth = dayNum >= 1 && dayNum <= daysInMonth;
            const isToday = dayNum === today.getDate();

            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm ${
                  isToday
                    ? 'bg-forest-600 text-white font-semibold'
                    : isCurrentMonth
                    ? 'hover:bg-gray-50 text-gray-700 cursor-pointer'
                    : 'text-gray-300'
                }`}
              >
                {isCurrentMonth ? dayNum : ''}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-forest-200 inline-block"></span> Available
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-falu-200 inline-block"></span> Booked
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-gray-200 inline-block"></span> Blocked
          </span>
        </div>
      </div>
    </div>
  );
}
