import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Smartphone } from 'lucide-react';
import { Button } from './Button';

interface AuthProps {
    onSkip: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSkip }) => {
    const [loading, setLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) throw error;
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0f0f0]">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">N</span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Welcome to NEUE</h2>
                <p className="text-gray-500 mb-8">AI Photography Studio</p>

                <div className="space-y-4">
                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? 'Connecting...' : 'Sign in with Google'}
                    </button>

                    <button
                        onClick={onSkip}
                        className="w-full bg-gray-100 text-gray-600 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                        Continue as Guest
                    </button>
                </div>

                <p className="mt-6 text-xs text-gray-400">
                    By continuing, you accept our Terms of Service and Privacy Policy.
                </p>
            </div>
        </div>
    );
};
