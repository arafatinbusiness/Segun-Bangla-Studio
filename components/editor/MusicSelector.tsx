'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Volume2, Play, Pause, Loader2, Disc3, CheckCircle2, Music2 } from 'lucide-react';
import { useReelEditor } from '@/lib/reelContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Find the selected track name across all categories
  const findTrackById = (id: string): MusicTrack | null => {
    if (!musicData) return null;
    for (const cat of Object.keys(musicData)) {
      const track = musicData[cat].find((t) => t.id === id);
      if (track) return track;
    }
    return null;
  };

  const selectedTrack = reel?.musicId ? findTrackById(reel.musicId) : null;

  useEffect(() => {
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

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPreview = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation();

    if (currentAudioId === track.id && audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setPlaying(true);
      } else {
        audioRef.current.pause();
        setPlaying(false);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    setLoadingTrack(track.id);
    setPlaying(false);
    setCurrentAudioId(null);

    const audio = new Audio(track.file);
    audio.volume = 0.5;

    audio.onloadstart = () => setLoadingTrack(track.id);
    audio.oncanplay = () => setLoadingTrack(null);
    audio.onplay = () => {
      setPlaying(true);
      setCurrentAudioId(track.id);
      setLoadingTrack(null);
    };
    audio.onended = () => {
      setPlaying(false);
      setCurrentAudioId(null);
      setLoadingTrack(null);
    };
    audio.onerror = () => {
      console.error('Failed to play audio:', track.file);
      setPlaying(false);
      setCurrentAudioId(null);
      setLoadingTrack(null);
    };

    audio.load();
    audio.play().catch((err) => {
      console.error('Audio play error:', err);
      setPlaying(false);
      setCurrentAudioId(null);
      setLoadingTrack(null);
    });

    audioRef.current = audio;
  };

  const handleSelectMusic = (musicId: string) => {
    if (!reel) return;
    dispatch({
      type: 'UPDATE_MUSIC',
      payload: {
        musicId,
        volume: reel.musicVolume,
      },
    });
  };

  const handleVolumeChange = (volume: number[]) => {
    if (!reel) return;
    dispatch({
      type: 'UPDATE_MUSIC',
      payload: {
        musicId: reel.musicId,
        volume: volume[0],
      },
    });
  };

  if (!reel || loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        <p className="text-xs text-muted-foreground ml-2">Loading music library...</p>
      </div>
    );
  }

  if (!musicData) {
    return <p className="text-xs text-muted-foreground">Music library unavailable</p>;
  }

  const categories = Object.keys(musicData);
  const currentCategory = selectedCategory || categories[0];
  const tracks = musicData[currentCategory] || [];

  return (
    <div className="space-y-4">
      {/* Selected Music Banner */}
      {selectedTrack && (
        <Card className="p-3 border-2 border-primary bg-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Music2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-primary">Selected Music</p>
              <p className="text-sm font-bold text-foreground truncate">{selectedTrack.name}</p>
              <p className="text-[10px] text-muted-foreground">{selectedTrack.duration}s • {selectedTrack.category}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
          </div>
        </Card>
      )}

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
        {tracks.map((track) => {
          const isSelected = reel.musicId === track.id;
          const isPlaying = currentAudioId === track.id && playing;
          const isLoading = loadingTrack === track.id;

          return (
            <Card
              key={track.id}
              className={`p-2 border cursor-pointer transition ${
                isSelected
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              } ${isPlaying ? 'ring-2 ring-primary/40' : ''}`}
              onClick={() => handleSelectMusic(track.id)}
            >
              <div className="flex items-start gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  onClick={(e) => handlePlayPreview(track, e)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 text-primary animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-3 h-3 text-primary" />
                  ) : (
                    <Play className="w-3 h-3 text-primary" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`text-xs font-medium truncate ${isPlaying ? 'text-primary' : isSelected ? 'text-foreground font-bold' : 'text-foreground'}`}>
                      {track.name}
                    </p>
                    {isSelected && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-primary text-primary">
                        Selected
                      </Badge>
                    )}
                    {isPlaying && (
                      <span className="ml-1 inline-flex">
                        <span className="w-1 h-2 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-3 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-2 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? 'Loading...' : `${track.duration}s`}
                  </p>
                </div>
                {isSelected && !isPlaying && (
                  <CheckCircle2 className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-primary" />
                )}
                {isPlaying && (
                  <Disc3 className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-primary animate-spin" />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Now Playing Indicator */}
      {currentAudioId && playing && (
        <Card className="p-2 border-primary/50 bg-primary/5">
          <div className="flex items-center gap-2">
            <Disc3 className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
            <p className="text-xs text-primary font-medium truncate">
              Now Playing: {findTrackById(currentAudioId)?.name || 'Unknown'}
            </p>
          </div>
        </Card>
      )}

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

      {!reel.musicId && !currentAudioId && (
        <div className="text-center py-6">
          <Music className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No music selected</p>
          <p className="text-[10px] text-muted-foreground/60 mt-1">Click a track to add music to your video</p>
        </div>
      )}
    </div>
  );
}
