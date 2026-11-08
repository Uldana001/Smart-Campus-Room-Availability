import { SAMPLE_ROOMS } from '@/data';

const EQUIPMENT_OPTIONS = Array.from(
  new Set(SAMPLE_ROOMS.flatMap((room) => room.equipment))
).sort();

interface Props {
  attendeesValue: string;
  requiredEquipment: string[];
  visibleCount: number;
  totalCount: number;
  onChange: (attendeesValue: string, requiredEquipment: string[]) => void;
}

export function RoomFilters({
  attendeesValue,
  requiredEquipment,
  visibleCount,
  totalCount,
  onChange,
}: Props) {
  function toggleEquipment(item: string, checked: boolean) {
    onChange(
      attendeesValue,
      checked
        ? [...requiredEquipment, item]
        : requiredEquipment.filter((existing) => existing !== item)
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
        Find a Room
      </h2>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="filter-attendees"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Attendees
          </label>
          <input
            id="filter-attendees"
            type="number"
            min={0}
            value={attendeesValue}
            onChange={(e) => onChange(e.target.value, requiredEquipment)}
            className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <fieldset>
          <legend className="block text-sm font-medium text-slate-700 mb-1.5">
            Required equipment
          </legend>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => (
              <label
                key={item}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={requiredEquipment.includes(item)}
                  onChange={(e) => toggleEquipment(item, e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <p className="mt-4 text-xs text-slate-500" aria-live="polite">
        Showing {visibleCount} of {totalCount} rooms
      </p>
    </div>
  );
}
