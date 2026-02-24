import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, Lock, LogIn } from "lucide-react";
import { saveUserProfile } from "../services/db";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            console.error("Auth error:", err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else {
                setError("Failed to authenticate. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            setError("");
            setLoading(true);
            const userCredential = await loginWithGoogle();
            const user = userCredential.user;

            await saveUserProfile(user.uid, {
                name: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
                lastLoginAt: new Date().toISOString()
            });

            navigate("/dashboard");
        } catch (err) {
            console.error("Google Auth error:", err);
            setError("Google sign-in failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGuestAccess() {
        navigate("/dashboard", { state: { guest: true } });
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                type: "spring",
                stiffness: 100,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } }
    };

    return (
        <div className="min-h-screen bg-[#050b14] flex items-center justify-center p-6 relative overflow-hidden font-sans text-slate-300">
            {/* Animated Background Image & Effects */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2560&q=80')"
                }}
            />
            {/* Dark Overlay Layer */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#050b14]/90 via-[#0a1128]/80 to-[#010409]/90 backdrop-blur-sm" />

            {/* Subtle Abstract Neural Particles */}
            <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center overflow-hidden">
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen translate-x-[-30%] translate-y-[-20%]"
                />
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[50vw] h-[50vw] bg-cyan-600/10 rounded-full blur-[90px] mix-blend-screen translate-x-[30%] translate-y-[30%]"
                />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 w-full max-w-md bg-[#0a0f1c]/90 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden"
            >
                {/* Premium Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-500" />

                <motion.div variants={itemVariants} className="text-center mb-8 mt-2">
                    <h2 className="text-3xl font-black text-white tracking-tight mb-2">
                        Welcome Back
                    </h2>
                    <p className="text-sm font-medium text-[#94a3b8]">
                        Enter your credentials to access the AI Career Companion.
                    </p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, mb: 0 }}
                            animate={{ opacity: 1, height: "auto", mb: 20 }}
                            exit={{ opacity: 0, height: 0, mb: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center justify-center text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div variants={itemVariants} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/[0.05] focus:border-indigo-500/50 hover:border-white/[0.1] focus:bg-white/[0.02] outline-none transition-all text-white placeholder:text-slate-500 font-medium shadow-[0_0_0_transparent] focus:shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                        />
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-black/20 border border-white/[0.05] focus:border-indigo-500/50 hover:border-white/[0.1] focus:bg-white/[0.02] outline-none transition-all text-white placeholder:text-slate-500 font-medium shadow-[0_0_0_transparent] focus:shadow-[0_0_15px_rgba(79,70,229,0.15)]"
                        />
                    </motion.div>

                    <motion.button
                        variants={itemVariants}
                        whileHover={{ scale: 1.01, boxShadow: "0 0 25px rgba(79,70,229,0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 mt-2 rounded-xl font-black tracking-wide flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <LogIn className="w-5 h-5" />
                                Sign In
                            </>
                        )}
                    </motion.button>
                </form>

                <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center gap-4">
                    <Link
                        to="/signup"
                        className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        Don't have an account? Sign up
                    </Link>

                    <div className="w-full flex items-center gap-4 text-white text-xs font-bold uppercase tracking-widest my-2">
                        <div className="flex-1 h-px bg-white/[0.05]" />
                        <span className="text-slate-500">OR</span>
                        <div className="flex-1 h-px bg-white/[0.05]" />
                    </div>

                    {/* Google Auth */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.08] transition-colors flex items-center justify-center gap-3 text-white font-bold"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="button"
                        onClick={handleGuestAccess}
                        disabled={loading}
                        className="w-full py-3 rounded-xl bg-transparent hover:bg-white/[0.02] transition flex items-center justify-center gap-2 text-white text-sm font-semibold mt-2"
                    >
                        Try Without Signing In <ArrowRight className="w-4 h-4" />
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}