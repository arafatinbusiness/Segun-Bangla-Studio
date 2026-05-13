'use client';

import { useState, useEffect, useRef } from 'react';
import { Music, Volume2, Play, Pause, Loader2, Disc3 } from 'lucide-react';
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
  const [loadingTrack, setLoadingTrack] = useState<string | null>(null);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPreview = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selecting when clicking play

    // If clicking the same track that's currently playing, toggle pause
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

    // Stop current audio if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Show loading state for this track
    setLoadingTrack(track.id);
    setPlaying(false);
    setCurrentAudioId(null);

    // Create and play new audio
    const audio = new Audio(track.file);
    audio.volume = 0.5;

    // When audio data starts loading
    audio.onloadstart = () => {
      setLoadingTrack(track.id);
    };

    // When enough data is loaded to play
    audio.oncanplay = () => {
      setLoadingTrack(null);
    };

    // When playback starts
    audio.onplay = () => {
      setPlaying(true);
      setCurrentAudioId(track.id);
      setLoadingTrack(null);
    };

    // When playback ends
    audio.onended = () => {
      setPlaying(false);
      setCurrentAudioId(null);
      setLoadingTrack(null);
    };

    // On error
    audio.onerror = () => {
      console.error('Failed to play audio:', track.file);
      setPlaying(false);
      setCurrentAudioId(null);
      setLoadingTrack(null);
    };

    // Start loading the audio
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

  const currentTrack = tracks.find((t) => t.id === reel.musicId);

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
        {tracks.map((track) => {
          const isSelected = reel.musicId === track.id;
          const isPlaying = currentAudioId === track.id && playing;
          const isLoading = loadingTrack === track.id;

          return (
            <Card
              key={track.id}
              className={`p-2 border cursor-pointer transition ${
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-muted/30 hover:bg-muted/50'
              } ${isPlaying ? 'ring-2 ring-primary/30' : ''}`}
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
                  <p className={`text-xs font-medium truncate ${isPlaying ? 'text-primary' : 'text-foreground'}`}>
                    {track.name}
                    {isPlaying && (
                      <span className="ml-1 inline-flex">
                        <span className="w-1 h-2 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-3 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-2 bg-primary rounded-full animate-bounce mx-[1px]" style={{ animationDelay: '300ms' }} />
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isLoading ? 'Loading...' : `${track.duration}s`}
                  </p>
                </div>
                {isSelected && !isPlaying && (
                  <Music className="w-3 h-3 mt-1 flex-shrink-0 text-primary" />
                )}
                {isPlaying && (
                  <Disc3 className="w-3 h-3 mt-1 flex-shrink-0 text-primary animate-spin" />
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
              Now Playing: {tracks.find(t => t.id === currentAudioId)?.name || 'Unknown'}
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

      {/* Current Selection Info */}
      {currentTrack && !playing && (
        <Card className="p-3 border-primary bg-primary/5">
          <p className="text-xs font-medium text-foreground mb-1">Selected</p>
          <p className="text-xs text-muted-foreground">{currentTrack.name}</p>
        </Card>
      )}

      {!reel.musicId && !currentAudioId && (
        <p className="text-xs text-muted-foreground text-center py-4">No music selected</p>
      )}
    </div>
  );
}
