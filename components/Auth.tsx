import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { Lock, Smartphone } from 'lucide-react';
import { Button } from './Button';

export const Auth: React.FC = () => {
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f5f5f5] p-6 relative overflow-hidden">
            <div className="swiss-grid absolute inset-0 opacity-20 pointer-events-none"></div>

            <div className="z-10 text-center max-w-md w-full bg-white p-8 border border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="w-16 h-16 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
                    <Lock className="text-white w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter mb-4">NEUE STUDIO</h1>
                <p className="text-gray-600 mb-8 font-medium text-sm">
                    Sign in to access your digital lightroom.
                    <br />
                    Save your generations and join the community.
                </p>

                <div className="space-y-3">
                    <Button
                        onClick={handleGoogleLogin}
                        fullWidth
                        size="lg"
                        disabled={loading}
                        className="bg-black text-white hover:bg-gray-800 border-none group relative"
                    >
                        {loading ? 'CONNECTING...' : 'SIGN IN WITH GOOGLE'}
                    </Button>
                    <p className="text-[10px] text-gray-400 mt-4">
                        By connecting, you agree to our Terms of Service.
                    </p>
                </div>
            </div>
        </div>
    );
};
