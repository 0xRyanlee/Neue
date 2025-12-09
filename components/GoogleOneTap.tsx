import { useEffect } from 'react';
import { supabase } from '../services/supabase';

declare global {
    interface Window {
        google: any;
    }
}

export const GoogleOneTap = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogleOneTap;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const initializeGoogleOneTap = () => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: '158656726648-u5639ro2745km25li6h2r7g274gjk65g.apps.googleusercontent.com',
            callback: handleCredentialResponse,
            cancel_on_tap_outside: false, // Optional: Keep it visible
            context: 'use', // 'signin' or 'signup' or 'use'
        });

        window.google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('One Tap skipped or not displayed', notification);
            }
        });
    };

    const handleCredentialResponse = async (response: any) => {
        try {
            const { data, error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });

            if (error) {
                console.error('Supabase One Tap Error:', error);
            } else {
                console.log('Signed in with Google One Tap', data);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        }
    };

    return null; // This component renders the floating widget, no DOM element needed here
};
