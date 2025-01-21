import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../store/slice/authSlice';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isLoading, error } = useSelector((state) => state.auth);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const x = (clientX - window.innerWidth / 2) / 25;
            const y = (clientY - window.innerHeight / 2) / 25;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await dispatch(login(formData));
        if (login.fulfilled.match(result)) {
            navigate('/dashboard');
        }
    };

    return (
        <div className="relative min-h-screen bg-cover bg-center bg-no-repeat perspective-1000"
            style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1920")',
                backgroundBlendMode: 'overlay',
            }}>
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5EBE0]/90 via-[#E6CCB2]/85 to-[#DDB892]/90"></div>

            {/* Dynamic 3D Background Grid */}
            <div className="absolute inset-0 z-0">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-full h-px bg-gradient-to-r from-transparent via-[#B08968]/20 to-transparent transform"
                        style={{
                            top: `${i * 5}%`,
                            transform: `rotateX(${mousePosition.y}deg) translateZ(${i * 2}px)`
                        }}
                    ></div>
                ))}
                {[...Array(20)].map((_, i) => (
                    <div
                        key={`v-${i}`}
                        className="absolute h-full w-px bg-gradient-to-b from-transparent via-[#B08968]/20 to-transparent transform"
                        style={{
                            left: `${i * 5}%`,
                            transform: `rotateY(${mousePosition.x}deg) translateZ(${i * 2}px)`
                        }}
                    ></div>
                ))}
            </div>

            {/* Floating Elements */}
            <div className="absolute inset-0 z-0 perspective-1000">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={`obj-${i}`}
                        className="absolute animate-float-3d"
                        style={{
                            width: `${Math.max(60, Math.random() * 100)}px`,
                            height: `${Math.max(60, Math.random() * 100)}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            transform: `
                                rotateX(${mousePosition.y * 2}deg)
                                rotateY(${mousePosition.x * 2}deg)
                                translateZ(${i * 20}px)
                            `
                        }}
                    >
                        <div className="w-full h-full relative transform-style-3d">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#B08968]/30 to-transparent backdrop-blur-sm rounded-lg animate-pulse"></div>
                            <div className="absolute inset-0 border border-[#B08968]/20 rounded-lg transform rotate-45"></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="relative flex flex-col items-center justify-center min-h-screen transform-style-3d"
                style={{
                    transform: `
                        rotateX(${mousePosition.y * 0.1}deg)
                        rotateY(${mousePosition.x * 0.1}deg)
                    `
                }}>
                {/* Title Section */}
                <div className="mb-8 transform-style-3d flex flex-col items-center relative z-10">
                    <h1 className="text-6xl font-bold text-[#8B5E34] text-center tracking-wider animate-fade-in"
                        style={{
                            fontFamily: "'Playfair Display', serif",
                            textShadow: '2px 2px 4px rgba(139, 94, 52, 0.1)'
                        }}>
                        JK Tracker
                    </h1>
                    <div className="h-1 w-32 bg-[#8B5E34] mx-auto mt-3 rounded-full animate-width"></div>
                </div>

                {/* Login Form */}
                <div className="w-96 p-8 bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-[#8B5E34]/10 transform-style-3d transition-all duration-300"
                    style={{
                        transform: `
                            translateZ(100px)
                            rotateX(${mousePosition.y * 0.1}deg)
                            rotateY(${mousePosition.x * 0.1}deg)
                        `
                    }}>
                    <h2 className="text-3xl font-semibold mb-6 text-[#8B5E34] text-center" style={{ fontFamily: "'Playfair Display', serif" }}>Welcome Back</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[#8B5E34] text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/90 border border-[#8B5E34]/20 rounded-lg text-[#8B5E34] placeholder-[#8B5E34]/50 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/30 focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter your email"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[#8B5E34] text-sm font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/90 border border-[#8B5E34]/20 rounded-lg text-[#8B5E34] placeholder-[#8B5E34]/50 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/30 focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter your password"
                            />
                        </div>
                        {error && <p className="text-red-500 text-center animate-shake">{error}</p>}
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-[#8B5E34] text-white rounded-lg font-medium hover:bg-[#724C2A] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B5E34]/50 focus:ring-offset-2"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <div className="mt-6 text-center transform-style-3d" style={{ transform: 'translateZ(25px)' }}>
                        <p className="text-[#8B5E34]">Don't have an account? 
                            <button 
                                onClick={() => navigate('/signup')} 
                                className="ml-2 text-[#8B5E34]/50 hover:text-[#8B5E34] transition-colors duration-300"
                            >
                                Sign Up
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                .transform-style-3d {
                    transform-style: preserve-3d;
                }
                @keyframes float-3d {
                    0%, 100% { transform: translateY(0) rotateX(0) rotateY(0); }
                    50% { transform: translateY(-20px) rotateX(180deg) rotateY(180deg); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes width {
                    from { width: 0; }
                    to { width: 10rem; }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fadeIn 1s ease-out forwards;
                }
                .animate-width {
                    animation: width 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Login;