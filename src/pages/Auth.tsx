import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<"admin" | "quality_circle_leader">("admin");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Spotlight state
    const divRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return;
        const div = divRef.current;
        const rect = div.getBoundingClientRect();
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const handleMouseEnter = () => setOpacity(1);
    const handleMouseLeave = () => setOpacity(0);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                toast({
                    title: "Welcome back",
                    description: "Access granted to the executive suite.",
                    className: "bg-[#1C1917] text-white border-amber-600"
                });
                navigate("/dashboard");
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                        data: {
                            full_name: fullName,
                        },
                    },
                });

                if (error) throw error;

                if (data.user) {
                    const { error: roleError } = await supabase
                        .from("user_roles")
                        .insert({
                            user_id: data.user.id,
                            role: role,
                        });

                    if (roleError) throw roleError;
                }

                toast({
                    title: "Profile Created",
                    description: "Your credentials have been established successfully.",
                    className: "bg-[#1C1917] text-white border-amber-600"
                });
                setIsLogin(true);
            }
        } catch (error: any) {
            toast({
                title: "Authentication Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#E6E4DF] p-4 relative overflow-hidden">
            {/* Luxury Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-stone-400/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Card Container with Spotlight Logic */}
            <div
                ref={divRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="w-full max-w-md relative group"
            >
                {/* The Spotlight Effect Layer - Moves with cursor */}
                <div
                    className="pointer-events-none absolute -inset-px rounded-[32px] transition-opacity duration-300 z-0"
                    style={{
                        opacity,
                        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(245, 158, 11, 0.15), transparent 40%)`
                    }}
                />

                {/* Main Card */}
                <Card className="w-full bg-[#FBFBF9] border border-stone-200 shadow-2xl rounded-[32px] relative z-10 overflow-hidden">
                    {/* Gold Top Border Accent */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-stone-300 via-amber-500 to-stone-300" />

                    <CardHeader className="space-y-6 text-center pt-12 pb-8">
                        <div className="mx-auto w-20 h-20 bg-[#1C1917] rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-amber-500/20 transform hover:rotate-3 transition-transform duration-500">
                            <Leaf className="w-10 h-10 text-amber-500" />
                        </div>

                        <div className="space-y-2">
                            <CardTitle className="text-3xl font-serif font-bold text-[#1C1917] tracking-tight">
                                SVCM Monitor
                            </CardTitle>
                            <div className="flex items-center justify-center gap-2">
                                <div className="h-[1px] w-8 bg-amber-200"></div>
                                <CardDescription className="text-amber-700 font-bold text-[10px] uppercase tracking-[0.2em]">
                                    Sustainable Village Collaboration
                                </CardDescription>
                                <div className="h-[1px] w-8 bg-amber-200"></div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-8 pb-12">
                        <form onSubmit={handleAuth} className="space-y-6">
                            {!isLogin && (
                                <div className="space-y-5 animate-in slide-in-from-top-4 fade-in duration-500">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Full Name</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            placeholder="e.g. Alexander Sterling"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                            // Added focus:ring-0 and focus:outline-none to strictly remove browser borders
                                            className="h-12 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-0 focus:outline-none focus-visible:ring-0 rounded-xl placeholder:text-stone-400 text-stone-800 transition-all duration-300 shadow-sm hover:bg-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role" className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Designation</Label>
                                        <Select value={role} onValueChange={(value: "admin" | "quality_circle_leader") => setRole(value)}>
                                            <SelectTrigger className="h-12 bg-stone-50 border-stone-200 focus:ring-0 focus:outline-none focus:border-amber-500 rounded-xl text-stone-800 shadow-sm hover:bg-white">
                                                <SelectValue placeholder="Select your role" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-stone-200">
                                                <SelectItem value="admin">Administrator</SelectItem>
                                                <SelectItem value="quality_circle_leader">Quality Circle Leader</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@organization.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    // Added focus:ring-0 and focus:outline-none to strictly remove browser borders
                                    className="h-12 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-0 focus:outline-none focus-visible:ring-0 rounded-xl placeholder:text-stone-400 text-stone-800 transition-all duration-300 shadow-sm hover:bg-white"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-stone-500 ml-1">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    // Added focus:ring-0 and focus:outline-none to strictly remove browser borders
                                    className="h-12 bg-stone-50 border-stone-200 focus:border-amber-500 focus:ring-0 focus:outline-none focus-visible:ring-0 rounded-xl placeholder:text-stone-400 text-stone-800 transition-all duration-300 shadow-sm hover:bg-white"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-[#1C1917] hover:bg-amber-700 text-white font-medium tracking-wide rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl mt-4 group"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Access Dashboard" : "Create Account"}
                                        <ArrowRight className="w-4 h-4 text-amber-500 group-hover:translate-x-1 transition-transform" />
                  </span>
                                )}
                            </Button>
                        </form>

                        <div className="mt-8 text-center">
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-stone-200" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[#FBFBF9] px-2 text-stone-400 font-semibold tracking-widest">Or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsLogin(!isLogin)}
                                className="mt-4 text-sm font-medium text-stone-500 hover:text-amber-700 transition-colors flex items-center justify-center gap-2 mx-auto group"
                            >
                                {isLogin ? (
                                    <>New to the system? <span className="underline decoration-amber-300 decoration-2 underline-offset-4 group-hover:text-[#1C1917]">Request Access</span></>
                                ) : (
                                    <>Existing member? <span className="underline decoration-amber-300 decoration-2 underline-offset-4 group-hover:text-[#1C1917]">Sign In</span></>
                                )}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 text-center w-full pointer-events-none">
                <p className="text-[10px] uppercase tracking-[0.3em] text-stone-400 font-bold">
                    Secure Collaboration Environment
                </p>
            </div>
        </div>
    );
};

export default Auth;