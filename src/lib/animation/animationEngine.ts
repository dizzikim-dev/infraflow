import { AnimationSequence, AnimationStep, EdgeFlowType } from '@/types';

export interface AnimationState {
  isPlaying: boolean;
  currentSequence: AnimationSequence | null;
  currentStepIndex: number;
  speed: number; // 0.5x, 1x, 2x
  activeEdges: Set<string>; // Currently animated edge IDs
  activeFlows: Map<string, FlowParticle[]>; // Edge ID -> particles
}

export interface FlowParticle {
  id: string;
  edgeId: string;
  progress: number; // 0 to 1
  type: EdgeFlowType;
  startTime: number;
  duration: number;
}

export type AnimationEventType =
  | 'play'
  | 'pause'
  | 'stop'
  | 'step-start'
  | 'step-end'
  | 'sequence-end'
  | 'particle-update';

export interface AnimationEvent {
  type: AnimationEventType;
  step?: AnimationStep;
  stepIndex?: number;
  particles?: FlowParticle[];
}

export type AnimationEventListener = (event: AnimationEvent) => void;

/**
 * Animation Engine - Controls data flow animations
 */
export class AnimationEngine {
  private state: AnimationState;
  private listeners: Set<AnimationEventListener> = new Set();
  private animationFrameId: number | null = null;
  private lastTimestamp: number = 0;

  constructor() {
    this.state = {
      isPlaying: false,
      currentSequence: null,
      currentStepIndex: -1,
      speed: 1,
      activeEdges: new Set(),
      activeFlows: new Map(),
    };
  }

  /**
   * Get current animation state
   */
  getState(): Readonly<AnimationState> {
    return { ...this.state };
  }

  /**
   * Subscribe to animation events
   */
  subscribe(listener: AnimationEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: AnimationEvent) {
    this.listeners.forEach((listener) => listener(event));
  }

  /**
   * Load an animation sequence
   */
  loadSequence(sequence: AnimationSequence) {
    this.stop();
    this.state.currentSequence = sequence;
    this.state.currentStepIndex = -1;
  }

  /**
   * Play the loaded sequence
   */
  play() {
    if (!this.state.currentSequence) return;

    this.state.isPlaying = true;
    this.emit({ type: 'play' });

    if (this.state.currentStepIndex < 0) {
      this.state.currentStepIndex = 0;
      this.startCurrentStep();
    }

    this.lastTimestamp = performance.now();
    this.animationLoop();
  }

  /**
   * Pause the animation
   */
  pause() {
    this.state.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emit({ type: 'pause' });
  }

  /**
   * Stop and reset the animation
   */
  stop() {
    this.pause();
    this.state.currentStepIndex = -1;
    this.state.activeEdges.clear();
    this.state.activeFlows.clear();
    this.emit({ type: 'stop' });
  }

  /**
   * Set playback speed
   */
  setSpeed(speed: number) {
    this.state.speed = Math.max(0.25, Math.min(4, speed));
  }

  /**
   * Skip to next step
   */
  nextStep() {
    if (!this.state.currentSequence) return;

    const sequence = this.state.currentSequence;
    if (this.state.currentStepIndex < sequence.steps.length - 1) {
      this.state.currentStepIndex++;
      this.startCurrentStep();
    } else if (sequence.loop) {
      this.state.currentStepIndex = 0;
      this.startCurrentStep();
    }
  }

  /**
   * Go to previous step
   */
  prevStep() {
    if (!this.state.currentSequence) return;

    if (this.state.currentStepIndex > 0) {
      this.state.currentStepIndex--;
      this.startCurrentStep();
    }
  }

  private startCurrentStep() {
    const sequence = this.state.currentSequence;
    if (!sequence) return;

    const step = sequence.steps[this.state.currentStepIndex];
    if (!step) return;

    const edgeId = `e-${step.from}-${step.to}`;

    // Create a new particle for this step
    const particle: FlowParticle = {
      id: `particle-${Date.now()}-${Math.random()}`,
      edgeId,
      progress: 0,
      type: step.type,
      startTime: performance.now(),
      duration: step.duration / this.state.speed,
    };

    // Add to active flows
    const edgeParticles = this.state.activeFlows.get(edgeId) || [];
    edgeParticles.push(particle);
    this.state.activeFlows.set(edgeId, edgeParticles);
    this.state.activeEdges.add(edgeId);

    this.emit({
      type: 'step-start',
      step,
      stepIndex: this.state.currentStepIndex,
    });
  }

  private animationLoop() {
    if (!this.state.isPlaying) return;

    const now = performance.now();
    const deltaTime = now - this.lastTimestamp;
    this.lastTimestamp = now;

    // Update all active particles
    const completedEdges: string[] = [];

    for (const [edgeId, particles] of this.state.activeFlows.entries()) {
      const activeParticles = particles.filter((particle) => {
        const elapsed = now - particle.startTime;
        particle.progress = Math.min(1, elapsed / particle.duration);
        return particle.progress < 1;
      });

      if (activeParticles.length === 0) {
        completedEdges.push(edgeId);
      } else {
        this.state.activeFlows.set(edgeId, activeParticles);
      }
    }

    // Clean up completed edges
    for (const edgeId of completedEdges) {
      this.state.activeFlows.delete(edgeId);
      this.state.activeEdges.delete(edgeId);
    }

    // Emit particle update
    const allParticles = Array.from(this.state.activeFlows.values()).flat();
    this.emit({
      type: 'particle-update',
      particles: allParticles,
    });

    // Check if current step is complete and should advance
    const sequence = this.state.currentSequence;
    if (sequence && this.state.activeFlows.size === 0) {
      const currentStep = sequence.steps[this.state.currentStepIndex];

      this.emit({
        type: 'step-end',
        step: currentStep,
        stepIndex: this.state.currentStepIndex,
      });

      // Move to next step after delay
      if (this.state.currentStepIndex < sequence.steps.length - 1) {
        const nextStep = sequence.steps[this.state.currentStepIndex + 1];
        const delay = (nextStep.delay || 0) / this.state.speed;

        setTimeout(() => {
          if (this.state.isPlaying) {
            this.state.currentStepIndex++;
            this.startCurrentStep();
          }
        }, delay);
      } else if (sequence.loop) {
        setTimeout(() => {
          if (this.state.isPlaying) {
            this.state.currentStepIndex = 0;
            this.startCurrentStep();
          }
        }, 500 / this.state.speed);
      } else {
        this.emit({ type: 'sequence-end' });
        this.state.isPlaying = false;
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animationLoop());
  }

  /**
   * Destroy the engine and clean up
   */
  destroy() {
    this.stop();
    this.listeners.clear();
  }
}

// Singleton instance
let engineInstance: AnimationEngine | null = null;

export function getAnimationEngine(): AnimationEngine {
  if (!engineInstance) {
    engineInstance = new AnimationEngine();
  }
  return engineInstance;
}
