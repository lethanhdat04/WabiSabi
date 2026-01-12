"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// YouTube Player API types
declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        config: YTPlayerConfig
      ) => YTPlayer;
      PlayerState: {
        UNSTARTED: number;
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        CUED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YTPlayerConfig {
  videoId: string;
  playerVars?: {
    autoplay?: 0 | 1;
    controls?: 0 | 1;
    modestbranding?: 0 | 1;
    rel?: 0 | 1;
    showinfo?: 0 | 1;
    origin?: string;
    enablejsapi?: 0 | 1;
    playsinline?: 0 | 1;
  };
  events?: {
    onReady?: (event: YTPlayerEvent) => void;
    onStateChange?: (event: YTStateChangeEvent) => void;
    onError?: (event: YTErrorEvent) => void;
  };
}

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  destroy: () => void;
  getIframe: () => HTMLIFrameElement;
}

interface YTPlayerEvent {
  target: YTPlayer;
}

interface YTStateChangeEvent {
  target: YTPlayer;
  data: number;
}

interface YTErrorEvent {
  target: YTPlayer;
  data: number;
}

export interface UseYouTubePlayerOptions {
  videoId: string;
  onTimeUpdate?: (currentTime: number) => void;
  onStateChange?: (state: PlayerState) => void;
  onReady?: () => void;
}

export type PlayerState = "unstarted" | "ended" | "playing" | "paused" | "buffering" | "cued";

export interface YouTubePlayerControls {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setPlaybackRate: (rate: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  isReady: boolean;
  playerState: PlayerState;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  apiLoadPromise = new Promise((resolve) => {
    // Check if already loaded
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }

    // Create callback
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    // Load script
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

function getPlayerState(state: number): PlayerState {
  switch (state) {
    case -1:
      return "unstarted";
    case 0:
      return "ended";
    case 1:
      return "playing";
    case 2:
      return "paused";
    case 3:
      return "buffering";
    case 5:
      return "cued";
    default:
      return "unstarted";
  }
}

export function useYouTubePlayer(
  containerId: string,
  options: UseYouTubePlayerOptions
): YouTubePlayerControls {
  const playerRef = useRef<YTPlayer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [playerState, setPlayerState] = useState<PlayerState>("unstarted");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const timeUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const optionsRef = useRef(options);

  // Keep options ref up to date
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize player
  useEffect(() => {
    let mounted = true;

    async function initPlayer() {
      await loadYouTubeAPI();

      if (!mounted) return;

      // Destroy existing player if any
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      playerRef.current = new window.YT.Player(containerId, {
        videoId: options.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          playsinline: 1,
        },
        events: {
          onReady: (event) => {
            if (!mounted) return;
            setIsReady(true);
            setDuration(event.target.getDuration());
            optionsRef.current.onReady?.();
          },
          onStateChange: (event) => {
            if (!mounted) return;
            const state = getPlayerState(event.data);
            setPlayerState(state);
            optionsRef.current.onStateChange?.(state);

            // Start/stop time update interval
            if (state === "playing") {
              startTimeUpdate();
            } else {
              stopTimeUpdate();
              // Update time one more time when paused
              if (playerRef.current) {
                const time = playerRef.current.getCurrentTime();
                setCurrentTime(time);
                optionsRef.current.onTimeUpdate?.(time);
              }
            }
          },
          onError: (event) => {
            console.error("YouTube Player Error:", event.data);
          },
        },
      });
    }

    function startTimeUpdate() {
      stopTimeUpdate();
      timeUpdateIntervalRef.current = setInterval(() => {
        if (playerRef.current && mounted) {
          const time = playerRef.current.getCurrentTime();
          setCurrentTime(time);
          optionsRef.current.onTimeUpdate?.(time);
        }
      }, 100); // Update every 100ms for smooth subtitle sync
    }

    function stopTimeUpdate() {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
        timeUpdateIntervalRef.current = null;
      }
    }

    initPlayer();

    return () => {
      mounted = false;
      stopTimeUpdate();
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerId, options.videoId]);

  const play = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const pause = useCallback(() => {
    playerRef.current?.pauseVideo();
  }, []);

  const seekTo = useCallback((seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
      setCurrentTime(seconds);
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    if (playerRef.current) {
      playerRef.current.setPlaybackRate(rate);
      setPlaybackRateState(rate);
    }
  }, []);

  const getCurrentTimeValue = useCallback(() => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  const getDurationValue = useCallback(() => {
    return playerRef.current?.getDuration() ?? 0;
  }, []);

  return {
    play,
    pause,
    seekTo,
    setPlaybackRate,
    getCurrentTime: getCurrentTimeValue,
    getDuration: getDurationValue,
    isReady,
    playerState,
    currentTime,
    duration,
    playbackRate,
  };
}
