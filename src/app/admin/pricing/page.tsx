export default function AdminPricingPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-forest-800 mb-6">Pricing</h1>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-forest-800 text-lg mb-4">Default Nightly Rate</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekday (Mon–Thu)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="1200"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                />
                <span className="text-sm text-gray-500">SEK</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekend (Fri–Sun)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="1500"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                />
                <span className="text-sm text-gray-500">SEK</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cleaning Fee</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  defaultValue="800"
                  className="w-full rounded-lg border-gray-300 focus:border-forest-500 focus:ring-forest-500"
                />
                <span className="text-sm text-gray-500">SEK</span>
              </div>
            </div>
          </div>
          <button className="btn-primary text-sm mt-4">Save Defaults</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-forest-800 text-lg">Seasonal Pricing</h2>
            <button className="btn-outline text-sm !py-1.5 !px-3">+ Add Season</button>
          </div>
          <p className="text-sm text-gray-400 italic">
            No seasonal pricing rules configured. Add seasons like &quot;Summer High Season&quot;
            or &quot;Christmas/New Year&quot; with custom rates.
          </p>
        </div>
      </div>
    </div>
  );
}
