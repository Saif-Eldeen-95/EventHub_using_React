
const API_BASE_URL = 'https://app.ticketmaster.com/discovery/v2';
const EVENTS_LIMIT = 30;

// Set VITE_TICKETMASTER_API_KEY in your local .env file.
const API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY;

function formatDate(dateValue) {
    if (!dateValue) return 'Date TBA';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Date TBA';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatTime(dateTime, localTime) {
    if (dateTime) {
        const date = new Date(dateTime);
        if (!Number.isNaN(date.getTime())) {
            return date.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
            });
        }
    }

    if (localTime && typeof localTime === 'object' && Number.isInteger(localTime.hourOfDay)) {
        const date = new Date();
        date.setHours(localTime.hourOfDay, localTime.minuteOfHour || 0, 0, 0);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
        });
    }

    return typeof localTime === 'string' ? localTime : 'Time TBA';
}

function mapCategory(category = '') {
    if (!category) return 'Other';

    return category
        .replace(/[-_]+/g, ' ')
        .trim()
        .split(' ')
        .filter(Boolean)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** Assign each category a stable, distinct hue from the available categories. */
export function getCategoryColor(category = '', categories = [category]) {
    const sortedCategories = [...new Set(categories)].sort();
    const index = sortedCategories.indexOf(category);
    const hue = (Math.max(index, 0) * 137.508) % 360;
    return `hsl(${hue} 68% 36%)`;
}

function normalizeEvent(event) {
    const start = event.dates?.start || {};
    const venue = event._embedded?.venues?.[0] || {};

    const classification = event.classifications?.find((item) => item.primary)
        || event.classifications?.[0]
        || {};

    const category = classification.genre?.name
        || classification.segment?.name
        || classification.subGenre?.name
        || 'Other';

    const location = [
        venue.name,
        venue.city?.name,
        venue.state?.stateCode || venue.state?.name,
        venue.country?.name,
    ].filter(Boolean).join(', ');

    const image = [...(event.images || [])]
        .sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || '';

    return {
        id: event.id,
        title: event.name || 'Untitled Event',
        category: mapCategory(category),
        date: formatDate(start.dateTime || start.localDate),
        time: formatTime(start.dateTime, start.localTime),
        location: location || 'Location TBA',
        seats: 'N/A',
        description: event.info || event.pleaseNote || 'Event details are available from the organizer.',
        ticketUrl: event.url || '',
        sourceUrl: event.url || '',
        image,
        rawCategory: category,
    };
}

async function request(url) {
    if (!API_KEY) {
        throw new Error(
            'Missing Ticketmaster API key. Add VITE_TICKETMASTER_API_KEY to your .env file and restart the dev server.'
        );
    }

    const response = await fetch(url);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        const apiMessage = data?.fault?.faultstring || data?.errors?.[0]?.detail;
        throw new Error(apiMessage || `Ticketmaster API request failed (${response.status}).`);
    }

    return data;
}

function buildEventsUrl(options = {}) {
    const {
        keyword,
        countryCode,
        city,
        classificationName,
        size = EVENTS_LIMIT,
    } = options;

    const params = new URLSearchParams({
        apikey: API_KEY || '',
        size: String(size),
        sort: 'date,asc',
    });

    if (keyword) params.set('keyword', keyword);
    if (countryCode) params.set('countryCode', countryCode);
    if (city) params.set('city', city);
    if (classificationName) params.set('classificationName', classificationName);

    return `${API_BASE_URL}/events.json?${params.toString()}`;
}

/** Fetch upcoming events. Optional filters: keyword, countryCode, city, classificationName, size. */
export async function getEvents(options = {}) {
    const data = await request(buildEventsUrl(options));
    return (data._embedded?.events || []).map(normalizeEvent);
}

/** Fetch one event by its Ticketmaster event ID. */
export async function getEventById(id) {
    const params = new URLSearchParams({
        apikey: API_KEY || '',
    });

    const data = await request(
        `${API_BASE_URL}/events/${encodeURIComponent(id)}.json?${params.toString()}`
    );

    return data ? normalizeEvent(data) : null;
}

/** Create an event locally; user-created events remain in localStorage. */
export async function createEvent(eventData) {
    return {
        id: `local-${Date.now()}`,
        ...eventData,
    };
}

/** Service placeholders for future backend integration. */
export async function updateEvent(id, updates) {
    return { id, ...updates };
}

export async function deleteEvent(id) {
    return id;
}
