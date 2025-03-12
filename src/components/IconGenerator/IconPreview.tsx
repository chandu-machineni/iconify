import React, { useState } from 'react';
import { Icon, getSvgWithOptions, supportsStroke, isColoredIcon, getFormattedFilename, showIconTypeWarning } from '@/lib/icons/iconService';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, Download, Check, X, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DynamicIcon from './DynamicIcon';
import { toast } from 'sonner';

interface IconPreviewProps {
  selectedIcon: Icon | null;
  isLoading: boolean;
  size: number;
  strokeWidth: number;
  color?: string; 
  onClose?: () => void;
}

const IconPreview: React.FC<IconPreviewProps> = ({
  selectedIcon,
  isLoading,
  size,
  strokeWidth,
  color = 'currentColor',
  onClose
}) => {
  const [copying, setCopying] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copyingSnippet, setCopyingSnippet] = useState(false);

  if (!selectedIcon && !isLoading) {
    return null;
  }

  // Get icon type and editability info
  const getIconInfo = () => {
    if (!selectedIcon) return { type: '', library: '' };
    const iconPath = selectedIcon.iconifyName.replace(':', '/');
    const prefix = iconPath.split('/')[0];
    
    // Define icon types and their libraries
    const iconTypes = {
      emoji: ['twemoji', 'noto', 'emojione', 'fxemoji', 'openmoji', 'fluent-emoji'],
      logos: ['logos', 'simple-icons', 'skill-icons', 'devicon'],
      flags: ['flag', 'circle-flags', 'country-flag'],
      payment: ['cryptocurrency', 'payment'],
      regular: ['lucide', 'tabler', 'mingcute', 'line-md', 'carbon', 'mdi-light', 'iconoir', 'ph', 'solar', 'ri', 'uil', 'bx']
    };
    
    // Determine icon type
    for (const [type, libraries] of Object.entries(iconTypes)) {
      if (libraries.some(lib => prefix.includes(lib))) {
        return { type, library: prefix };
      }
    }
    
    return { type: 'regular', library: prefix };
  };

  const { type, library } = getIconInfo();
  const iconPath = selectedIcon?.iconifyName.replace(':', '/') || '';
  const canEditStroke = supportsStroke(iconPath);
  const canEditColor = !isColoredIcon(iconPath);

  // Handle copy SVG to clipboard
  const handleCopy = async () => {
    if (!selectedIcon) return;
    
    try {
      setCopying(true);
      const svg = await getSvgWithOptions(iconPath, {
        size,
        strokeWidth: canEditStroke ? strokeWidth : undefined,
        color: canEditColor ? color : undefined
      });
      
      await navigator.clipboard.writeText(svg);
      
      toast.success("SVG copied to clipboard", {
        description: "This is a vector file that can be edited in Figma, Illustrator, or other vector editors."
      });
      
      setTimeout(() => setCopying(false), 2000);
    } catch (error) {
      console.error("Error copying SVG:", error);
      toast.error(`Failed to copy SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCopying(false);
    }
  };

  // Handle SVG download
  const handleDownload = async () => {
    if (!selectedIcon) return;
    
    try {
      setDownloading(true);
      const svg = await getSvgWithOptions(iconPath, {
        size,
        strokeWidth: canEditStroke ? strokeWidth : undefined,
        color: canEditColor ? color : undefined
      });
      
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = getFormattedFilename(selectedIcon, {
        size,
        strokeWidth: canEditStroke ? strokeWidth : undefined
      });
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);
        setDownloading(false);
      }, 100);
      
      toast.success(`Downloaded "${selectedIcon.name}" as SVG`, {
        description: "This is a vector file that can be edited in Figma, Illustrator, or other vector editors."
      });
    } catch (error) {
      console.error("Error downloading SVG:", error);
      toast.error(`Failed to download SVG: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setDownloading(false);
    }
  };
  
  // Handle copy code snippet
  const handleCopySnippet = () => {
    if (!selectedIcon) return;
    
    try {
      setCopyingSnippet(true);
      let snippet = `<Icon icon="${selectedIcon.iconifyName}" width="${size}" height="${size}"`;
      
      if (canEditStroke) {
        snippet += ` style={{ strokeWidth: ${strokeWidth} }}`;
      }
      
      if (canEditColor && color !== 'currentColor') {
        snippet += ` color="${color}"`;
      }
      
      snippet += ' />';
      
      navigator.clipboard.writeText(snippet);
      toast.success("Code snippet copied to clipboard");
      
      setTimeout(() => setCopyingSnippet(false), 2000);
    } catch (error) {
      console.error("Error copying snippet:", error);
      toast.error("Failed to copy code snippet");
      setCopyingSnippet(false);
    }
  };
  
  // Get icon type display text
  const getIconTypeDisplay = () => {
    switch (type) {
      case 'emoji': return 'Emoji';
      case 'logos': return 'Logo';
      case 'flags': return 'Flag';
      case 'payment': return 'Payment Icon';
      default: return library;
    }
  };
  
  // Show warning for non-editable icons
  const showEditabilityWarning = () => {
    if (!canEditColor) {
      showIconTypeWarning(getIconTypeDisplay());
    }
  };
  
  return (
    <Card className="border border-slate-100 shadow-sm overflow-hidden relative">
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-slate-100 transition-colors z-10"
          aria-label="Close preview"
        >
          <X className="h-4 w-4 text-slate-500" />
        </button>
      )}
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-3" />
            <Skeleton className="h-3 w-24 rounded mb-1" />
          </div>
        ) : selectedIcon && (
          <>
            <div className="bg-slate-50 rounded-lg p-8 mb-4 flex items-center justify-center">
              <DynamicIcon 
                iconName={selectedIcon.iconifyName}
                size={size * 1.5} 
                strokeWidth={canEditStroke ? strokeWidth : undefined}
                color={canEditColor ? color : undefined}
                className="text-primary"
                onClick={showEditabilityWarning}
              />
          </div>
            
            <div className="text-center mb-6">
              <h3 className="text-base font-medium mb-1">{selectedIcon.name}</h3>
              <p className="text-xs text-muted-foreground">
                {getIconTypeDisplay()}
                {canEditColor ? (
                  <>
                    {` • ${size}px`}
                    {canEditStroke && ` • ${strokeWidth.toFixed(2)}px stroke`}
                    {color !== 'currentColor' && ` • ${color}`}
                  </>
                ) : (
                  ` • ${size}px • Non-editable`
                )}
          </p>
        </div>
            
            <div className="space-y-3">
              {/* Copy buttons row */}
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  onClick={handleCopy} 
                  variant="default"
                  className="h-9 justify-center"
                  disabled={copying}
                >
                  {copying ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="default" 
                  onClick={handleCopySnippet} 
                  className="h-9 justify-center"
                  disabled={copyingSnippet}
                >
                  {copyingSnippet ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4 mr-2" />
                      <span>Code</span>
                    </>
                  )}
                </Button>
              </div>
              
              {/* Download button */}
              <Button 
                variant="outline" 
                onClick={handleDownload} 
                className="w-full h-9 justify-center"
                disabled={downloading}
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Download as SVG</span>
              </Button>
    </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IconPreview;
