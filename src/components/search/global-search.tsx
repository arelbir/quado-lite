'use client';

/**
 * GLOBAL SEARCH COMPONENT
 * Cmd+K search across all entities
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/shared/icons';
import { globalSearch, SearchResult, saveRecentSearch, getRecentSearches } from '@/lib/search/search-service';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Load recent searches
  useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        const results = await globalSearch({ query, limit: 10 });
        setResults(results);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    saveRecentSearch(query);
    router.push(result.url);
    setOpen(false);
    setQuery('');
  };

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Search;
    return IconComponent;
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground border rounded-md hover:bg-accent transition-colors"
      >
        <Icons.Search className="size-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0">
          <div className="flex items-center border-b px-4">
            <Icons.Search className="size-5 text-muted-foreground mr-2" />
            <Input
              placeholder="Search users, teams, groups, workflows..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              autoFocus
            />
            {loading && <Icons.Loader2 className="size-4 animate-spin text-muted-foreground" />}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {/* Results */}
            {results.length > 0 && (
              <div className="p-2">
                {results.map((result) => {
                  const IconComponent = getIcon(result.icon);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <IconComponent className="size-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{result.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {result.type}
                          </Badge>
                        </div>
                        {result.subtitle && (
                          <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                        )}
                        {result.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{result.description}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">Recent Searches</div>
                <div className="space-y-1">
                  {recentSearches.map((search, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(search)}
                      className="w-full flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors text-left text-sm"
                    >
                      <Icons.History className="size-4 text-muted-foreground" />
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {query.length >= 2 && results.length === 0 && !loading && (
              <div className="p-8 text-center text-muted-foreground">
                <Icons.Search className="size-12 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
              </div>
            )}

            {/* Initial State */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Icons.Search className="size-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start typing to search...</p>
                <p className="text-xs mt-1">Search across users, teams, groups, and workflows</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-2 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-muted rounded">Esc</kbd> Close
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
