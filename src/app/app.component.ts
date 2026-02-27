import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';
import { App } from '@capacitor/app';
import { ToastController } from '@ionic/angular';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { filter, map } from 'rxjs/operators';
import { ThemeService } from './settings/theme.service';
import { SplashScreen } from '@capacitor/splash-screen';
import { NetworkService } from './shared/services/network.service';
import { Subscription } from 'rxjs';

// Define the animation
const routeAnimations = trigger('routeAnimations', [
  transition('* <=> *', [
    style({ position: 'relative' }),
    query(':enter, :leave', [
      style({
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0 })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0 }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-out', style({ opacity: 1 }))
      ], { optional: true })
    ])
  ])
]);

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [routeAnimations]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Hotel Mart';
  token: any;
  animationData: string | null = null;
  showBackButton: boolean = false;
  private backButtonHandle?: any;
  private networkSub?: Subscription;

  private excludedRoutes = [
    '/home',
    '/login',
    '/admin/home',
    '/buyer/home',
    '/supplier'
  ];

  constructor(
    public authService: AuthService,
    private router: Router,
    private toastController: ToastController,
    private activatedRoute: ActivatedRoute,
    private themeService: ThemeService,
    private location: Location,
    private networkService: NetworkService
  ) {
    // Listen to route changes to toggle back button
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.checkBackButtonVisibility(event.urlAfterRedirects);
    });
  }

  ngOnInit() {
    this.token = localStorage.getItem('token');

    // Hide Splash Screen after app initializes
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);

    // Network toasts — powered by the centralized NetworkService.
    // NetworkService already handles all debouncing and resume awareness.
    // AppComponent only shows a toast when the stable status changes.
    this.networkSub = this.networkService.isOnline$.subscribe(isOnline => {
      if (!isOnline) {
        this.presentToast('You are offline. Showing cached content.', 'warning');
      } else {
        this.presentToast('Back online! Refreshing data...', 'success');
      }
    });

    // Handle Hardware Back Button — store handle so we can remove it in ngOnDestroy
    App.addListener('backButton', ({ canGoBack }: { canGoBack: boolean }) => {
      if (this.router.url === '/home' || this.router.url === '/login') {
        App.exitApp();
      } else if (canGoBack) {
        window.history.back();
      } else {
        this.router.navigate(['/home'], { replaceUrl: true });
      }
    }).then(handle => { this.backButtonHandle = handle; });

    // Listen for router events to get animation data
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => {
        let child = this.activatedRoute.firstChild;
        while (child) {
          if (child.firstChild) {
            child = child.firstChild;
          } else if (child.snapshot.data && child.snapshot.data['animation']) {
            return child.snapshot.data['animation'];
          } else {
            return null;
          }
        }
        return null;
      })
    ).subscribe((animation) => {
      this.animationData = animation;
    });

    // Navigate to last route if available (merged from previous broken code)
    const lastRoute = localStorage.getItem('lastRoute');
    if (lastRoute) {
      // Optional: we might not want to auto-navigate if the user is not logged in
      // but keeping logic similar to what might have been intended
      // this.router.navigateByUrl(lastRoute); 
    }
  }

  private checkBackButtonVisibility(url: string) {
    const isExcluded = this.excludedRoutes.some(route => {
      if (route === '/supplier') {
        return url === route || url === '/supplier/dashboard';
      }
      return url === route || url.startsWith(route + '?');
    });

    this.showBackButton = !isExcluded;
  }

  goBack() {
    this.location.back();
  }

  // Method to prepare route for animations
  prepareRoute(outlet: RouterOutlet) {
    return this.animationData;
  }

  ngOnDestroy() {
    this.networkSub?.unsubscribe();
    this.backButtonHandle?.remove();
  }

  async presentToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'bottom',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
