import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
    LayoutDashboard,
    TrendingUp,
    Users,
    Award,
    LogOut,
    BarChart3,
    FileText,
    Plus,
    Crown,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Gem
} from "lucide-react";
import KPIOverview from "@/components/dashboard/KPIOverview";
import { AdminKPIForm } from "@/components/dashboard/AdminKPIForm";
import { QualityLeaderKPIForm } from "@/components/dashboard/QualityLeaderKPIForm";
import VarianceChart from "@/components/dashboard/VarianceChart";
import { KPIRecordsTable } from "@/components/dashboard/KPIRecordsTable";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Constants } from "@/integrations/supabase/types";

interface Profile {
    id: string;
    full_name: string;
    role: string;
    department: string | null;
}

const Dashboard = () => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [departmentSelection, setDepartmentSelection] = useState<string>("");
    const [savingDepartment, setSavingDepartment] = useState(false);
    const [loading, setLoading] = useState(true);

    // Stats state for the cards
    const [stats, setStats] = useState({
        totalRecords: 0,
        avgDefectRate: "0.00"
    });

    const navigate = useNavigate();
    const { toast } = useToast();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
                if (!session) {
                    navigate("/auth");
                }
            }
        );

        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (!session) {
                navigate("/auth");
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    // Trigger stats fetch when profile or role is loaded
    useEffect(() => {
        if (profile?.department || userRole === 'admin') {
            fetchStats();
        }
    }, [profile, userRole]);

    const fetchStats = async () => {
        try {
            // Start building the query
            let query = supabase
                .from("kpi_records")
                .select("defect_percentage", { count: "exact" });

            // Filter by department if the user has one (and is not viewing as a global admin without dept context)
            if (profile?.department) {
                query = query.eq("department", profile.department);
            }

            const { data, count, error } = await query;

            if (error) throw error;

            // Calculate Average Defect Rate
            let avg = "0.00";
            if (data && data.length > 0) {
                // Extract valid numbers from the response
                const validPercentages = data
                    .map(record => Number(record.defect_percentage))
                    .filter(val => !isNaN(val));

                if (validPercentages.length > 0) {
                    const totalDefectPercentage = validPercentages.reduce((sum, val) => sum + val, 0);
                    avg = (totalDefectPercentage / validPercentages.length).toFixed(2);
                }
            }

            setStats({
                totalRecords: count || 0,
                avgDefectRate: avg
            });

        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        }
    };

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, full_name, role, department")
                .eq("id", user?.id)
                .single();

            if (error) throw error;
            setProfile(data as Profile);

            // Fetch user role
            const { data: roleData, error: roleError } = await supabase
                .from("user_roles")
                .select("role")
                .eq("user_id", user?.id)
                .single();

            if (!roleError && roleData) {
                setUserRole(roleData.role as string);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/auth");
    };

    const getDepartmentName = (dept: string | null) => {
        if (!dept) return "No Department";
        return dept
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getRoleName = (role: string) => {
        return role
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const handleSaveDepartment = async () => {
        if (!departmentSelection) {
            toast({
                title: "Select department",
                description: "Please select your department before continuing.",
                variant: "destructive",
            });
            return;
        }

        try {
            setSavingDepartment(true);
            const { error } = await supabase
                .from("profiles")
                .update({ department: departmentSelection as any })
                .eq("id", user?.id);

            if (error) throw error;

            setProfile((prev) => (prev ? { ...prev, department: departmentSelection } : prev));

            toast({
                title: "Department saved",
                description: "Your department has been updated successfully.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setSavingDepartment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#E6E4DF]">
                <div className="text-center space-y-4">
                    <div className="animate-spin w-12 h-12 border-4 border-amber-700 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-stone-600 font-serif tracking-widest uppercase text-xs">Loading Suite...</p>
                </div>
            </div>
        );
    }

    const effectiveRole = userRole || profile?.role || "";

    return (
        <div className="min-h-screen bg-[#E6E4DF] text-stone-900 font-sans selection:bg-amber-200 pb-20">

            {/* Decorative Top Gradient */}
            <div className="h-80 w-full bg-gradient-to-b from-[#D6D4CF] to-[#E6E4DF] absolute top-0 left-0 z-0 pointer-events-none border-b border-white/10" />

            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

                {/* Header Section */}
                <header className="py-8 mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-[#1C1917] rounded-xl shadow-lg border border-amber-900/20">
                                <Crown className="w-6 h-6 text-amber-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-bold text-[#1C1917] tracking-tight">
                                    SVCM Suite
                                </h1>
                                <p className="text-amber-700 text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                                    Executive Dashboard
                                </p>
                            </div>
                        </div>

                        <div className="bg-[#F5F5F4] p-2 pl-6 rounded-full shadow-md border border-stone-200 flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-serif font-bold text-stone-900 leading-none mb-1">{profile?.full_name}</p>
                                <p className="text-[10px] uppercase tracking-wider text-amber-700 font-bold">{getRoleName(effectiveRole)}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleLogout}
                                className="rounded-full bg-[#1C1917] text-amber-50 hover:bg-amber-700 hover:text-white h-10 px-5 transition-all duration-300 shadow-sm"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Welcome Section */}
                <div className="mb-10">
                    <Card className="bg-[#1C1917] border border-stone-800 rounded-[24px] shadow-2xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-amber-600/20 transition-all duration-1000" />

                        <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <Gem className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Overview</span>
                                </div>
                                <h2 className="text-3xl md:text-5xl font-serif text-white mb-3 tracking-tight">
                                    Hello, <span className="text-amber-400 italic">{profile?.full_name}</span>
                                </h2>
                                <p className="text-stone-400 font-light text-lg max-w-xl">
                                    Department: <span className="text-stone-200 font-medium">{getDepartmentName(profile?.department)}</span>
                                </p>
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <div className="px-5 py-2 bg-white/5 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                                    <span className="text-stone-200 font-medium text-sm">System Active</span>
                                </div>
                                <p className="text-stone-500 text-xs mt-2 uppercase tracking-widest">Last Login: Today</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Setup */}
                {!profile?.department && (
                    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Card className="bg-[#F5F5F4] border-l-4 border-l-amber-600 border-y border-r border-stone-200 rounded-r-[24px] rounded-l-md shadow-xl">
                            <CardHeader>
                                <CardTitle className="font-serif text-2xl text-stone-900">Initialize Department</CardTitle>
                                <CardDescription className="text-stone-500">
                                    Required for access to high-level analytics and KPI reporting.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col sm:flex-row gap-4 items-center pt-0 pb-8">
                                <div className="w-full sm:w-1/2">
                                    <Select
                                        value={departmentSelection}
                                        onValueChange={setDepartmentSelection}
                                    >
                                        <SelectTrigger className="w-full h-12 rounded-xl border-stone-300 focus:ring-amber-500 bg-white shadow-sm">
                                            <SelectValue placeholder="Select Department" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#F5F5F4] border-stone-200">
                                            {Constants.public.Enums.department_type.map((dept) => (
                                                <SelectItem key={dept} value={dept} className="focus:bg-stone-200 focus:text-stone-900">
                                                    {getDepartmentName(dept)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSaveDepartment}
                                    disabled={savingDepartment || !departmentSelection}
                                    className="h-12 px-8 rounded-xl bg-[#1C1917] hover:bg-amber-700 text-white transition-all duration-300 font-bold tracking-wide shadow-lg"
                                >
                                    {savingDepartment ? "SAVING..." : "CONFIRM SELECTION"}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* KPI Overview Section */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                            <h3 className="text-2xl font-serif text-[#1C1917]">Performance Metrics</h3>
                        </div>

                        {effectiveRole === "admin" && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="border-red-200 text-red-700 bg-red-50 hover:bg-red-100 hover:border-red-300 rounded-xl font-medium shadow-sm">
                                        Reset All Data
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#F5F5F4] rounded-2xl border-stone-200 font-sans shadow-2xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="font-serif text-xl text-stone-900">Confirm Reset</AlertDialogTitle>
                                        <AlertDialogDescription className="text-stone-600">
                                            This action is irreversible. All recorded KPI data will be permanently expunged.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="rounded-xl border-stone-300 bg-white hover:bg-stone-100">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            className="bg-red-700 hover:bg-red-800 rounded-xl text-white shadow-lg"
                                            onClick={async () => {
                                                try {
                                                    const { error } = await supabase.from("kpi_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                                                    if (error) throw error;
                                                    toast({
                                                        title: "System Reset Complete",
                                                        description: "All records have been successfully cleared.",
                                                        className: "bg-[#1C1917] border-l-4 border-amber-500 shadow-xl text-white"
                                                    });
                                                    window.location.reload();
                                                } catch (error: any) {
                                                    toast({
                                                        title: "Error",
                                                        description: error.message,
                                                        variant: "destructive",
                                                    });
                                                }
                                            }}>
                                            Execute Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>

                    <div className="bg-[#F5F5F4] border border-stone-200 rounded-[24px] shadow-xl p-6 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 opacity-30"></div>
                        <KPIOverview department={profile?.department} />
                    </div>
                </div>

                {/* Quick Stats - Updated to use real data */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        {
                            title: "Total Records",
                            icon: BarChart3,
                            value: stats.totalRecords.toString(),
                            sub: "Total entries in table"
                        },
                        {
                            title: "Defect Rate",
                            icon: TrendingUp,
                            value: `${stats.avgDefectRate}%`,
                            sub: "Overall average"
                        },
                        { title: "Meetings", icon: Users, value: "0", sub: "Quality Circle" },
                        { title: "Awards", icon: Award, value: "0", sub: "Recognition" }
                    ].map((stat, i) => (
                        <Card key={i} className="group bg-[#1C1917] border border-amber-500/20 rounded-[24px] shadow-lg hover:shadow-[0_20px_40px_-12px_rgba(245,158,11,0.15)] hover:border-amber-500/40 transition-all duration-500 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 relative z-10">
                                <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-amber-500/80 group-hover:text-amber-400 transition-colors">{stat.title}</CardTitle>
                                <div className="p-2.5 bg-white/5 border border-white/10 rounded-full group-hover:bg-amber-500 group-hover:text-[#1C1917] transition-colors duration-500 shadow-inner">
                                    <stat.icon className="w-4 h-4 text-amber-500 group-hover:text-[#1C1917] transition-colors duration-500" />
                                </div>
                            </CardHeader>
                            <CardContent className="px-6 pb-6 relative z-10">
                                <div className="text-4xl font-serif mb-1 tracking-tight bg-gradient-to-br from-white to-stone-400 bg-clip-text text-transparent group-hover:from-amber-200 group-hover:to-amber-500 transition-all duration-500">{stat.value}</div>
                                <p className="text-xs text-stone-500 font-medium italic group-hover:text-stone-400 transition-colors">{stat.sub}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Variance Chart */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <h3 className="text-2xl font-serif text-[#1C1917]">Variance Analysis</h3>
                    </div>
                    <div className="bg-[#F5F5F4] border border-stone-200 rounded-[24px] shadow-xl p-6 relative">
                        <VarianceChart department={profile?.department} />
                    </div>
                </div>

                {/* KPI Records Table */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-1.5 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                        <h3 className="text-2xl font-serif text-[#1C1917]">Data Archives</h3>
                    </div>
                    <div className="bg-[#F5F5F4] border border-stone-200 rounded-[24px] shadow-xl p-6 overflow-hidden">
                        <KPIRecordsTable department={profile?.department} userRole={effectiveRole} />
                    </div>
                </div>

                {/* KPI Entry Form */}
                {effectiveRole && profile?.department && (
                    <div className="mb-12">
                        <div className="bg-[#1C1917] rounded-[24px] p-8 text-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden border-t border-white/10">
                            <div className="absolute inset-0 opacity-20" style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')"}}></div>
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none"></div>

                            <div className="relative z-10">
                                <h3 className="text-2xl font-serif mb-6 flex items-center gap-3 text-amber-50">
                                    <Sparkles className="w-6 h-6 text-amber-500" />
                                    New KPI Entry
                                </h3>
                                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-2xl">
                                    {effectiveRole === "admin" ? (
                                        <AdminKPIForm userId={user?.id || ""} userDepartment={profile.department} />
                                    ) : effectiveRole === "quality_circle_leader" ? (
                                        <QualityLeaderKPIForm userId={user?.id || ""} userDepartment={profile.department} />
                                    ) : null}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Actions */}
                    <Card className="bg-[#FBFBF9] border border-stone-200 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-500">
                        <CardHeader className="pb-4 border-b border-stone-100">
                            <CardTitle className="flex items-center gap-3 text-xl font-serif text-[#1C1917]">
                                <div className="p-2 bg-[#E6E4DF] rounded-lg">
                                    <LayoutDashboard className="w-5 h-5 text-stone-700" />
                                </div>
                                Quick Actions
                            </CardTitle>
                            <CardDescription className="text-stone-500 pl-12">Operational controls</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pl-6 pr-6 pt-6">
                            {[
                                { label: "Enter KPI Data", icon: Plus, action: () => navigate("/kpi/entry") },
                                { label: "View Analytics", icon: BarChart3, action: () => navigate("/analytics") },
                                { label: "Quality Circle", icon: Users, action: () => navigate("/quality-circle") },
                                { label: "Recognition & Rewards", icon: Award, action: () => navigate("/recognition") }
                            ].map((item, idx) => (
                                <Button
                                    key={idx}
                                    variant="outline"
                                    className="w-full justify-between group h-14 rounded-xl border-stone-200 bg-white text-stone-600 hover:border-amber-500 hover:bg-[#1C1917] hover:text-amber-50 transition-all duration-300 shadow-sm"
                                    onClick={item.action}
                                >
                                  <span className="flex items-center gap-3 font-medium">
                                    <item.icon className="w-4 h-4 text-stone-400 group-hover:text-amber-500" />
                                      {item.label}
                                  </span>
                                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                                </Button>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Reports */}
                    <Card className="bg-[#FBFBF9] border border-stone-200 rounded-[24px] shadow-lg hover:shadow-xl transition-all duration-500">
                        <CardHeader className="pb-4 border-b border-stone-100">
                            <CardTitle className="flex items-center gap-3 text-xl font-serif text-[#1C1917]">
                                <div className="p-2 bg-[#E6E4DF] rounded-lg">
                                    <FileText className="w-5 h-5 text-stone-700" />
                                </div>
                                Repository
                            </CardTitle>
                            <CardDescription className="text-stone-500 pl-12">Reports and documentation</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pl-6 pr-6 pt-6">
                            {[
                                { label: "Monthly KPI Report", icon: FileText },
                                { label: "Quality Circle Minutes", icon: ShieldCheck }
                            ].map((item, idx) => (
                                <Button key={idx} variant="outline" className="w-full justify-between group h-14 rounded-xl border-stone-200 bg-white text-stone-600 hover:border-amber-500 hover:bg-[#1C1917] hover:text-amber-50 transition-all duration-300 shadow-sm">
                                  <span className="flex items-center gap-3 font-medium">
                                    <item.icon className="w-4 h-4 text-stone-400 group-hover:text-amber-500" />
                                      {item.label}
                                  </span>
                                    <ArrowRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;