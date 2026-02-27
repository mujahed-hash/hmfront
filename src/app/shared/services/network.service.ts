import { Injectable, NgZone } from '@angular/core';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { Platform } from '@ionic/angular';
import { BehaviorSubject, fromEvent, merge, timer, Observable } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, filter, switchMap, take } from 'rxjs/operators';

/**
 * NetworkService
 *
 * Provides a reliable, debounced network status stream.
 *
 * Key behaviours:
 *  - On native (Capacitor): listens to the Capacitor Network plugin.
 *  - On browser: listens to window online/offline events.
 *  - DEBOUNCE: Status changes are debounced by 1500 ms so brief connectivity
 *    blips during Android WebView wake-up don't trigger the offline screen.
 *  - RESUME AWARENESS: When the app resumes from background, a 2-second grace
 *    period is applied before any "offline" status can propagate. This is the
 *    primary fix for the background-switch issue.
 *  - NO DUPLICATE LISTENERS: Listeners are attached once and tracked with
 *    a boolean flag.
 */
@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  /** The raw subject — receives every change from the OS/Capacitor. */
  private rawStatusSubject = new BehaviorSubject<boolean>(true);

  /** Debounced/stable subject — what the rest of the app should use. */
  private stableStatusSubject = new BehaviorSubject<boolean>(true);

  /** True during the grace period after app resumes from background. */
  private isResuming = false;

  /** Prevent registering listeners more than once. */
  private listenersRegistered = false;

  /** Public stream — emits only stable, deduplicated online/offline states. */
  isOnline$: Observable<boolean> = this.stableStatusSubject.asObservable().pipe(
    distinctUntilChanged()
  );

  constructor(private platform: Platform, private ngZone: NgZone) {
    this.initializeNetworkStatus();
  }

  /**
   * Set up all listeners. Called once in the constructor.
   */
  private async initializeNetworkStatus(): Promise<void> {
    await this.platform.ready();

    // Pipe the raw subject through a debounce into the stable subject.
    // We only allow "offline" to propagate if it stays offline for 1500ms.
    // "online" is propagated almost immediately (200 ms) for good UX.
    this.rawStatusSubject.pipe(
      distinctUntilChanged(),
      switchMap(isOnline => {
        if (isOnline) {
          // Going online: propagate quickly
          return timer(200).pipe(map(() => isOnline));
        } else {
          // Going offline: wait for 1500ms to confirm it's not a blip
          return timer(1500).pipe(map(() => isOnline));
        }
      })
    ).subscribe(isOnline => {
      // During resume grace period, never propagate false
      if (!isOnline && this.isResuming) {
        console.log('[NetworkService] Suppressing offline signal during resume grace period.');
        return;
      }
      this.ngZone.run(() => {
        this.stableStatusSubject.next(isOnline);
      });
    });

    if (this.platform.is('capacitor')) {
      await this.setupCapacitorListeners();
    } else {
      this.setupBrowserListeners();
    }
  }

  /**
   * Sets up Capacitor Network and App listeners (native only).
   * Safely idempotent — will not add listeners twice.
   */
  private async setupCapacitorListeners(): Promise<void> {
    if (this.listenersRegistered) return;
    this.listenersRegistered = true;

    // Get initial status
    const status = await Network.getStatus();
    this.rawStatusSubject.next(status.connected);
    this.stableStatusSubject.next(status.connected); // seed with real initial value

    // Network status changes
    Network.addListener('networkStatusChange', (status) => {
      console.log('[NetworkService] Network status change:', status.connected);
      this.rawStatusSubject.next(status.connected);
    });

    // App lifecycle: set resume grace period
    App.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // App came to foreground — start grace period
        console.log('[NetworkService] App resumed. Starting grace period...');
        this.isResuming = true;

        // After 2 seconds, check real network status and end grace period
        setTimeout(async () => {
          const currentStatus = await Network.getStatus();
          console.log('[NetworkService] Grace period over. Real status:', currentStatus.connected);
          this.isResuming = false;
          // Push actual status after grace period
          this.rawStatusSubject.next(currentStatus.connected);
        }, 2000);
      }
    });
  }

  /**
   * Browser fallback: uses navigator.onLine and window events.
   */
  private setupBrowserListeners(): void {
    this.rawStatusSubject.next(navigator.onLine);
    this.stableStatusSubject.next(navigator.onLine);

    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false))
    ).subscribe(isOnline => {
      this.rawStatusSubject.next(isOnline);
    });
  }

  /**
   * One-shot check: returns a Promise resolving to the current stable status.
   * NetworkGuard uses this. On native, it re-queries the OS for accuracy.
   */
  async checkNetworkStatus(): Promise<boolean> {
    if (this.platform.is('capacitor')) {
      // During resume, optimistically assume online and let the stable
      // stream correct itself after the grace period ends.
      if (this.isResuming) {
        console.log('[NetworkService] checkNetworkStatus called during resume — returning true.');
        return true;
      }
      const status = await Network.getStatus();
      this.rawStatusSubject.next(status.connected);
      return status.connected;
    } else {
      return navigator.onLine;
    }
  }

  /**
   * Returns a Promise that resolves to the first stable online status.
   * Useful for guards that need to wait for the stream to settle.
   */
  awaitStableStatus(): Promise<boolean> {
    return new Promise(resolve => {
      // Immediately resolve with current value if we're not in a transitioning state
      this.isOnline$.pipe(take(1)).subscribe(resolve);
    });
  }
}