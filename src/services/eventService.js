const API_BASE_URL = 'https://api.stungevents.com';
const EVENTS_LIMIT = 30;

function formatDate(isoDate) {
    if (!isoDate) return 'Date TBA';

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Date TBA';

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatTime(isoDate) {
    if (!isoDate) return 'Time TBA';

    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return 'Time TBA';

    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function mapCategory(category = '') {
    if (!category) return 'Other';

    // Turn API slugs like "free-events" or "night_in" into "Free Events".
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
    const startDate = event.start_utc || event.start || event.start_date;

    return {
        id: event.slug || event.id,
        title: event.title || 'Untitled Event',
        category: mapCategory(event.category, event.title),
        date: formatDate(startDate),
        time: formatTime(startDate),
        location: [event.venue_name, event.city].filter(Boolean).join(', ') || 'Location TBA',
        seats: event.capacity || 'N/A',
        description:
            event.description ||
            `Join this event in ${event.city || 'the selected city'} and discover more details from the organizer.`,
        ticketUrl: event.ticket_url || '',
        sourceUrl: event.url || event.ticket_url || '',
        rawCategory: event.category || '',
    };
}

async function request(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}.`);
    }

    const data = await response.json();

    if (data.ok === false) {
        throw new Error(data.error || 'The events API returned an error.');
    }

    return data;
}

/** Fetch upcoming events from the public API. */
export async function getEvents() {
    const params = new URLSearchParams({
        limit: String(EVENTS_LIMIT),
    });

    const data = await request(`${API_BASE_URL}/events?${params.toString()}`);

    return (data.events || []).map(normalizeEvent);
}

/** Fetch one event by its public slug/id. */
export async function getEventById(id) {
    const data = await request(`${API_BASE_URL}/events/${encodeURIComponent(id)}`);
    return data.event ? normalizeEvent(data.event) : null;
}

/**
 * Create an event locally.
 *
 * The public API is read-only, so user-created events are persisted
 * by EventContext in localStorage instead of being sent to the API.
 */
export async function createEvent(eventData) {
    return {
        id: `local-${Date.now()}`,
        ...eventData,
    };
}

/** Kept as service placeholders for future backend integration. */
export async function updateEvent(id, updates) {
    return { id, ...updates };
}

export async function deleteEvent(id) {
    return id;
}