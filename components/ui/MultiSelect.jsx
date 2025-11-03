import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export default function MultiSelect({
  label,
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select…',
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const optionSet = useMemo(() => new Set(options), [options]);
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const orderedOptions = useMemo(() => [...options], [options]);

  const commit = values => {
    if (typeof onChange === 'function') {
      onChange(values);
    }
  };

  const removeValue = value => {
    if (!selectedSet.has(value)) return;
    commit(selected.filter(item => item !== value));
  };

  const toggleValue = value => {
    if (!optionSet.has(value)) return;
    const next = selectedSet.has(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    commit(next);
  };

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = event => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleKeyDown = event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setOpen(previous => !previous);
    }
  };

  return (
    <div className="space-y-2" ref={containerRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}

      <div
        role="combobox"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen(previous => !previous)}
        onKeyDown={handleKeyDown}
        className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex flex-wrap items-center gap-2">
          {selected.length === 0 && (
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {placeholder}
            </span>
          )}
          {selected.map(value => (
            <span
              key={value}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
            >
              {value}
              <button
                type="button"
                onClick={event => {
                  event.stopPropagation();
                  removeValue(value);
                }}
                className="text-slate-500 hover:text-slate-700 focus:outline-none dark:text-slate-400 dark:hover:text-slate-200"
              >
                <X className="h-3 w-3" aria-hidden="true" />
                <span className="sr-only">Remove {value}</span>
              </button>
            </span>
          ))}
        </div>
        <ChevronDown
          className="ml-auto h-4 w-4 text-slate-500 dark:text-slate-400"
          aria-hidden="true"
        />
      </div>

      {open && (
        <div className="relative">
          <div className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
            {orderedOptions.length === 0 ? (
              <div className="px-4 py-2 text-slate-500 dark:text-slate-400">
                Nothing to select.
              </div>
            ) : (
              orderedOptions.map(option => {
                const active = selectedSet.has(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      toggleValue(option);
                    }}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left transition focus:outline-none ${
                      active
                        ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{option}</span>
                    {active && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
