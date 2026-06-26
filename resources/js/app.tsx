import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { Toaster } from "@/components/ui/sonner"

const appName = "Stamp Bayan";
const analyticsSessionKey = 'stampbayan_product_analytics_session';

function analyticsSessionId() {
    const existing = window.sessionStorage.getItem(analyticsSessionKey);

    if (existing) {
        return existing;
    }

    const generated = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.sessionStorage.setItem(analyticsSessionKey, generated);

    return generated;
}

function csrfToken() {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
}

function trackProductEvent(eventName: string, metadata: Record<string, unknown> = {}) {
    const path = typeof metadata.path === 'string' ? metadata.path : window.location.pathname;
    const payload = {
        event_name: eventName,
        session_id: analyticsSessionId(),
        path,
        url: window.location.href,
        referrer: document.referrer,
        page_title: document.title,
        element_label: typeof metadata.element_label === 'string' ? metadata.element_label.slice(0, 255) : undefined,
        duration_ms: typeof metadata.duration_ms === 'number' ? Math.round(metadata.duration_ms) : undefined,
        metadata,
    };

    fetch('/product-analytics/events', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(payload),
        keepalive: eventName === 'page_duration',
    }).catch(() => {
        // Analytics must never interrupt the app experience.
    });
}

function startProductAnalytics() {
    let pageStartedAt = Date.now();
    let trackedPath = window.location.pathname;

    const sendDuration = () => {
        const durationMs = Date.now() - pageStartedAt;

        if (durationMs > 1000) {
            trackProductEvent('page_duration', {
                duration_ms: durationMs,
                path: trackedPath,
            });
        }

        pageStartedAt = Date.now();
        trackedPath = window.location.pathname;
    };

    window.addEventListener('load', () => trackProductEvent('page_view'));
    router.on('navigate', () => {
        sendDuration();
        trackProductEvent('page_view');
    });

    document.addEventListener(
        'click',
        (event) => {
            const target = event.target instanceof Element
                ? event.target.closest('button,a,[role="button"],[data-track]')
                : null;

            if (!target) {
                return;
            }

            const label =
                target.getAttribute('data-track') ||
                target.getAttribute('aria-label') ||
                target.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) ||
                target.getAttribute('href') ||
                'Unlabeled action';

            trackProductEvent('click', {
                element_label: label,
                tag: target.tagName.toLowerCase(),
                href: target instanceof HTMLAnchorElement ? target.href : undefined,
            });
        },
        true,
    );

    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendDuration();
        }
    });
    window.addEventListener('beforeunload', sendDuration);
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./pages/${name}.tsx`,
            import.meta.glob('./pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <StrictMode>
                  <Toaster position='top-right'/>
                <App {...props} />
            </StrictMode>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
startProductAnalytics();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // Offline support is progressive; the app still works without it.
        });
    });
}
