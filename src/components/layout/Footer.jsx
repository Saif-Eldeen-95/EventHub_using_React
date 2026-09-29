import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                <div className="footer__brand">
                    <span className="footer__logo">EventHub</span>
                    <p className="footer__tagline">
                        Discover, create, and manage events all in one place.
                    </p>
                </div>

                <nav className="footer__links" aria-label="Footer navigation">
                    <Link to="/">Home</Link>
                    <Link to="/events">Events</Link>
                    <Link to="/create-event">Create Event</Link>
                    <Link to="/my-events">My Events</Link>
                </nav>
            </div>

            <div className="footer__bottom">
                <p>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</p>
                <p>Live event data powered by StungEvents.</p>
            </div>
        </footer>
    );
}

export default Footer;
