import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { FooterComponent } from './shared/footer/footer.component';
import { HeaderComponent } from './shared/header/header.component';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = "3G's Botique Shop";
  showHeader = true;
  showFooter = true;
  private readonly siteUrl = 'https://online-boutique-tv00.onrender.com';
  private gaInitialized = false;

  constructor(
    private router: Router,
    private titleService: Title,
    private metaService: Meta,
    private renderer: Renderer2,
  ) {
    this.initializeAnalytics();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        // Hide header and footer on user and admin layout routes
        this.showHeader = !url.startsWith('/user') && !url.startsWith('/admin');
        this.showFooter = !url.startsWith('/user') && !url.startsWith('/admin');
        this.updateSeo(url);
        this.trackPageView(url);
      });
  }

  private initializeAnalytics(): void {
    if (!environment.production || !environment.gaMeasurementId) {
      return;
    }

    if (this.gaInitialized) {
      return;
    }

    const script = this.renderer.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${environment.gaMeasurementId}`;
    this.renderer.appendChild(document.head, script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function (...args: unknown[]) {
      window.dataLayer.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', environment.gaMeasurementId, {
      send_page_view: false,
    });
    this.gaInitialized = true;
  }

  private trackPageView(url: string): void {
    if (
      !environment.production ||
      !environment.gaMeasurementId ||
      !this.gaInitialized
    ) {
      return;
    }

    window.gtag('config', environment.gaMeasurementId, { page_path: url });
  }

  private updateSeo(url: string): void {
    const cleanUrl = url.split('?')[0];

    const defaultMeta = {
      title: "3G's Botique Shop | Curated Fashion and Community",
      description:
        "3G's Botique Shop is your destination for curated fashion, trend-forward products, and social shopping conversations.",
      keywords:
        "3G's botique shop, fashion products, stylish outfits, social shopping, fashion community",
    };

    const routeMeta: Record<
      string,
      { title: string; description: string; keywords: string }
    > = {
      '/': {
        title: "3G's Botique Shop | Discover Curated Fashion",
        description:
          "Discover premium fashion collections, get styling inspiration, and shop the latest arrivals at 3G's Botique Shop.",
        keywords:
          'fashion store, botique home, curated outfits, online fashion shopping',
      },
      '/products': {
        title: "Products | 3G's Botique Shop",
        description:
          "Browse 3G's Botique Shop products, compare styles, and find fashion pieces designed for every occasion.",
        keywords: 'botique products, fashion catalog, accessories',
      },
      '/user/community': {
        title: "Community Hub | 3G's Botique Shop",
        description:
          'Join the community hub to share posts, react to looks, and discuss your favorite products in real time.',
        keywords:
          'fashion community, product discussions, group chat, social shopping',
      },
      '/tracking': {
        title: "Order Tracking | 3G's Botique Shop",
        description:
          "Track your 3G's Botique Shop order status and stay updated from processing to final delivery.",
        keywords:
          'order tracking, delivery updates, shipment status, botique orders',
      },
      '/login': {
        title: "Login | 3G's Botique Shop",
        description:
          "Sign in to 3G's Botique Shop to manage your cart, orders, profile, and community activity.",
        keywords: 'botique login, customer account, secure sign in',
      },
      '/register': {
        title: "Create Account | 3G's Botique Shop",
        description:
          "Create your 3G's Botique Shop account to save favorites, place orders, and join the shopping community.",
        keywords:
          'register botique account, create account, online shopping profile',
      },
    };

    const matchedMeta =
      routeMeta[cleanUrl] ??
      (cleanUrl.startsWith('/product/')
        ? {
            title: "Product Details | 3G's Botique Shop",
            description:
              'View product details, pricing, and availability before adding your next favorite piece to cart.',
            keywords: 'product details, fashion item, botique product page',
          }
        : defaultMeta);

    this.titleService.setTitle(matchedMeta.title);
    this.metaService.updateTag({
      name: 'description',
      content: matchedMeta.description,
    });
    this.metaService.updateTag({
      name: 'keywords',
      content: matchedMeta.keywords,
    });
    this.metaService.updateTag({
      property: 'og:title',
      content: matchedMeta.title,
    });
    this.metaService.updateTag({
      property: 'og:description',
      content: matchedMeta.description,
    });
    this.metaService.updateTag({
      property: 'og:url',
      content: `${this.siteUrl}${cleanUrl}`,
    });
    this.metaService.updateTag({
      name: 'twitter:title',
      content: matchedMeta.title,
    });
    this.metaService.updateTag({
      name: 'twitter:description',
      content: matchedMeta.description,
    });
  }
}
