import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Calendar as CalendarIcon, Phone, Building2, CheckCircle2, XCircle, TrendingUp, Clock, Trash2, Pencil, ChevronLeft, ChevronRight } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/KPICard";
import { useMeetings, useCreateMeeting, useUpdateMeeting, useDeleteMeeting, type Meeting } from "@/hooks/useMeetings";
import { toast } from "sonner";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TagInput, TagList } from "@/components/TagInput";

/** Build an ISO string preserving local time (appends timezone offset) */
const toLocalISOString = (dateStr: string, timeStr: string) => {
  const t = timeStr || "09:00";
  const localDate = new Date(`${dateStr}T${t}:00`);
  return localDate.toISOString();
};

/** Extract local date (yyyy-MM-dd) and time (HH:mm) from an ISO/UTC date string */
const parseLocalDateTime = (isoStr: string) => {
  const d = new Date(isoStr);
  const date = format(d, "yyyy-MM-dd");
  const time = format(d, "HH:mm");
  return { date, time };
};

const Agendamentos = () => {
  const { data: meetings, isLoading } = useMeetings();
  const createMeeting = useCreateMeeting();
  const updateMeeting = useUpdateMeeting();
  const deleteMeeting = useDeleteMeeting();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    whatsapp: "",
    notes: "",
    meeting_date: "",
    meeting_time: "",
    tags: [] as string[],
  });

  const [editFormData, setEditFormData] = useState({
    company_name: "",
    whatsapp: "",
    notes: "",
    meeting_date: "",
    meeting_time: "",
    tags: [] as string[],
    status: "agendada",
    had_sale: null as boolean | null,
  });

  // Calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Metrics
  const stats = useMemo(() => {
    if (!meetings) return { total: 0, done: 0, noShow: 0, scheduled: 0, withSale: 0, conversionRate: 0 };
    const total = meetings.length;
    const done = meetings.filter(m => m.status === "realizada").length;
    const noShow = meetings.filter(m => m.status === "no_show").length;
    const scheduled = meetings.filter(m => m.status === "agendada").length;
    const withSale = meetings.filter(m => m.status === "realizada" && m.had_sale === true).length;
    const conversionRate = done > 0 ? (withSale / done) * 100 : 0;
    return { total, done, noShow, scheduled, withSale, conversionRate };
  }, [meetings]);

  const getMeetingsForDay = (day: Date) =>
    meetings?.filter(m => isSameDay(new Date(m.meeting_date), day)) || [];

  const handleCreate = async () => {
    if (!formData.company_name || !formData.meeting_date) {
      toast.error("Empresa e data são obrigatórios");
      return;
    }
    const dateTime = toLocalISOString(formData.meeting_date, formData.meeting_time);
    try {
      await createMeeting.mutateAsync({
        company_name: formData.company_name,
        whatsapp: formData.whatsapp || null,
        notes: formData.notes || null,
        meeting_date: dateTime,
        status: "agendada",
        had_sale: null,
        lead_id: null,
        tags: formData.tags.length > 0 ? formData.tags : [],
      } as any);
      toast.success("Reunião agendada!");
      setIsCreateOpen(false);
      setFormData({ company_name: "", whatsapp: "", notes: "", meeting_date: "", meeting_time: "", tags: [] });
    } catch {
      toast.error("Erro ao agendar reunião");
    }
  };

  const openEditDialog = (meeting: Meeting) => {
    const { date, time } = parseLocalDateTime(meeting.meeting_date);
    setEditFormData({
      company_name: meeting.company_name,
      whatsapp: meeting.whatsapp || "",
      notes: meeting.notes || "",
      meeting_date: date,
      meeting_time: time,
      tags: (meeting as any).tags || [],
      status: meeting.status,
      had_sale: meeting.had_sale,
    });
    setSelectedMeeting(meeting);
    setIsEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selectedMeeting || !editFormData.company_name || !editFormData.meeting_date) {
      toast.error("Empresa e data são obrigatórios");
      return;
    }
    const dateTime = toLocalISOString(editFormData.meeting_date, editFormData.meeting_time);
    try {
      await updateMeeting.mutateAsync({
        id: selectedMeeting.id,
        company_name: editFormData.company_name,
        whatsapp: editFormData.whatsapp || null,
        notes: editFormData.notes || null,
        meeting_date: dateTime,
        status: editFormData.status,
        had_sale: editFormData.status === "realizada" ? editFormData.had_sale : null,
        tags: editFormData.tags.length > 0 ? editFormData.tags : [],
      } as any);
      toast.success("Reunião atualizada!");
      setIsEditOpen(false);
      setSelectedMeeting(null);
    } catch {
      toast.error("Erro ao atualizar reunião");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedMeeting) return;
    try {
      await updateMeeting.mutateAsync({ id: selectedMeeting.id, status });
      if (status === "realizada") {
        setSelectedMeeting({ ...selectedMeeting, status: "realizada" });
      } else {
        toast.success("Status atualizado!");
        setIsStatusOpen(false);
        setSelectedMeeting(null);
      }
    } catch {
      toast.error("Erro ao atualizar status");
    }
  };

  const handleSetSale = async (hadSale: boolean) => {
    if (!selectedMeeting) return;
    try {
      await updateMeeting.mutateAsync({ id: selectedMeeting.id, had_sale: hadSale });
      toast.success("Reunião atualizada!");
      setIsStatusOpen(false);
      setSelectedMeeting(null);
    } catch {
      toast.error("Erro ao atualizar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMeeting.mutateAsync(id);
      toast.success("Reunião excluída!");
    } catch {
      toast.error("Erro ao excluir");
    }
  };

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  const selectedDayMeetings = selectedDate ? getMeetingsForDay(selectedDate) : [];

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Agendamentos</h1>
            <p className="text-xs text-muted-foreground">{stats.total} reuniões no total</p>
          </div>
          <Button size="sm" className="h-8 text-xs" onClick={() => setIsCreateOpen(true)}>
            <Plus size={12} className="mr-1" />
            Nova Reunião
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <KPICard title="Agendadas" value={stats.scheduled.toString()} icon={<Clock size={16} />} />
          <KPICard title="Realizadas" value={stats.done.toString()} icon={<CheckCircle2 size={16} />} />
          <KPICard title="No Show" value={stats.noShow.toString()} icon={<XCircle size={16} />} />
          <KPICard title="Vendas" value={stats.withSale.toString()} icon={<TrendingUp size={16} />} />
          <KPICard title="Conversão" value={`${stats.conversionRate.toFixed(0)}%`} icon={<TrendingUp size={16} />} />
        </div>

        {/* Calendar + Day Detail */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft size={16} />
                </Button>
                <h2 className="text-sm font-semibold text-foreground capitalize">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight size={16} />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-1">
                {dayNames.map(d => (
                  <div key={d} className="text-center text-[10px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-16" />
                ))}
                {calendarDays.map(day => {
                  const dayMeetings = getMeetingsForDay(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());
                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "h-16 rounded-md border border-transparent p-1 text-left transition-all hover:border-border hover:bg-muted/50",
                        isSelected && "border-primary bg-primary/5",
                        isToday && !isSelected && "bg-accent/10"
                      )}
                    >
                      <span className={cn(
                        "text-xs font-medium",
                        isToday && "text-primary font-bold",
                        !isSameMonth(day, currentMonth) && "text-muted-foreground/50"
                      )}>
                        {format(day, "d")}
                      </span>
                      {dayMeetings.length > 0 && (
                        <div className="mt-0.5 space-y-0.5">
                          {dayMeetings.slice(0, 2).map(m => (
                            <div
                              key={m.id}
                              className={cn(
                                "rounded px-1 py-0.5 text-[9px] truncate font-medium",
                                m.status === "agendada" && "bg-blue-500/20 text-blue-700 dark:text-blue-300",
                                m.status === "realizada" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
                                m.status === "no_show" && "bg-red-500/20 text-red-700 dark:text-red-300"
                              )}
                            >
                              {m.company_name}
                            </div>
                          ))}
                          {dayMeetings.length > 2 && (
                            <div className="text-[9px] text-muted-foreground pl-1">+{dayMeetings.length - 2}</div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Day Detail */}
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR }) : "Selecione um dia"}
              </h3>
              {selectedDate && (
                <div className="space-y-2">
                  {selectedDayMeetings.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhuma reunião neste dia</p>
                  ) : (
                    selectedDayMeetings.map(meeting => (
                      <motion.div
                        key={meeting.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border border-border bg-card p-3 space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <Building2 size={12} className="text-muted-foreground shrink-0" />
                              <h4 className="text-sm font-medium text-foreground truncate">{meeting.company_name}</h4>
                            </div>
                            {meeting.whatsapp && (
                              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                                <Phone size={10} />
                                <span>{meeting.whatsapp}</span>
                              </div>
                            )}
                            <p className="text-[11px] text-muted-foreground mt-0.5">
                              {format(new Date(meeting.meeting_date), "HH:mm")}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={cn(
                              "text-[10px] px-1.5 py-0",
                              meeting.status === "agendada" && "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30",
                              meeting.status === "realizada" && "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
                              meeting.status === "no_show" && "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
                            )}>
                              {meeting.status === "agendada" ? "Agendada" : meeting.status === "realizada" ? "Realizada" : "No Show"}
                            </Badge>
                            {meeting.status === "realizada" && meeting.had_sale !== null && (
                              <Badge className={cn(
                                "text-[10px] px-1.5 py-0",
                                meeting.had_sale ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              )}>
                                {meeting.had_sale ? "Venda ✓" : "Sem venda"}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {meeting.notes && (
                          <p className="text-[11px] text-muted-foreground">{meeting.notes}</p>
                        )}
                        <TagList tags={(meeting as any).tags || []} />
                        <div className="flex gap-1.5">
                          {meeting.status === "agendada" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] flex-1"
                              onClick={() => { setSelectedMeeting(meeting); setIsStatusOpen(true); }}
                            >
                              Atualizar Status
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(meeting)}
                          >
                            <Pencil size={12} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive"
                            onClick={() => handleDelete(meeting.id)}
                          >
                            <Trash2 size={12} />
                          </Button>
                        </div>
                      </motion.div>
                    ))
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full h-8 text-xs mt-2"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        meeting_date: format(selectedDate, "yyyy-MM-dd"),
                      }));
                      setIsCreateOpen(true);
                    }}
                  >
                    <Plus size={12} className="mr-1" />
                    Agendar neste dia
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Create Meeting Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Nova Reunião</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Empresa *</Label>
                <Input className="h-9 text-sm" placeholder="Nome da empresa" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">WhatsApp</Label>
                <Input className="h-9 text-sm" placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Data *</Label>
                  <Input type="date" className="h-9 text-sm" value={formData.meeting_date} onChange={e => setFormData({ ...formData, meeting_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Horário</Label>
                  <Input type="time" className="h-9 text-sm" value={formData.meeting_time} onChange={e => setFormData({ ...formData, meeting_time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Observação</Label>
                <Textarea className="text-sm resize-none" rows={2} placeholder="Notas sobre a reunião..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Etiquetas</Label>
                <TagInput tags={formData.tags} onChange={(tags) => setFormData({ ...formData, tags })} />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleCreate} disabled={createMeeting.isPending}>
                {createMeeting.isPending ? "Agendando..." : "Agendar Reunião"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Meeting Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Editar Reunião</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Empresa *</Label>
                <Input className="h-9 text-sm" placeholder="Nome da empresa" value={editFormData.company_name} onChange={e => setEditFormData({ ...editFormData, company_name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">WhatsApp</Label>
                <Input className="h-9 text-sm" placeholder="(00) 00000-0000" value={editFormData.whatsapp} onChange={e => setEditFormData({ ...editFormData, whatsapp: e.target.value })} />
              </div>
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Data *</Label>
                  <Input type="date" className="h-9 text-sm" value={editFormData.meeting_date} onChange={e => setEditFormData({ ...editFormData, meeting_date: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Horário</Label>
                  <Input type="time" className="h-9 text-sm" value={editFormData.meeting_time} onChange={e => setEditFormData({ ...editFormData, meeting_time: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={editFormData.status} onValueChange={v => setEditFormData({ ...editFormData, status: v })}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agendada">Agendada</SelectItem>
                    <SelectItem value="realizada">Realizada</SelectItem>
                    <SelectItem value="no_show">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editFormData.status === "realizada" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">Houve venda?</Label>
                  <Select
                    value={editFormData.had_sale === null ? "null" : editFormData.had_sale ? "true" : "false"}
                    onValueChange={v => setEditFormData({ ...editFormData, had_sale: v === "null" ? null : v === "true" })}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Não definido</SelectItem>
                      <SelectItem value="true">Sim</SelectItem>
                      <SelectItem value="false">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label className="text-xs">Observação</Label>
                <Textarea className="text-sm resize-none" rows={2} placeholder="Notas sobre a reunião..." value={editFormData.notes} onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Etiquetas</Label>
                <TagInput tags={editFormData.tags} onChange={(tags) => setEditFormData({ ...editFormData, tags })} />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleEdit} disabled={updateMeeting.isPending}>
                {updateMeeting.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Status Update Dialog */}
        <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">
                {selectedMeeting?.status === "realizada" ? "Houve venda?" : "Atualizar Status"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-3 space-y-3">
              {selectedMeeting?.status !== "realizada" ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    Reunião com <span className="font-medium text-foreground">{selectedMeeting?.company_name}</span>
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-9 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleUpdateStatus("realizada")}
                    >
                      <CheckCircle2 size={14} className="mr-1" />
                      Realizada
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 h-9 text-sm"
                      onClick={() => handleUpdateStatus("no_show")}
                    >
                      <XCircle size={14} className="mr-1" />
                      No Show
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    A reunião com <span className="font-medium text-foreground">{selectedMeeting?.company_name}</span> resultou em venda?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 h-9 text-sm bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleSetSale(true)}
                    >
                      Sim, houve venda
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-9 text-sm"
                      onClick={() => handleSetSale(false)}
                    >
                      Não houve
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Agendamentos;
