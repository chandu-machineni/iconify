import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import SearchInput from '@/components/IconGenerator/PromptInput';
import IconControls from '@/components/IconGenerator/IconControls';
import IconPreview from '@/components/IconGenerator/IconPreview';
import IconGallery from '@/components/IconGenerator/IconGallery';
import { Icon, getTotalIconCount } from '@/lib/icons/iconService';
import { useDebounce } from '@/hooks/useDebounce';

const Index = () => {
  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Gallery icons will have a fixed size and stroke width
  const gallerySize = 24;
  const galleryStrokeWidth = 0.25;
  
  // Preview icon can be customized
  const [previewSize, setPreviewSize] = useState(24);
  const [previewStrokeWidth, setPreviewStrokeWidth] = useState(0.25);
  const [previewColor, setPreviewColor] = useState('currentColor');
  
  const [totalIcons, setTotalIcons] = useState<number>(0);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Load initial icon statistics
  useEffect(() => {
    const loadIconStats = async () => {
      try {
        const total = await getTotalIconCount();
        setTotalIcons(total);
      } catch (error) {
        console.error("Error loading icon stats:", error);
      }
    };
    
    loadIconStats();
  }, []);

  // Handle search
  const handleSearch = (query: string) => {
    setIsLoading(true);
    setSearchQuery(query);
    
    // Reset selected icon when search changes
    if (selectedIcon) {
      setSelectedIcon(null);
    }
    
    // The actual search is handled by the IconGallery component
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Handle icon selection
  const handleIconSelect = (icon: Icon) => {
    setSelectedIcon(icon);
    // Reset preview size and stroke width when selecting a new icon
    setPreviewSize(24);
    setPreviewStrokeWidth(0.25);
    setPreviewColor('currentColor');
    toast.success(`Selected "${icon.name}" icon`);
  };
  
  // Handle closing the preview
  const handleClosePreview = () => {
    setSelectedIcon(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
    <div className="min-h-screen flex flex-col bg-background">
  {/* Removed the Header component */}
  
 <div className="min-h-screen flex flex-col bg-background">
  <main className="flex-1 w-full px-4 py-6">
    <div className="container mx-auto max-w-7xl">
      {/* Search bar */}
      <div className="mb-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-3 text-center font-display pt-0">
          Iconify
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {totalIcons.toLocaleString()} icons from popular libraries
        </p>
        <SearchInput 
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </div>
    </div>
  </main>
</div>

          
          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main content - Icon Gallery */}
            <div className={`${selectedIcon ? 'md:w-2/3 lg:w-3/4' : 'w-full'}`}>
              <IconGallery 
                searchQuery={debouncedSearchQuery}
                size={gallerySize}
                strokeWidth={galleryStrokeWidth}
                onIconSelect={handleIconSelect}
                isPreviewOpen={!!selectedIcon}
              />
            </div>
            
            {/* Right Sidebar - Only show when an icon is selected */}
            {selectedIcon && (
              <div className="md:w-1/3 lg:w-1/4 space-y-5 md:sticky md:top-20 self-start">
                {/* Preview with Copy/Download buttons */}
                <IconPreview 
                  selectedIcon={selectedIcon}
                  isLoading={isLoading}
                  size={previewSize}
                  strokeWidth={previewStrokeWidth}
                  color={previewColor}
                  onClose={handleClosePreview}
                />
                
                {/* Size, Stroke, and Color controls - now only affects preview */}
                <IconControls 
                  size={previewSize}
                  setSize={setPreviewSize}
                  strokeWidth={previewStrokeWidth}
                  setStrokeWidth={setPreviewStrokeWidth}
                  color={previewColor}
                  setColor={setPreviewColor}
                  isLoading={isLoading}
                  hasIcon={!!selectedIcon}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
