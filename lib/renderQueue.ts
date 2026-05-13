import { RenderJob } from './types';
import { adminDb } from './firebaseAdmin';

interface QueuedJob {
  reelId: string;
  config: any;
  createdAt: Date;
}

// In-memory queue for MVP (can upgrade to Upstash Redis later)
class RenderQueue {
  private queue: QueuedJob[] = [];
  private processing = false;
  private currentJob: QueuedJob | null = null;

  /**
   * Add a job to the queue
   */
  async enqueue(reelId: string, config: any): Promise<void> {
    const job: QueuedJob = {
      reelId,
      config,
      createdAt: new Date(),
    };

    this.queue.push(job);

    // Update Firestore status
    await adminDb.collection('reels').doc(reelId).update({
      status: 'pending',
      updatedAt: new Date().toISOString(),
    });

    // Start processing if not already running
    if (!this.processing) {
      this.processQueue();
    }
  }

  /**
   * Process jobs in the queue sequentially
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      this.currentJob = this.queue.shift()!;
      const reelId = this.currentJob.reelId;

      try {
        // Update status to processing
        await adminDb.collection('reels').doc(reelId).update({
          status: 'rendering',
          updatedAt: new Date().toISOString(),
          startedAt: new Date().toISOString(),
        });

        // TODO: Call Remotion rendering here
        // For now, simulate rendering
        console.log(`[v0] Rendering reel: ${reelId}`);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Update status to completed
        await adminDb.collection('reels').doc(reelId).update({
          status: 'completed',
          updatedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          // videoUrl would be set after actual rendering
        });
      } catch (error) {
        console.error(`[v0] Error rendering reel ${reelId}:`, error);
        await adminDb.collection('reels').doc(reelId).update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    this.processing = false;
    this.currentJob = null;
  }

  /**
   * Get current job
   */
  getCurrentJob(): QueuedJob | null {
    return this.currentJob;
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Check if currently processing
   */
  isProcessing(): boolean {
    return this.processing;
  }
}

// Singleton instance
export const renderQueue = new RenderQueue();
