import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Crop,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Minus,
  Plus
} from 'lucide-react';
import { 
  PageElement, 
  PhotoElement, 
  TextElement,
  FONT_FAMILIES,
  BACKGROUND_COLORS,
  PageBackground
} from './types';

interface InspectorPanelProps {
  selectedElement: PageElement | undefined;
  pageBackground: PageBackground;
  onUpdateElement: (id: string, updates: Partial<PageElement>) => void;
  onDeleteElement: (id: string) => void;
  onUpdateBackground: (background: PageBackground) => void;
}

export function InspectorPanel({
  selectedElement,
  pageBackground,
  onUpdateElement,
  onDeleteElement,
  onUpdateBackground
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState('element');

  const renderPhotoInspector = (element: PhotoElement) => (
    <div className="space-y-6">
      {/* Position & Size */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Positie & Formaat
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs">X (%)</Label>
            <Input
              type="number"
              value={Math.round(element.x)}
              onChange={(e) => onUpdateElement(element.id, { x: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Y (%)</Label>
            <Input
              type="number"
              value={Math.round(element.y)}
              onChange={(e) => onUpdateElement(element.id, { y: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Breedte (%)</Label>
            <Input
              type="number"
              value={Math.round(element.width)}
              onChange={(e) => onUpdateElement(element.id, { width: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div>
            <Label className="text-xs">Hoogte (%)</Label>
            <Input
              type="number"
              value={Math.round(element.height)}
              onChange={(e) => onUpdateElement(element.id, { height: Number(e.target.value) })}
              className="h-8"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Rotation */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Rotatie
        </h4>
        <div className="flex items-center gap-2">
          <Slider
            value={[element.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => onUpdateElement(element.id, { rotation: value })}
            className="flex-1"
          />
          <span className="text-xs w-10 text-right">{element.rotation}°</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onUpdateElement(element.id, { rotation: element.rotation - 90 })}
          >
            <RotateCw className="h-4 w-4 mr-1 rotate-180" />
            -90°
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onUpdateElement(element.id, { rotation: element.rotation + 90 })}
          >
            <RotateCw className="h-4 w-4 mr-1" />
            +90°
          </Button>
        </div>
      </div>

      <Separator />

      {/* Crop */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Bijsnijden
        </h4>
        <div className="space-y-2">
          <div>
            <Label className="text-xs">Zoom (%)</Label>
            <Slider
              value={[Math.round(10000 / Math.max(1, element.cropWidth))]}
              min={100}
              max={300}
              step={1}
              onValueChange={([value]) => {
                const cropSize = Math.max(10, Math.min(100, 10000 / Math.max(1, value)));
                onUpdateElement(element.id, { 
                  cropWidth: cropSize, 
                  cropHeight: cropSize 
                });
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X positie</Label>
              <Slider
                value={[element.cropX + 50]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => onUpdateElement(element.id, { cropX: value - 50 })}
              />
            </div>
            <div>
              <Label className="text-xs">Y positie</Label>
              <Slider
                value={[element.cropY + 50]}
                min={0}
                max={100}
                step={1}
                onValueChange={([value]) => onUpdateElement(element.id, { cropY: value - 50 })}
              />
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onUpdateElement(element.id, { 
            cropX: 0, cropY: 0, cropWidth: 100, cropHeight: 100 
          })}
        >
          <Crop className="h-4 w-4 mr-2" />
          Reset bijsnijden
        </Button>
      </div>

      <Separator />

      {/* Delete */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => onDeleteElement(element.id)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Verwijderen
      </Button>
    </div>
  );

  const renderTextInspector = (element: TextElement) => (
    <div className="space-y-6">
      {/* Font */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Lettertype
        </h4>
        <Select
          value={element.fontFamily}
          onValueChange={(value) => onUpdateElement(element.id, { fontFamily: value })}
        >
          <SelectTrigger className="h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_FAMILIES.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Font size */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { fontSize: Math.max(8, element.fontSize - 2) })}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <Input
            type="number"
            value={element.fontSize}
            onChange={(e) => onUpdateElement(element.id, { fontSize: Number(e.target.value) })}
            className="h-8 text-center"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { fontSize: Math.min(120, element.fontSize + 2) })}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Style buttons */}
        <div className="flex gap-2">
          <Button
            variant={element.fontWeight === 'bold' ? 'secondary' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { 
              fontWeight: element.fontWeight === 'bold' ? 'normal' : 'bold' 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={element.fontStyle === 'italic' ? 'secondary' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { 
              fontStyle: element.fontStyle === 'italic' ? 'normal' : 'italic' 
            })}
          >
            <Italic className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Alignment */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Uitlijning
        </h4>
        <div className="flex gap-2">
          <Button
            variant={element.textAlign === 'left' ? 'secondary' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'left' })}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === 'center' ? 'secondary' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'center' })}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={element.textAlign === 'right' ? 'secondary' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateElement(element.id, { textAlign: 'right' })}
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Separator />

      {/* Color */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Kleur
        </h4>
        <div className="flex gap-1 flex-wrap">
          {['#FFFFFF', '#000000', '#333333', '#666666', '#E66016', '#AA3016'].map((color) => (
            <button
              key={color}
              className={cn(
                "w-6 h-6 rounded border-2 transition-all",
                element.color === color ? "border-primary scale-110" : "border-border"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onUpdateElement(element.id, { color })}
            />
          ))}
        </div>
      </div>

      <Separator />

      {/* Opacity */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Dekking
        </h4>
        <Slider
          value={[element.opacity * 100]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => onUpdateElement(element.id, { opacity: value / 100 })}
        />
      </div>

      <Separator />

      {/* Delete */}
      <Button
        variant="destructive"
        size="sm"
        className="w-full"
        onClick={() => onDeleteElement(element.id)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Verwijderen
      </Button>
    </div>
  );

  const renderBackgroundPanel = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Achtergrondkleur
        </h4>
        <div className="grid grid-cols-5 gap-2">
          {BACKGROUND_COLORS.map((color) => (
            <button
              key={color}
              className={cn(
                "aspect-square rounded-lg border-2 transition-all hover:scale-105",
                pageBackground.value === color ? "border-primary ring-2 ring-primary/20" : "border-border"
              )}
              style={{ backgroundColor: color }}
              onClick={() => onUpdateBackground({ type: 'solid', value: color })}
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Aangepaste kleur
        </h4>
        <Input
          type="color"
          value={pageBackground.value}
          onChange={(e) => onUpdateBackground({ type: 'solid', value: e.target.value })}
          className="h-10 w-full cursor-pointer"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card/50 backdrop-blur-sm">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b">
          <TabsTrigger value="element" className="rounded-none">
            Element
          </TabsTrigger>
          <TabsTrigger value="page" className="rounded-none">
            Pagina
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="element" className="m-0 p-4">
            {selectedElement ? (
              selectedElement.type === 'photo' 
                ? renderPhotoInspector(selectedElement as PhotoElement)
                : renderTextInspector(selectedElement as TextElement)
            ) : (
              <div className="flex h-40 items-center justify-center text-center text-sm text-muted-foreground">
                <p>Selecteer een element om te bewerken</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="page" className="m-0 p-4">
            {renderBackgroundPanel()}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
