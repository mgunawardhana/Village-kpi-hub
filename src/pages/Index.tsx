import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, BarChart3, Users, Award, TrendingUp, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
    const navigate = useNavigate();

    return (
        // CHANGED: Replaced 'min-h-screen' with 'h-screen w-full overflow-y-auto'
        // This constrains the height to the window and handles scrolling internally, preventing double scrollbars.
        <div className="h-screen w-full bg-[#E6E4DF] font-sans text-stone-900 selection:bg-amber-200 relative overflow-x-hidden overflow-y-auto">

            {/* Decorative Top Gradient */}
            <div className="h-[500px] w-full bg-gradient-to-b from-[#D6D4CF] to-[#E6E4DF] absolute top-0 left-0 z-0 pointer-events-none" />

            {/* Background Texture/Glows */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />
            {/* Note: With h-screen, this bottom blob will appear relative to the scroll view, effectively acting as a fixed background element which is usually desired */}
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-stone-400/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative z-10 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center space-y-8 max-w-4xl mx-auto">

                        {/* Pill Badge */}
                        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-[#1C1917] rounded-full shadow-xl border border-amber-500/20 animate-in fade-in slide-in-from-top-4 duration-700">
                            <Leaf className="w-4 h-4 text-amber-500" />
                            <span className="text-xs font-bold text-amber-50 tracking-widest uppercase">Sustainable Village Collaboration</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-bold text-[#1C1917] leading-[1.1] tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                            KPI Monitoring System
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 mt-2 italic">
                for Excellence
              </span>
                        </h1>

                        <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                            Track, analyze, and improve departmental performance with our comprehensive
                            KPI monitoring solution designed specifically for the SVCM framework.
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                            <Button
                                size="lg"
                                onClick={() => navigate("/auth")}
                                className="h-14 px-8 rounded-xl bg-[#1C1917] hover:bg-amber-700 text-white text-lg font-medium tracking-wide shadow-[0_20px_40px_-12px_rgba(28,25,23,0.3)] hover:shadow-xl transition-all duration-300 group"
                            >
                                Get Started
                                <ArrowRight className="w-5 h-5 ml-2 text-amber-500 group-hover:translate-x-1 transition-transform" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={() => navigate("/auth")}
                                className="h-14 px-8 rounded-xl border-2 border-stone-300 bg-transparent text-[#1C1917] hover:border-[#1C1917] hover:bg-transparent text-lg font-medium transition-all duration-300"
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1C1917] mb-4">
                            Comprehensive KPI Tracking
                        </h2>
                        <div className="h-1 w-20 bg-amber-500 mx-auto rounded-full mb-4" />
                        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                            Everything you need to monitor performance, identify gaps, and drive continuous improvement across all departments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: BarChart3,
                                title: "Real-time Analytics",
                                desc: "Monitor KPIs with interactive charts and timeline filters.",
                                color: "text-amber-600",
                                bg: "bg-amber-100",
                            },
                            {
                                icon: Users,
                                title: "Quality Circles",
                                desc: "Collaborate across departments for continuous improvement.",
                                color: "text-stone-700",
                                bg: "bg-stone-200",
                            },
                            {
                                icon: Award,
                                title: "Recognition System",
                                desc: "Celebrate achievements and motivate teams effectively.",
                                color: "text-amber-700",
                                bg: "bg-amber-100",
                            },
                            {
                                icon: TrendingUp,
                                title: "Performance Tracking",
                                desc: "Color-coded indicators for quick performance assessment.",
                                color: "text-stone-800",
                                bg: "bg-stone-200",
                            },
                        ].map((feature, index) => (
                            <Card
                                key={index}
                                className="bg-[#FBFBF9] border border-stone-200 rounded-[24px] shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <CardContent className="pt-8 pb-8 text-center space-y-5 relative z-10">
                                    <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center ${feature.bg} group-hover:bg-[#1C1917] transition-colors duration-500 shadow-inner`}>
                                        <feature.icon className={`w-7 h-7 ${feature.color} group-hover:text-amber-500 transition-colors duration-500`} />
                                    </div>
                                    <h3 className="font-serif font-bold text-xl text-[#1C1917]">{feature.title}</h3>
                                    <p className="text-sm text-stone-500 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <Card className="bg-[#1C1917] text-white border-0 shadow-2xl rounded-[32px] overflow-hidden relative">
                        {/* Background Effect */}
                        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-amber-600/30 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none" />

                        <CardContent className="py-16 px-8 md:px-16 space-y-8 relative z-10">
                            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full backdrop-blur-sm mb-2">
                                <Sparkles className="w-6 h-6 text-amber-400" />
                            </div>

                            <h2 className="text-3xl md:text-5xl font-serif font-bold leading-tight">
                                Ready to Transform Your <br/>
                                <span className="text-amber-400">KPI Management?</span>
                            </h2>

                            <p className="text-lg text-stone-300 max-w-2xl mx-auto leading-relaxed">
                                Join the Sustainable Village Collaboration Model today. Streamline your reporting, visualize defects, and empower your workforce.
                            </p>

                            <Button
                                size="lg"
                                onClick={() => navigate("/auth")}
                                className="h-14 px-10 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-lg font-bold tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-300"
                            >
                                Start Monitoring Now
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* Simple Footer */}
            <footer className="py-8 text-center text-stone-400 text-sm uppercase tracking-widest font-bold">
                <p>© 2025 SVCM System. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Index;