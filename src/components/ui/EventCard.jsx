import { useNavigate } from 'react-router-dom';
import Button from './Button';
import { useEvents } from '../../context/EventContext';
import { getCategoryColor } from '../../services/eventService';
import './EventCard.css';

function EventCard({ event, isRegistered, onRegister, onUnregister }) {
    const navigate = useNavigate();
    const { events, isFavorite, toggleFavorite } = useEvents();
    const favorite = isFavorite(event?.id);

    if (!event) return null;

    const categories = [...new Set(events.map((item) => item.category).filter(Boolean))].sort();
    const badgeColor = getCategoryColor(event.category, categories);

    function handleRegisterClick(e) {
        e.stopPropagation();
        if (isRegistered) {
            onUnregister?.(event.id);
        } else {
            onRegister?.(event.id);
        }
    }

    return (
        <div className="event-card" onClick={() => navigate(`/events/${event.id}`)}>
            <div className="event-card__header">
                <span className="event-card__badge" style={{ '--category-color': badgeColor }}>{event.category}</span>
                <button
                    type="button"
                    className={`event-card__favorite${favorite ? ' event-card__favorite--active' : ''}`}
                    aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(event.id);
                    }}
                >
                    ♥
                </button>
            </div>

            <h3 className="event-card__title">{event.title}</h3>
            <p className="event-card__meta">{event.date} &middot; {event.time}</p>
            <p className="event-card__location">{event.location}</p>
            <p className="event-card__description">{event.description}</p>

            <div className="event-card__actions">
                <Button
                    variant="secondary"
                    onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event.id}`);
                    }}
                >
                    Details
                </Button>
                <Button
                    variant={isRegistered ? 'ghost' : 'primary'}
                    onClick={handleRegisterClick}
                >
                    {isRegistered ? 'Unregister' : 'Register'}
                </Button>
            </div>
        </div>
    );
}

export default EventCard;
