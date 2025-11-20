import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Eye, Loader2, CheckCircle2, XCircle, Clock, Crown, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface KPIRecord {
    id: string;
    entry_date: string;
    department: string;
    total_production: number;
    actual_defects: number;
    defect_percentage: number | null;
    variance: number | null;
    reason_for_defects: string | null;
    corrective_action: string | null;
    responsible_officer: string | null;
    status: string | null;
    expected_defects: number;
}

interface KPIRecordsTableProps {
    department?: string | null;
    userRole?: string | null;
}

export const KPIRecordsTable = ({ department, userRole }: KPIRecordsTableProps) => {
    const [records, setRecords] = useState<KPIRecord[]>([]);
    const [loading, setLoading] = useState(true);

    // State for "Update Status"
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<KPIRecord | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [isUpdating, setIsUpdating] = useState(false);

    // State for "View Details"
    const [isViewOpen, setIsViewOpen] = useState(false);
    const [viewingRecord, setViewingRecord] = useState<KPIRecord | null>(null);

    const { toast } = useToast();

    useEffect(() => {
        fetchRecords();
    }, [department]);

    const fetchRecords = async () => {
        try {
            let query = supabase
                .from("kpi_records")
                .select("*")
                .order("entry_date", { ascending: false })
                .limit(10);

            if (department && userRole !== "admin") {
                query = query.eq("department", department as any);
            }

            const { data, error } = await query;

            if (error) throw error;

            setRecords((data as KPIRecord[]) || []);
        } catch (error) {
            console.error("Error fetching KPI records:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- Actions ---

    const handleViewClick = (record: KPIRecord) => {
        setViewingRecord(record);
        setIsViewOpen(true);
    };

    const handleEditClick = (record: KPIRecord) => {
        setSelectedRecord(record);
        // Default to existing status or 'pending' if null.
        // Normalize casing to handle potential DB mismatch if any.
        setNewStatus(record.status?.toLowerCase() || "pending");
        setIsStatusOpen(true);
    };

    const handleStatusUpdate = async () => {
        if (!selectedRecord) return;

        setIsUpdating(true);
        try {
            // We must use .select() to confirm the row was actually found and updated.
            // If RLS blocks it, data will be empty.
            const { data, error } = await supabase
                .from("kpi_records")
                .update({
                    status: newStatus as any
                })
                .eq("id", selectedRecord.id)
                .select();

            if (error) throw error;

            if (!data || data.length === 0) {
                throw new Error("Update failed. You may not have permission to modify this record.");
            }

            // Optimistic Update: Update local state immediately
            setRecords((prevRecords) =>
                prevRecords.map((rec) =>
                    rec.id === selectedRecord.id ? { ...rec, status: newStatus } : rec
                )
            );

            toast({
                title: "Status Updated Successfully",
                description: `Record has been marked as ${newStatus.toUpperCase()}.`,
                className: "bg-[#1C1917] text-white border-l-4 border-amber-500 shadow-2xl"
            });

            setIsStatusOpen(false);
        } catch (error: any) {
            toast({
                title: "Update Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Helpers ---

    const getDepartmentName = (dept: string) => {
        return dept
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getStatusBadge = (status: string | null) => {
        const s = status?.toLowerCase() || "pending";
        if (s === "approved") return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white border-none px-3 py-1">Approved</Badge>;
        if (s === "rejected") return <Badge variant="destructive" className="px-3 py-1">Rejected</Badge>;
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1">Pending</Badge>;
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent KPI Records</CardTitle>
                    <CardDescription>Loading records...</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (records.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent KPI Records</CardTitle>
                    <CardDescription>No records found for the selected criteria.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">No data available.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card className="bg-[#FBFBF9] border-stone-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="font-serif text-[#1C1917]">Recent KPI Records</CardTitle>
                    <CardDescription>View details and manage record status</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-stone-200 overflow-x-auto bg-white">
                        <Table>
                            <TableHeader className="bg-stone-50">
                                <TableRow>
                                    <TableHead className="text-stone-500 font-semibold">Date</TableHead>
                                    {userRole === "admin" && <TableHead className="text-stone-500 font-semibold">Department</TableHead>}
                                    <TableHead className="text-stone-500 font-semibold">Production</TableHead>
                                    <TableHead className="text-stone-500 font-semibold">Defects</TableHead>
                                    <TableHead className="text-stone-500 font-semibold">Defect %</TableHead>
                                    <TableHead className="text-stone-500 font-semibold">Status</TableHead>
                                    <TableHead className="text-right text-stone-500 font-semibold">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {records.map((record) => (
                                    <TableRow key={record.id} className="hover:bg-stone-50 transition-colors">
                                        <TableCell className="font-medium whitespace-nowrap text-stone-700">{formatDate(record.entry_date)}</TableCell>
                                        {userRole === "admin" && (
                                            <TableCell className="text-stone-600">{getDepartmentName(record.department)}</TableCell>
                                        )}
                                        <TableCell className="text-stone-600">{record.total_production.toLocaleString()}</TableCell>
                                        <TableCell className="text-stone-600">{record.actual_defects.toLocaleString()}</TableCell>
                                        <TableCell>
                      <span className={`font-bold ${record.defect_percentage && record.defect_percentage > 5 ? "text-red-600" : "text-emerald-600"}`}>
                        {record.defect_percentage?.toFixed(2)}%
                      </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(record.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleViewClick(record)}
                                                    title="View Details"
                                                    className="h-8 w-8 hover:bg-stone-100 text-stone-500 hover:text-[#1C1917]"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(record)}
                                                    title="Update Status"
                                                    className="h-8 w-8 hover:bg-amber-50 text-stone-500 hover:text-amber-600"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* --- Premium View Details Dialog --- */}
            <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
                <DialogContent className="sm:max-w-[600px] bg-[#FBFBF9] border-stone-200 shadow-2xl p-0 overflow-hidden gap-0">
                    <div className="bg-[#1C1917] px-6 py-6 border-b border-amber-500/20">
                        <DialogTitle className="text-2xl font-serif text-amber-50 flex items-center gap-3">
                            <Crown className="w-5 h-5 text-amber-500" />
                            Record Details
                        </DialogTitle>
                        <DialogDescription className="text-stone-400 mt-1">
                            Entry ID: <span className="font-mono text-amber-500/70">{viewingRecord?.id.slice(0,8)}</span>
                        </DialogDescription>
                    </div>

                    {viewingRecord && (
                        <ScrollArea className="max-h-[60vh]">
                            <div className="p-6 space-y-6">
                                {/* Status Banner */}
                                <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-stone-400">Status</Label>
                                        <div className="flex items-center gap-2">
                                            {(viewingRecord.status === 'approved') && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                            {(viewingRecord.status === 'rejected') && <XCircle className="w-5 h-5 text-red-500" />}
                                            {(viewingRecord.status === 'pending' || !viewingRecord.status) && <Clock className="w-5 h-5 text-amber-500" />}
                                            <span className="text-lg font-bold text-stone-800 capitalize">{viewingRecord.status || 'Pending'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right space-y-1">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-stone-400">Date</Label>
                                        <p className="text-lg font-serif font-medium text-stone-800">{formatDate(viewingRecord.entry_date)}</p>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-center">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Production</Label>
                                        <p className="text-2xl font-serif text-stone-900 mt-1">{viewingRecord.total_production.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-center">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Defects</Label>
                                        <p className="text-2xl font-serif text-stone-900 mt-1">{viewingRecord.actual_defects.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200/60 text-center">
                                        <Label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Rate</Label>
                                        <p className={`text-2xl font-serif mt-1 ${viewingRecord.defect_percentage && viewingRecord.defect_percentage > 5 ? "text-red-600" : "text-emerald-600"}`}>
                                            {viewingRecord.defect_percentage?.toFixed(2)}%
                                        </p>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-stone-400">Department Details</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 bg-white rounded-lg border border-stone-100">
                                                <span className="text-xs text-stone-400 block mb-1">Department</span>
                                                <span className="text-sm font-medium text-stone-800">{getDepartmentName(viewingRecord.department)}</span>
                                            </div>
                                            <div className="p-3 bg-white rounded-lg border border-stone-100">
                                                <span className="text-xs text-stone-400 block mb-1">Officer</span>
                                                <span className="text-sm font-medium text-stone-800">{viewingRecord.responsible_officer || "—"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-bold uppercase tracking-widest text-stone-400">Analysis</Label>

                                        <div className="space-y-1">
                                            <span className="text-xs text-stone-500 ml-1">Root Cause</span>
                                            <div className="p-4 bg-white rounded-lg border border-stone-100 text-sm text-stone-700 leading-relaxed">
                                                {viewingRecord.reason_for_defects || "No reason recorded."}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <span className="text-xs text-stone-500 ml-1">Corrective Measures</span>
                                            <div className="p-4 bg-white rounded-lg border border-stone-100 text-sm text-stone-700 leading-relaxed">
                                                {viewingRecord.corrective_action || "No corrective actions recorded."}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                    <DialogFooter className="p-4 bg-stone-50 border-t border-stone-200">
                        <Button
                            onClick={() => setIsViewOpen(false)}
                            className="w-full bg-[#1C1917] text-white hover:bg-stone-800 h-12 rounded-xl font-medium tracking-wide shadow-lg"
                        >
                            Close Report
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- Premium Update Status Dialog (Wealthiest Look) --- */}
            <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
                <DialogContent className="sm:max-w-[400px] bg-[#1C1917] border border-amber-500/20 shadow-2xl p-0 overflow-hidden gap-0 text-amber-50">
                    {/* Gold accent line */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-[#1C1917] via-amber-500 to-[#1C1917]"></div>

                    <div className="p-8">
                        <DialogHeader className="mb-6 text-center">
                            <div className="mx-auto w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-amber-500/30 mb-4 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                            </div>
                            <DialogTitle className="text-2xl font-serif text-white tracking-tight">Authorization Required</DialogTitle>
                            <DialogDescription className="text-stone-400 text-sm">
                                Update the workflow status for this record. This action will be logged.
                            </DialogDescription>
                        </DialogHeader>

                        {selectedRecord && (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 ml-1">Current Status</Label>
                                    <div className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                                        <span className="text-sm font-medium capitalize text-stone-300">{selectedRecord.status || 'Pending'}</span>
                                        <div className={`w-2.5 h-2.5 rounded-full ${selectedRecord.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : selectedRecord.status === 'rejected' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'}`}></div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status" className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500/80 ml-1">New Determination</Label>
                                    <Select value={newStatus} onValueChange={setNewStatus}>
                                        <SelectTrigger id="status" className="bg-white/5 border-white/10 text-stone-200 h-14 rounded-xl focus:ring-0 focus:border-amber-500/50 hover:bg-white/10 transition-colors">
                                            <SelectValue placeholder="Select decision" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#292524] border-amber-500/20 text-stone-200 shadow-2xl">
                                            <SelectItem value="pending" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-amber-500" /> Pending Review</span>
                                            </SelectItem>
                                            <SelectItem value="approved" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Approve Record</span>
                                            </SelectItem>
                                            <SelectItem value="rejected" className="focus:bg-white/10 focus:text-white cursor-pointer py-3">
                                                <span className="flex items-center gap-2"><XCircle className="w-4 h-4 text-red-500" /> Reject Record</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 mt-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsStatusOpen(false)}
                                className="flex-1 h-12 rounded-xl border-stone-700 bg-transparent text-stone-400 hover:bg-white/5 hover:text-white hover:border-stone-500 transition-all duration-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleStatusUpdate}
                                className="flex-1 h-12 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold tracking-wide shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)] border border-amber-400/20 transition-all duration-300"
                                disabled={isUpdating || newStatus === selectedRecord?.status}
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Update"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};