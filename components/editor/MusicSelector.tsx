'use client';

import { useState, useEffect } from 'react';
import { Music, Volume2, Play, Pause } from 'lucide-react';
import { useReelEditor } from '@/lib/reelContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MusicTrack } from '@/lib/types';

interface MusicCategory {
  [key: string]: MusicTrack[];
}

export default function MusicSelector() {
  const { state, dispatch } = useReelEditor();
  const reel = state.reel;
  const [musicData, setMusicData] = useState<MusicCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load music metadata
    fetch('/music/metadata.json')
      .then((res) => res.json())
      .then((data) => {
        setMusicData(data);
        const firstCategory = Object.keys(data)[0];
        setSelectedCategory(firstCategory);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load music metadata:', err);
        setLoading(false);
      });
  }, []);

  if (!reel || loading) {
    return <p className="text-xs text-muted-foreground">Loading music library...</p>;
  }

  if (!musicData) {
    return <p className="text-xs text-muted-foreground">Music library unavailable</p>;
  }

  const categories = Object.keys(musicData);
  const currentCategory = selectedCategory || categories[0];
  const tracks = musicData[currentCategory] || [];

  const currentTrack = tracks.find((t) => t.id === reel.musicId);

  const handleSelectMusic = (musicId: string) => {
    dispatch({
      type: 'UPDATE_MUSIC',
      payload: {
        musicId,
        volume: reel.musicVolume,
      },
    });
  };

  const handleVolumeChange = (volume: number[]) => {
    dispatch({
      type: 'UPDATE_MUSIC',
      payload: {
        musicId: reel.musicId,
        volume: volume[0],
      },
    });
  };

  return (
    <div className="space-y-4">
      {/* Category Selector */}
      <div>
        <Label className="text-xs mb-2 block">Category</Label>
        <Select value={currentCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => {
              const labelMap: Record<string, string> = {
                'joy': 'আনন্দ (Joy)',
                'intense': 'তীব্র (Intense)',
                'sad': 'বিষাদ (Sad)',
              };
              return (
                <SelectItem key={cat} value={cat} className="text-xs">
                  {labelMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Tracks List */}
      <div className="space-y-2">
        {tracks.map((track) => (
          <Card
            key={track.id}
            className={`p-2 border cursor-pointer transition ${
              reel.musicId === track.id
                ? 'border-primary bg-primary/10'
                : 'border-border bg-muted/30 hover:bg-muted/50'
            }`}
            onClick={() => handleSelectMusic(track.id)}
          >
            <div className="flex items-start gap-2">
              <Music className="w-3 h-3 mt-1 flex-shrink-0 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{track.name}</p>
                <p className="text-xs text-muted-foreground">{track.duration}s</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Volume Control */}
      {reel.musicId && (
        <Card className="p-3 border-border bg-muted/30">
          <Label className="text-xs flex items-center gap-1 mb-2">
            <Volume2 className="w-3 h-3" />
            Volume: {Math.round(reel.musicVolume * 100)}%
          </Label>
          <Slider
            value={[reel.musicVolume]}
            onValueChange={handleVolumeChange}
            min={0}
            max={1}
            step={0.05}
            className="w-full"
          />
        </Card>
      )}

      {/* Current Selection Info */}
      {currentTrack && (
        <Card className="p-3 border-primary bg-primary/5">
          <p className="text-xs font-medium text-foreground mb-1">Selected</p>
          <p className="text-xs text-muted-foreground">{currentTrack.name}</p>
        </Card>
      )}

      {!reel.musicId && (
        <p className="text-xs text-muted-foreground text-center py-4">No music selected</p>
      )}
    </div>
  );
}
