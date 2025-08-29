"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { supabase } from "../../lib/supabaseClient";

const timeframeOptions = ["15m", "1h", "4h", "1d"];
const statusOptions = ["active", "confirmed", "invalidated"];

export default function Filters({ onChange }: { onChange: (filters: any) => void }) {
  const [signalCodeOptions, setSignalCodeOptions] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [timeframe, setTimeframe] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignalCodes = async () => {
      const { data, error } = await supabase
        .from("signals")
        .select("signal_codes")
        .limit(500);

      if (!error && data) {
        const codes = new Set<string>();
        data.forEach((row: any) => {
          if (Array.isArray(row.signal_codes)) {
            row.signal_codes.forEach((c: string) => codes.add(c));
          }
        });
        setSignalCodeOptions(Array.from(codes).sort());
      }
    };
    fetchSignalCodes();
  }, []);

  const updateFilters = (newFilters: any) => {
    onChange({
      signalCodes: selectedCodes,
      timeframe,
      status,
      ...newFilters,
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 text-white rounded-md shadow">
      {/* Signal Codes Multi-select */}
      <div>
        <label className="block text-sm font-medium mb-1">Signal Codes</label>
        <Listbox
          value={selectedCodes}
          onChange={(codes) => {
            setSelectedCodes(codes);
            updateFilters({ signalCodes: codes });
          }}
          multiple
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-lg bg-gray-800 py-2 pl-3 pr-10 text-left shadow-md">
              <span className="block truncate">
                {selectedCodes.length > 0 ? selectedCodes.join(", ") : "Select signal codes"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10">
              {signalCodeOptions.length === 0 && (
                <div className="px-4 py-2 text-gray-400">No codes available</div>
              )}
              {signalCodeOptions.map((code) => (
                <Listbox.Option
                  key={code}
                  value={code}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? "bg-indigo-600 text-white" : "text-gray-200"
                    }`
                  }
                >
                  {({ selected }: { selected: boolean }) => (
                    <>
                      <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>
                        {code}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-400">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      {/* Timeframe Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Timeframe</label>
        <select
          className="w-full rounded-md bg-gray-800 p-2"
          value={timeframe || ""}
          onChange={(e) => {
            setTimeframe(e.target.value);
            updateFilters({ timeframe: e.target.value });
          }}
        >
          <option value="">All</option>
          {timeframeOptions.map((tf) => (
            <option key={tf} value={tf}>
              {tf}
            </option>
          ))}
        </select>
      </div>

      {/* Status Dropdown */}
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          className="w-full rounded-md bg-gray-800 p-2"
          value={status || ""}
          onChange={(e) => {
            setStatus(e.target.value);
            updateFilters({ status: e.target.value });
          }}
        >
          <option value="">All</option>
          {statusOptions.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
