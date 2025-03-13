import React, { useState, useEffect } from 'react';
import { Icon, IconStyle, searchIcons, iconLibraries, iconCategories, getTotalIconCount } from '@/lib/icons/iconService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Copy, Search, Code, Check, Filter, X } from 'lucide-react';
import DynamicIcon from './DynamicIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface IconGalleryProps {
  searchQuery: string;
  size: number;
  strokeWidth: number;
  onIconSelect: (icon: Icon) => void;
  isPreviewOpen?: boolean;
}

const IconGallery: React.FC<IconGalleryProps> = ({ 
  searchQuery, 
  size = 24, 
  strokeWidth = 0.25,
  onIconSelect,
  isPreviewOpen = false
}) => {
  const [icons, setIcons] = useState<Icon[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalAvailableIcons, setTotalAvailableIcons] = useState(0);
  const ICONS_PER_PAGE = 100; // Number of icons per page
  
  // Track copy animation state
  const [copiedIcons, setCopiedIcons] = useState<Record<string, string>>({});
  
  // Load total icon count on mount
  useEffect(() => {
    const fetchTotalIcons = async () => {
      try {
        const totalCount = await getTotalIconCount();
        setTotalAvailableIcons(totalCount);
      } catch (error) {
        console.error("Error fetching total icon count:", error);
      }
    };
    
    fetchTotalIcons();
  }, []);
  
  // Load icons based on search
  useEffect(() => {
    const fetchIcons = async () => {
      setLoading(true);
      setPage(1); // Reset to first page on new search
      setIcons([]); // Clear existing icons
      
      try {
        const results = await searchIcons(searchQuery);
        
        // Show first page
        setIcons(results.slice(0, ICONS_PER_PAGE));
        setHasMore(results.length > ICONS_PER_PAGE);
        
        // Store all results for pagination
        setAllResults(results);
      } catch (error) {
        console.error("Error fetching icons:", error);
        toast.error("Failed to load icons. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchIcons();
  }, [searchQuery]);
  
  // Store all results for pagination
  const [allResults, setAllResults] = useState<Icon[]>([]);
  
  // Load more icons
  const loadMore = async () => {
    setLoadingMore(true);
    
    try {
      const nextPage = page + 1;
      const startIndex = (nextPage - 1) * ICONS_PER_PAGE;
      const endIndex = nextPage * ICONS_PER_PAGE;
      
      // If we've already fetched all results, just load the next page
      if (allResults.length >= endIndex) {
        const newIcons = allResults.slice(startIndex, endIndex);
        setIcons([...icons, ...newIcons]);
        setPage(nextPage);
        setHasMore(endIndex < allResults.length);
      } else {
        // If we need to fetch more from the API
        const moreResults = await searchIcons(searchQuery, {}, nextPage);
        
        // Append new results to existing ones
        const newResults = [...allResults, ...moreResults];
        setAllResults(newResults);
        
        // Update displayed icons
        setIcons([...icons, ...moreResults.slice(0, ICONS_PER_PAGE)]);
        setPage(nextPage);
        setHasMore(moreResults.length > 0);
      }
    } catch (error) {
      console.error("Error loading more icons:", error);
      toast.error("Failed to load more icons");
    } finally {
      setLoadingMore(false);
    }
  };

  // Determine the grid columns class based on whether preview is open
  const gridColumnsClass = isPreviewOpen
    ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  
  // Check if we're searching and have results
  const isSearching = !!searchQuery.trim();
  const hasSearchResults = isSearching && allResults.length > 0 && !loading;
  
  return (
    <div className="space-y-4">
      {/* Search results header - only show when actively searching */}
      {hasSearchResults && (
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-medium text-lg flex items-center">
              "{searchQuery}"
              <Badge variant="secondary" className="ml-2 px-2 py-0.5">
                {allResults.length.toLocaleString()} results
              </Badge>
            </h2>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className={`grid ${gridColumnsClass} gap-2`}>
          {Array.from({ length: 24 }).map((_, index) => (
            <Card key={index} className="overflow-hidden border-0 shadow-sm">
              <CardContent className="p-3 flex flex-col items-center">
                <Skeleton className="h-12 w-12 rounded mb-2" />
                <Skeleton className="h-3 w-16 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Icon grid display */}
      {!loading && icons.length > 0 && (
        <>
          <div className={`grid ${gridColumnsClass} gap-2`}>
            {icons.map((icon, index) => (
              <Card 
                key={index} 
                className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow hover:border-primary/20 cursor-pointer"
                onClick={() => onIconSelect(icon)}
              >
                <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                  <div className="flex items-center justify-center w-full h-12">
                    <DynamicIcon 
                      iconName={icon.iconifyName} 
                      size={32} 
                      strokeWidth={strokeWidth}
                    />
                  </div>
                  <div className="text-xs text-center text-muted-foreground truncate w-full">
                    {icon.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center my-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadMore}
                className="text-xs font-normal"
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'Load More Icons'}
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Empty state */}
      {!loading && icons.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <Search className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-base font-medium">No icons found</h3>
          <p className="text-muted-foreground text-sm">
            Try a different search term
          </p>
        </div>
      )}
      
      {/* Centered results count (Fixed alignment on line 304) */}
      {!loading && icons.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {hasSearchResults ? (
            <>Showing {icons.length.toLocaleString()} of {allResults.length.toLocaleString()} results for "{searchQuery}"</>
          ) : (
            <>Showing popular icons from our library of {totalAvailableIcons.toLocaleString()}+ icons</>
          )}
        </div>
      )}
    </div>
  );
};

export default IconGallery;
