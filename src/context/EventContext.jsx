import { createContext, useContext, useEffect, useState } from 'react';
import { getEvents, createEvent as createEventService } from '../services/eventService';

const EventContext = createContext(null);

const STORAGE_KEYS = {
    createdEvents: 'eventhub-created-events',
    registeredEvents: 'eventhub-registered-events',
    favoriteEvents: 'eventhub-favorite-events',
};

function readStoredArray(key) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveArray(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // localStorage is optional; the app still works for the current session.
    }
}

export function EventProvider({ children }) {
    const [events, setEvents] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState(() => readStoredArray(STORAGE_KEYS.registeredEvents));
    const [favoriteEvents, setFavoriteEvents] = useState(() => readStoredArray(STORAGE_KEYS.favoriteEvents));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadEvents();
    }, []);

    useEffect(() => {
        saveArray(STORAGE_KEYS.registeredEvents, registeredEvents);
    }, [registeredEvents]);

    useEffect(() => {
        saveArray(STORAGE_KEYS.favoriteEvents, favoriteEvents);
    }, [favoriteEvents]);

    async function loadEvents() {
        try {
            setLoading(true);
            setError(null);
            const data = await getEvents();
            const createdEvents = readStoredArray(STORAGE_KEYS.createdEvents);
            setEvents([...createdEvents, ...data]);
        } catch {
            setError('Failed to load events. Please try again later.');
        } finally {
            setLoading(false);
        }
    }

    async function addEvent(eventData) {
        const newEvent = await createEventService(eventData);
        setEvents((prev) => [...prev, newEvent]);

        const createdEvents = readStoredArray(STORAGE_KEYS.createdEvents);
        saveArray(STORAGE_KEYS.createdEvents, [...createdEvents, newEvent]);

        return newEvent;
    }

    function registerEvent(eventId) {
        setRegisteredEvents((prev) =>
            prev.includes(eventId) ? prev : [...prev, eventId]
        );
    }

    function unregisterEvent(eventId) {
        setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
    }

    function isRegistered(eventId) {
        return registeredEvents.includes(eventId);
    }

    function toggleFavorite(eventId) {
        setFavoriteEvents((prev) =>
            prev.includes(eventId)
                ? prev.filter((id) => id !== eventId)
                : [...prev, eventId]
        );
    }

    function isFavorite(eventId) {
        return favoriteEvents.includes(eventId);
    }

    function getEventFromState(id) {
        return events.find((event) => String(event.id) === String(id)) ?? null;
    }

    const value = {
        events,
        registeredEvents,
        favoriteEvents,
        loading,
        error,
        addEvent,
        registerEvent,
        unregisterEvent,
        isRegistered,
        toggleFavorite,
        isFavorite,
        getEventFromState,
        refreshEvents: loadEvents,
    };

    return (
        <EventContext.Provider value={value}>
            {children}
        </EventContext.Provider>
    );
}

export function useEvents() {
    const context = useContext(EventContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventProvider');
    }
    return context;
}
