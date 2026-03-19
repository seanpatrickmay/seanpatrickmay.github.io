import { Listbox } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';
import classNames from '@/lib/classNames';

export default function MultiSelect({
  label,
  options = [],
  selected = [],
  onChange,
  placeholder = 'Select…',
}) {
  const commit = values => {
    if (typeof onChange === 'function') {
      onChange(values);
    }
  };

  const removeValue = value => {
    commit(selected.filter(item => item !== value));
  };

  return (
    <Listbox value={selected} onChange={commit} multiple>
      {({ open }) => (
        <div className="space-y-2">
          {label && (
            <Listbox.Label className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {label}
            </Listbox.Label>
          )}

          <div className="relative">
            <Listbox.Button className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
              <span className="flex flex-1 flex-wrap items-center gap-2">
                {selected.length === 0 ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {placeholder}
                  </span>
                ) : (
                  selected.map(value => (
                    <span
                      key={value}
                      className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {value}
                    </span>
                  ))
                )}
              </span>
              <ChevronDown
                className={classNames(
                  'h-4 w-4 text-slate-500 transition-transform dark:text-slate-400',
                  open ? 'rotate-180' : '',
                )}
                aria-hidden="true"
              />
            </Listbox.Button>

            <Listbox.Options className="absolute z-30 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-slate-200 bg-white py-2 text-sm shadow-lg focus:outline-none dark:border-slate-700 dark:bg-slate-900">
              {options.length === 0 ? (
                <div className="px-4 py-2 text-slate-500 dark:text-slate-300">
                  Nothing to select.
                </div>
              ) : (
                options.map(option => (
                  <Listbox.Option
                    key={option}
                    value={option}
                    className={({ active, selected: isSelected }) =>
                      classNames(
                        'flex w-full items-center justify-between px-4 py-2 text-left transition focus:outline-none',
                        isSelected
                          ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-slate-800 dark:text-white'
                          : 'text-slate-700 dark:text-slate-200',
                        active ? 'bg-slate-100 dark:bg-slate-800' : '',
                      )
                    }
                  >
                    {({ selected: isSelected }) => (
                      <>
                        <span>{option}</span>
                        {isSelected && <Check className="h-4 w-4" aria-hidden="true" />}
                      </>
                    )}
                  </Listbox.Option>
                ))
              )}
            </Listbox.Options>
          </div>

          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selected.map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => removeValue(value)}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {value}
                  <X className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">Remove {value}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Listbox>
  );
}
