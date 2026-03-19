import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { BookOpen } from 'lucide-react';

function StarRating({ rating }) {
  if (!rating) return null;
  return (
    <span className="text-xs text-amber-500" aria-label={`${rating} out of 5 stars`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export default function GoodreadsCard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/goodreads.json')
      .then(r => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null));
  }, []);

  const currentlyReading = data?.currentlyReading ?? [];
  const recent = data?.recentlyRead ?? [];

  if (!data || (!currentlyReading.length && !recent.length)) return null;

  return (
    <Card className="bg-white/70 shadow-sm dark:bg-slate-900/60 h-full flex flex-col">
      <CardHeader>
        <CardTitle icon={BookOpen}>Reading</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 space-y-4">
        {currentlyReading.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
              Currently reading
            </div>
            <ul className="space-y-2.5">
              {currentlyReading.map(book => (
                <li key={book.bookId}>
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 group"
                  >
                    {book.imageUrl && (
                      <img
                        src={book.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-10 h-14 rounded object-cover flex-shrink-0 shadow-sm"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {book.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {book.author}
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recent.length > 0 && (
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">
              Recently read
            </div>
            <ul className="space-y-2">
              {recent.slice(0, 4).map(book => (
                <li key={book.bookId}>
                  <a
                    href={book.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-2.5 group"
                  >
                    {book.imageUrl && (
                      <img
                        src={book.imageUrl}
                        alt=""
                        loading="lazy"
                        className="w-7 h-10 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-800 dark:text-slate-200 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                        {book.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {book.author}
                        </span>
                        <StarRating rating={book.rating} />
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
