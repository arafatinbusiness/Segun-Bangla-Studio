'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ReelConfig, ReelImage, TemplateType } from './types';

interface ReelEditorState {
  reel: ReelConfig | null;
  loading: boolean;
  error: string | null;
}

type ReelEditorAction =
  | { type: 'SET_REEL'; payload: ReelConfig }
  | { type: 'UPDATE_HEADLINE'; payload: string }
  | { type: 'UPDATE_SUBTITLE'; payload: string }
  | { type: 'UPDATE_TEMPLATE'; payload: TemplateType }
  | { type: 'UPDATE_DURATION'; payload: number }
  | { type: 'UPDATE_MUSIC'; payload: { musicId: string; volume: number } }
  | { type: 'ADD_IMAGE'; payload: ReelImage }
  | { type: 'UPDATE_IMAGE'; payload: ReelImage }
  | { type: 'DELETE_IMAGE'; payload: string }
  | { type: 'REORDER_IMAGES'; payload: ReelImage[] }
  | { type: 'UPDATE_BOTTOM_CARD_COLOR'; payload: string }
  | { type: 'UPDATE_BOTTOM_BAR_COLOR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' };

const initialState: ReelEditorState = {
  reel: null,
  loading: false,
  error: null,
};

function reelReducer(state: ReelEditorState, action: ReelEditorAction): ReelEditorState {
  switch (action.type) {
    case 'SET_REEL':
      return {
        ...state,
        reel: action.payload,
        error: null,
      };

    case 'UPDATE_HEADLINE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              headlineText: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_SUBTITLE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              subtitleText: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_TEMPLATE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              template: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_DURATION':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              duration: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_MUSIC':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              musicId: action.payload.musicId,
              musicVolume: action.payload.volume,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'ADD_IMAGE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              images: [...state.reel.images, action.payload],
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_IMAGE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              images: state.reel.images.map((img) =>
                img.id === action.payload.id ? action.payload : img
              ),
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'DELETE_IMAGE':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              images: state.reel.images.filter((img) => img.id !== action.payload),
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'REORDER_IMAGES':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              images: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_BOTTOM_CARD_COLOR':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              bottomCardColor: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'UPDATE_BOTTOM_BAR_COLOR':
      return {
        ...state,
        reel: state.reel
          ? {
              ...state.reel,
              bottomBarColor: action.payload,
              updatedAt: new Date().toISOString(),
            }
          : null,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface ReelEditorContextType {
  state: ReelEditorState;
  dispatch: React.Dispatch<ReelEditorAction>;
}

const ReelEditorContext = createContext<ReelEditorContextType | undefined>(undefined);

export function ReelEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reelReducer, initialState);

  return (
    <ReelEditorContext.Provider value={{ state, dispatch }}>
      {children}
    </ReelEditorContext.Provider>
  );
}

export function useReelEditor() {
  const context = useContext(ReelEditorContext);
  if (context === undefined) {
    throw new Error('useReelEditor must be used within ReelEditorProvider');
  }
  return context;
}
