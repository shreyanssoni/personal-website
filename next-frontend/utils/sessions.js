// utils/session.js
import Cookies from 'js-cookie';

export function generateSessionId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

export function getSessionId() {
    let sessionId = Cookies.get('sessionId');
    if (!sessionId) {
        sessionId = generateSessionId();
        Cookies.set('sessionId', sessionId, { path: '/' });
    }
    return sessionId;
}

export function clearSessionId() {
    Cookies.remove('sessionId', { path: '/' });
}
