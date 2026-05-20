'use client';

import { useState } from 'react';
import { Trash2, Upload, Clock, Wand2, MessageSquareText } from 'lucide-react';
import { useReelEditor } from '@/lib/reelContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { v4 as uuidv4 } from 'uuid';
import { ReelImage } from '@/lib/types';
import { getProxiedImageUrl } from '@/lib/imageProxy';

export default function ImageManager() {
  const { state, dispatch } = useReelEditor();
  const reel = state.reel;
  const [imageUrl, setImageUrl] = useState('');

  if (!reel) return null;

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      const newImage: ReelImage = {
        id: uuidv4(),
        url: imageUrl,
        duration: 5,
        animation: 'zoom',
        position: reel.images.length,
        caption: '',
      };
      dispatch({ type: 'ADD_IMAGE', payload: newImage });
      setImageUrl('');
    }
  };

  const handleDeleteImage = (id: string) => {
    dispatch({ type: 'DELETE_IMAGE', payload: id });
  };

  const handleUpdateImageDuration = (id: string, duration: number) => {
    const image = reel.images.find((img) => img.id === id);
    if (image) {
      dispatch({
        type: 'UPDATE_IMAGE',
        payload: { ...image, duration },
      });
    }
  };

  const handleUpdateImageAnimation = (id: string, animation: ReelImage['animation']) => {
    const image = reel.images.find((img) => img.id === id);
    if (image) {
      dispatch({
        type: 'UPDATE_IMAGE',
        payload: { ...image, animation },
      });
    }
  };

  const handleUpdateImageCaption = (id: string, caption: string) => {
    const image = reel.images.find((img) => img.id === id);
    if (image) {
      dispatch({
        type: 'UPDATE_IMAGE',
        payload: { ...image, caption },
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Image Form */}
      <Card className="p-3 border-border">
        <Label htmlFor="image-url" className="text-xs mb-2 block font-semibold">
          Add Image URL
        </Label>
        <Input
          id="image-url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="text-xs mb-2"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddImage();
            }
          }}
        />
        <Button
          onClick={handleAddImage}
          size="sm"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
        >
          <Upload className="w-3 h-3 mr-1" />
          Add Image
        </Button>
      </Card>

      {/* Image List */}
      <div className="space-y-2">
        {reel.images.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">No images added yet</p>
        ) : (
          reel.images.map((image, index) => (
            <Card key={image.id} className="p-3 border-border bg-muted/30">
              {/* Image Preview */}
              <div className="aspect-video rounded-md overflow-hidden mb-2 bg-muted">
                <img
                  src={getProxiedImageUrl(image.url)}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    const imgEl = e.target as HTMLImageElement;
                    imgEl.style.display = 'none';
                    const parent = imgEl.parentElement;
                    if (parent) {
                      parent.style.display = 'flex';
                      parent.style.alignItems = 'center';
                      parent.style.justifyContent = 'center';
                    }
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                  Image not found
                </div>
              </div>

              {/* Caption Input */}
              <div className="mb-3">
                <Label className="text-xs flex items-center gap-1 mb-1">
                  <MessageSquareText className="w-3 h-3" />
                  Caption for this image
                </Label>
                <Textarea
                  value={image.caption || ''}
                  onChange={(e) => handleUpdateImageCaption(image.id, e.target.value)}
                  placeholder="Enter caption for this image..."
                  className="text-xs min-h-[60px] resize-none"
                  rows={2}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  This caption will appear in the bottom card when this image is shown
                </p>
              </div>

              {/* Duration Slider */}
              <div className="mb-3">
                <Label className="text-xs flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3" />
                  Duration: {image.duration}s
                </Label>
                <Slider
                  value={[image.duration]}
                  onValueChange={(value) => handleUpdateImageDuration(image.id, value[0])}
                  min={1}
                  max={10}
                  step={0.5}
                  className="w-full"
                />
              </div>

              {/* Animation Type */}
              <div className="mb-3">
                <Label className="text-xs flex items-center gap-1 mb-1">
                  <Wand2 className="w-3 h-3" />
                  Animation
                </Label>
                <Select
                  value={image.animation}
                  onValueChange={(value: any) =>
                    handleUpdateImageAnimation(image.id, value)
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="pan">Pan</SelectItem>
                    <SelectItem value="fade">Fade</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Delete Button */}
              <Button
                variant="destructive"
                size="sm"
                className="w-full text-xs h-7"
                onClick={() => handleDeleteImage(image.id)}
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
