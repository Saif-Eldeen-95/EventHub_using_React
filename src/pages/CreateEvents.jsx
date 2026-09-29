import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvents } from '../context/EventContext';
import './CreateEvents.css';

const CATEGORIES = ['Tech', 'Sports', 'Career', 'Art', 'Workshop'];

const initialFormState = {
    title: '',
    category: '',
    location: '',
    seats: '',
    date: '',
    time: '',
    description: '',
    agreeToTerms: false,
};

function CreateEvents() {
    const navigate = useNavigate();
    const { addEvent } = useEvents();

    const [form, setForm] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    function handleChange(e) {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        // Clear the field error on change
        if (errors[name]) {
            setErrors((prev) => { const copy = { ...prev }; delete copy[name]; return copy; });
        }
    }

    function validate() {
        const newErrors = {};
        const selectedDateTime = form.date && form.time
            ? new Date(`${form.date}T${form.time}`)
            : null;

        if (!form.title.trim()) {
            newErrors.title = 'Please provide an event name.';
        } else if (form.title.trim().length < 3) {
            newErrors.title = 'Event name must be at least 3 characters.';
        }

        if (!form.category) newErrors.category = 'Please select a category.';

        if (!form.location.trim()) {
            newErrors.location = 'Please provide a location.';
        } else if (form.location.trim().length < 3) {
            newErrors.location = 'Location must be at least 3 characters.';
        }

        if (!form.seats || !Number.isInteger(Number(form.seats)) || Number(form.seats) <= 0) {
            newErrors.seats = 'Seats must be a positive whole number.';
        }

        if (!form.date) {
            newErrors.date = 'Please select a date.';
        } else if (form.date < today) {
            newErrors.date = 'Event date cannot be in the past.';
        }

        if (!form.time) newErrors.time = 'Please select a time.';

        if (selectedDateTime && selectedDateTime < new Date()) {
            newErrors.time = 'Event date and time must be in the future.';
        }

        if (!form.description.trim()) {
            newErrors.description = 'Please provide a description.';
        } else if (form.description.trim().length < 20) {
            newErrors.description = 'Description must be at least 20 characters.';
        }

        if (!form.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree before submitting.';
        }

        return newErrors;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        setSubmitting(true);
        try {
            const newEvent = await addEvent({
                title: form.title.trim(),
                category: form.category,
                location: form.location.trim(),
                seats: Number(form.seats),
                date: form.date,
                time: form.time,
                description: form.description.trim(),
            });
            // Navigate to the newly created event's detail page
            navigate(`/events/${newEvent.id}`);
        } finally {
            setSubmitting(false);
        }
    }

    function fieldClass(name) {
        return errors[name] ? 'input--error' : '';
    }

    return (
        <div className="create-events-page">
            <div className="create-events__card">
                <h1 className="create-events__title">Create New Event</h1>
                <p className="create-events__subtitle">Fill in the details to publish your event.</p>

                <form noValidate onSubmit={handleSubmit} className="create-events__form">

                    <div className="form-group">
                        <label htmlFor="title">Event Name</label>
                        <input
                            id="title"
                            name="title"
                            type="text"
                            placeholder="e.g. Web Design Workshop"
                            value={form.title}
                            onChange={handleChange}
                            className={fieldClass('title')}
                        />
                        {errors.title && <span className="form-error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category</label>
                        <select
                            id="category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            className={fieldClass('category')}
                        >
                            <option value="" disabled>Select a category</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <span className="form-error">{errors.category}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            id="location"
                            name="location"
                            type="text"
                            placeholder="e.g. Room 204 or Online"
                            value={form.location}
                            onChange={handleChange}
                            className={fieldClass('location')}
                        />
                        {errors.location && <span className="form-error">{errors.location}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="seats">Available Seats</label>
                        <input
                            id="seats"
                            name="seats"
                            type="number"
                            placeholder="e.g. 30"
                            min="1"
                            value={form.seats}
                            onChange={handleChange}
                            className={fieldClass('seats')}
                        />
                        {errors.seats && <span className="form-error">{errors.seats}</span>}
                    </div>

                    <hr className="create-events__divider" />

                    {/* Date and Time side-by-side */}
                    <div className="create-events__row">
                        <div className="form-group">
                            <label htmlFor="date">Date</label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                min={today}
                                value={form.date}
                                onChange={handleChange}
                                className={fieldClass('date')}
                            />
                            {errors.date && <span className="form-error">{errors.date}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="time">Time</label>
                            <input
                                id="time"
                                name="time"
                                type="time"
                                value={form.time}
                                onChange={handleChange}
                                className={fieldClass('time')}
                            />
                            {errors.time && <span className="form-error">{errors.time}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={4}
                            placeholder="Describe what attendees can expect..."
                            value={form.description}
                            onChange={handleChange}
                            className={fieldClass('description')}
                        />
                        {errors.description && <span className="form-error">{errors.description}</span>}
                    </div>

                    <div className="form-group form-group--checkbox">
                        <label>
                            <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={form.agreeToTerms}
                                onChange={handleChange}
                            />
                            I agree to the terms and conditions
                        </label>
                        {errors.agreeToTerms && <span className="form-error">{errors.agreeToTerms}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn btn--primary create-events__submit"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default CreateEvents;
