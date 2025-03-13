import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';

export interface ControlsProps {
  size: number;
  setSize: (size: number) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  isLoading: boolean;
  hasIcon: boolean;
  color?: string;
  setColor?: (color: string) => void;
  onCopy?: () => void;
  onDownload?: () => void;
  onDownloadPNG?: () => void;
  isCopied?: boolean;
}

// Predefined color palette
const colorPalette = [
  '#000000', // Black
  '#FFFFFF', // White
  '#6E56CF', // Primary
  '#F97316', // Orange
  '#10B981', // Green
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#A855F7', // Purple
  '#FACC15', // Yellow
];

const IconControls: React.FC<ControlsProps> = ({
  size,
  setSize,
  strokeWidth,
  setStrokeWidth,
  color = 'currentColor',
  setColor,
  isLoading,
  hasIcon,
}) => {
  const [customColor, setCustomColor] = useState('');
  
  // Handle color selection from palette
  const handleColorChange = (newColor: string) => {
    if (setColor) {
      setColor(newColor);
    }
  };
  
  // Handle custom color input
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomColor(e.target.value);
  };
  
  // Apply custom color
  const applyCustomColor = () => {
    if (customColor && setColor) {
      setColor(customColor);
    }
  };
  
  return (
    <Card className="overflow-hidden border border-slate-100 shadow-sm">
      <CardContent className="p-5">
        <div className="space-y-6">
          {/* Size slider control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Size</p>
              <span className="text-sm font-medium text-slate-900">{size}px</span>
            </div>
            <Slider
              value={[size]}
              min={16}
              max={96}
              step={4}
              onValueChange={(values) => setSize(values[0])}
              disabled={isLoading || !hasIcon}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>16px</span>
              <span>96px</span>
            </div>
          </div>

          {/* Stroke width slider control */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-700">Stroke Width</p>
              <span className="text-sm font-medium text-slate-900">{strokeWidth.toFixed(2)}</span>
            </div>
            <Slider
              value={[strokeWidth]}
              min={0.25}
              max={5.0}
              step={0.05}
              onValueChange={(values) => setStrokeWidth(values[0])}
              disabled={isLoading || !hasIcon}
              className="py-1"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.25</span>
              <span>5.0</span>
            </div>
          </div>
          
          {/* Color picker control - only show if setColor is provided */}
          {setColor && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Color</p>
                <div 
                  className="w-6 h-6 rounded border border-slate-200" 
                  style={{ backgroundColor: color }}
                />
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full justify-between" 
                    disabled={isLoading || !hasIcon}
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                      <span>{color === 'currentColor' ? 'Default' : color}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-3" align="start">
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {colorPalette.map(clr => (
                        <button
                          key={clr}
                          type="button"
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${clr === '#FFFFFF' ? 'border border-slate-200' : ''}`}
                          style={{ backgroundColor: clr }}
                          onClick={() => handleColorChange(clr)}
                          title={clr}
                        >
                          {color === clr && <Check className="h-4 w-4 text-white stroke-2" />}
                        </button>
                      ))}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <Label htmlFor="custom-color" className="text-xs mb-1.5 block">Custom color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="custom-color"
                          type="text"
                          value={customColor}
                          onChange={handleCustomColorChange}
                          placeholder="#HEX or name"
                          className="h-8 text-xs"
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          className="h-8"
                          onClick={applyCustomColor}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground text-center pt-1">
            These settings apply only to <br /> the selected icon preview.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default IconControls;
