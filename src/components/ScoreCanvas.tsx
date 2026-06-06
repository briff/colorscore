import React, { useRef } from 'react';
import { useScore } from '../store/ScoreContext';
import { useSelection, useSelectionDispatch } from '../store/SelectionContext';
import { useElementWidth } from '../hooks/useElementWidth';
import StaffRenderer from '../renderers/StaffRenderer';
import CirclesRenderer from '../renderers/CirclesRenderer';
import styles from './ScoreCanvas.module.css';

/** Default width used before the container has been measured (e.g. in tests). */
const DEFAULT_CANVAS_WIDTH = 800;
/** Smallest width we let the notation shrink to before allowing horizontal scroll. */
const MIN_CANVAS_WIDTH = 280;

interface ScoreCanvasProps {
  onNoteClick?: (partIndex: number, noteIndex: number) => void;
}

export const ScoreCanvas = React.forwardRef<HTMLDivElement, ScoreCanvasProps>(
  ({ onNoteClick }, ref) => {
    const score = useScore();
    const selection = useSelection();
    const selectionDispatch = useSelectionDispatch();
    const internalRef = useRef<HTMLDivElement>(null);

    // Use provided ref or internal ref
    const containerRef = (ref as React.RefObject<HTMLDivElement>) || internalRef;

    // Measure the container so the SVG notation fits the available width.
    // Clamp to a minimum so notation stays legible (the container scrolls
    // horizontally on very narrow screens rather than crushing the layout).
    const measuredWidth = useElementWidth(containerRef, DEFAULT_CANVAS_WIDTH);
    const canvasWidth = Math.max(measuredWidth, MIN_CANVAS_WIDTH);

    const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
      // If clicking on the canvas background (not a note), clear selection
      if (e.target === e.currentTarget) {
        selectionDispatch({ type: 'CLEAR_SELECTION' });
      }
    };

    const handleNoteClick = (partIndex: number, noteIndex: number, event?: React.MouseEvent) => {
      if (event?.shiftKey && selection) {
        selectionDispatch({
          type: 'EXTEND_SELECTION',
          payload: { noteIndex },
        });
      } else {
        selectionDispatch({
          type: 'SELECT_NOTE',
          payload: { partIndex, noteIndex },
        });
      }
      if (onNoteClick) {
        onNoteClick(partIndex, noteIndex);
      }
    };

    const renderContent = () => {
      if (score.renderingMode === 'staff') {
        return (
          <StaffRenderer
            score={score}
            selection={selection}
            onNoteClick={handleNoteClick}
            width={canvasWidth}
          />
        );
      } else if (score.renderingMode === 'circles') {
        return (
          <CirclesRenderer
            score={score}
            selection={selection}
            onNoteClick={handleNoteClick}
            width={canvasWidth}
          />
        );
      }
      return null;
    };

    return (
      <div
        ref={containerRef}
        className={styles.scoreCanvas}
        data-testid="score-canvas"
        onClick={handleCanvasClick}
      >
        {renderContent()}
      </div>
    );
  }
);

ScoreCanvas.displayName = 'ScoreCanvas';
