import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signup } from '../store/slice/authSlice';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
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

    const validateForm = () => {
        const { password, confirmPassword } = formData;
        if (password !== confirmPassword) {
            return 'Passwords do not match';
        }
        if (password.length < 8 || !/\d/.test(password)) {
            return 'Password must be at least 8 characters long and contain at least one number';
        }
        return '';
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            alert(validationError);
            return;
        }
        const result = await dispatch(signup(formData));
        if (signup.fulfilled.match(result)) {
            navigate('/login');
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#F5EBE0] via-[#E6CCB2] to-[#DDB892] perspective-1000">
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
                {/* Logo Section */}
                <div className="mb-8 transform-style-3d hover:scale-105 transition-all duration-300">
                    <h1 className="text-7xl font-bold text-[#7F5539] text-center tracking-wide"
                        style={{
                            transform: `
                                translateZ(50px)
                                rotateX(${mousePosition.y * 0.2}deg)
                                rotateY(${mousePosition.x * 0.2}deg)
                            `
                        }}>
                        JK Tracker
                    </h1>
                    <div className="h-1 w-40 bg-gradient-to-r from-[#7F5539] via-[#9C6644] to-[#7F5539] mx-auto mt-2 rounded-full"></div>
                </div>

                {/* Signup Form */}
                <div className="w-96 p-8 bg-white/30 backdrop-blur-md rounded-2xl shadow-xl border border-[#B08968]/20 transform-style-3d hover:scale-105 transition-all duration-300"
                    style={{
                        transform: `
                            translateZ(100px)
                            rotateX(${mousePosition.y * 0.1}deg)
                            rotateY(${mousePosition.x * 0.1}deg)
                        `
                    }}>
                    <h2 className="text-3xl font-bold mb-6 text-[#7F5539] text-center">Create Account</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2 transform-style-3d">
                            <label className="block text-[#7F5539] text-sm font-medium">Username</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter your username"
                                style={{ transform: 'translateZ(20px)' }}
                            />
                        </div>
                        <div className="space-y-2 transform-style-3d">
                            <label className="block text-[#7F5539] text-sm font-medium">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter your email"
                                style={{ transform: 'translateZ(20px)' }}
                            />
                        </div>
                        <div className="space-y-2 transform-style-3d">
                            <label className="block text-[#7F5539] text-sm font-medium">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Enter your password"
                                style={{ transform: 'translateZ(20px)' }}
                            />
                        </div>
                        <div className="space-y-2 transform-style-3d">
                            <label className="block text-[#7F5539] text-sm font-medium">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/50 border border-[#B08968]/20 rounded-lg text-[#7F5539] placeholder-[#9C6644] focus:outline-none focus:ring-2 focus:ring-[#B08968] focus:border-transparent transition-all duration-300"
                                required
                                placeholder="Confirm your password"
                                style={{ transform: 'translateZ(20px)' }}
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-center animate-shake">{error}</p>}
                        
                        <button
                            type="submit"
                            className="w-full py-3 bg-[#B08968] text-white rounded-lg font-medium transform hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 disabled:opacity-50 hover:bg-[#9C6644]"
                            disabled={isLoading}
                            style={{ transform: 'translateZ(30px)' }}
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Sign Up'
                            )}
                        </button>
                    </form>
                    <div className="mt-6 text-center transform-style-3d" style={{ transform: 'translateZ(25px)' }}>
                        <p className="text-[#7F5539]">Already have an account? 
                            <button 
                                onClick={() => navigate('/login')} 
                                className="ml-2 text-[#9C6644] hover:text-[#7F5539] transition-colors duration-300"
                            >
                                Login
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
            `}</style>
        </div>
    );
};

export default Signup;