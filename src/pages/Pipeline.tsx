import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Phone, Mail, MoreVertical, Edit2, Trash2, Filter, Calendar } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, type Lead } from "@/hooks/useLeads";
import { useCreateClient } from "@/hooks/useClients";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const columns = [
  { id: "contato_feito", title: "Contato Feito", color: "bg-blue-500" },
  { id: "aquecendo", title: "Aquecendo", color: "bg-amber-500" },
  { id: "proposta_enviada", title: "Proposta Enviada", color: "bg-purple-500" },
  { id: "venda_concluida", title: "Venda Concluída", color: "bg-emerald-500" },
] as const;

const sourceLabels = {
  instagram: { label: "Instagram", class: "source-instagram" },
  trafego_pago: { label: "Tráfego", class: "source-trafego" },
  indicacao: { label: "Indicação", class: "source-indicacao" },
  prospeccao: { label: "Prospecção", class: "source-prospeccao" },
  outro: { label: "Outro", class: "bg-gray-500 text-white text-xs" },
};

const Pipeline = () => {
  const { data: leads, isLoading } = useLeads();
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const createClient = useCreateClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "" as "instagram" | "prospeccao" | "trafego_pago" | "indicacao" | "outro" | "",
    estimated_value: "",
    notes: "",
  });

  const filteredLeads = leads?.filter((lead) => {
    if (!dateFilter) return true;
    const leadDate = new Date(lead.created_at);
    return (
      leadDate.getDate() === dateFilter.getDate() &&
      leadDate.getMonth() === dateFilter.getMonth() &&
      leadDate.getFullYear() === dateFilter.getFullYear()
    );
  });

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, status: Lead["stage"]) => {
    e.preventDefault();
    if (draggedLead && draggedLead.stage !== status) {
      try {
        await updateLead.mutateAsync({ id: draggedLead.id, stage: status });
        toast.success("Lead movido com sucesso!");
      } catch {
        toast.error("Erro ao mover lead");
      }
    }
    setDraggedLead(null);
  };

  const handleCreateLead = async () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      await createLead.mutateAsync({
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        source: (formData.source as Lead["source"]) || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        notes: formData.notes || null,
        stage: "contato_feito",
      });
      toast.success("Lead criado com sucesso!");
      setIsDialogOpen(false);
      setFormData({ name: "", phone: "", email: "", source: "", estimated_value: "", notes: "" });
    } catch {
      toast.error("Erro ao criar lead");
    }
  };

  const handleUpdateLead = async () => {
    if (!selectedLead) return;
    try {
      await updateLead.mutateAsync({
        id: selectedLead.id,
        name: formData.name,
        phone: formData.phone || null,
        email: formData.email || null,
        source: (formData.source as Lead["source"]) || null,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : null,
        notes: formData.notes || null,
      });
      toast.success("Lead atualizado!");
      setIsEditDialogOpen(false);
      setSelectedLead(null);
    } catch {
      toast.error("Erro ao atualizar lead");
    }
  };

  const handleDeleteLead = async (id: string) => {
    try {
      await deleteLead.mutateAsync(id);
      toast.success("Lead excluído!");
    } catch {
      toast.error("Erro ao excluir lead");
    }
  };

  const handleConvertToClient = async () => {
    if (!selectedLead) return;
    try {
      await createClient.mutateAsync({
        name: selectedLead.name,
        email: selectedLead.email,
        phone: selectedLead.phone,
        lead_id: selectedLead.id,
        status: "andamento",
      });
      await updateLead.mutateAsync({ id: selectedLead.id, stage: "venda_concluida" });
      toast.success("Cliente criado a partir do lead!");
      setIsClientDialogOpen(false);
      setSelectedLead(null);
    } catch {
      toast.error("Erro ao converter lead");
    }
  };

  const openEditDialog = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      phone: lead.phone || "",
      email: lead.email || "",
      source: lead.source || "",
      estimated_value: lead.estimated_value?.toString() || "",
      notes: lead.notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const getLeadsByStatus = (status: Lead["stage"]) =>
    filteredLeads?.filter((lead) => lead.stage === status) || [];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Pipeline</h1>
            <p className="text-xs text-muted-foreground">{leads?.length || 0} leads no funil</p>
          </div>

          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Filter size={12} className="mr-1" />
                  {dateFilter ? format(dateFilter, "dd/MM") : "Filtrar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  initialFocus
                />
                {dateFilter && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setDateFilter(undefined)}>
                      Limpar filtro
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>

            <Button size="sm" className="h-8 text-xs" onClick={() => setIsDialogOpen(true)}>
              <Plus size={12} className="mr-1" />
              Novo Lead
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-3 lg:grid-cols-4">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className={cn("h-2 w-2 rounded-full", column.color)} />
                  <h3 className="text-xs font-medium text-foreground">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                  {getLeadsByStatus(column.id).length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-2">
                {getLeadsByStatus(column.id).map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead)}
                    className="cursor-grab rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing"
                    onClick={() => openEditDialog(lead)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-foreground truncate">{lead.name}</h4>
                        <div className="mt-1.5 space-y-0.5">
                          {lead.phone && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Phone size={10} />
                              <span className="truncate">{lead.phone}</span>
                            </div>
                          )}
                          {lead.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <Mail size={10} />
                              <span className="truncate">{lead.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <button className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreVertical size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openEditDialog(lead); }}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" />
                            Editar
                          </DropdownMenuItem>
                          {lead.stage !== "venda_concluida" && (
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setIsClientDialogOpen(true); }}>
                              <Plus className="mr-2 h-3.5 w-3.5" />
                              Converter em Cliente
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Source Badge & Value */}
                    <div className="mt-2 flex items-center justify-between">
                      {lead.source && (
                        <Badge className={cn("text-[10px] px-1.5 py-0", sourceLabels[lead.source]?.class || "bg-gray-500 text-white")}>
                          {sourceLabels[lead.source]?.label || lead.source}
                        </Badge>
                      )}
                      {lead.estimated_value && (
                        <span className="text-xs font-medium text-primary">
                          R$ {lead.estimated_value.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Create Lead Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Novo Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Nome *</Label>
                <Input id="name" placeholder="Nome do lead" className="h-9 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">WhatsApp</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" className="h-9 text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" className="h-9 text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="source" className="text-xs">Origem</Label>
                  <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v as typeof formData.source })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="trafego_pago">Tráfego Pago</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="prospeccao">Prospecção</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="value" className="text-xs">Valor Estimado</Label>
                  <Input id="value" type="number" placeholder="0,00" className="h-9 text-sm" value={formData.estimated_value} onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes" className="text-xs">Observações</Label>
                <Textarea id="notes" placeholder="Notas..." className="text-sm resize-none" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleCreateLead} disabled={createLead.isPending}>
                {createLead.isPending ? "Criando..." : "Criar Lead"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Lead Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Editar Lead</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name" className="text-xs">Nome *</Label>
                <Input id="edit-name" className="h-9 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-phone" className="text-xs">WhatsApp</Label>
                  <Input id="edit-phone" className="h-9 text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-email" className="text-xs">Email</Label>
                  <Input id="edit-email" type="email" className="h-9 text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Origem</Label>
                  <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v as typeof formData.source })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="trafego_pago">Tráfego Pago</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="prospeccao">Prospecção</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Valor Estimado</Label>
                  <Input type="number" className="h-9 text-sm" value={formData.estimated_value} onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Observações</Label>
                <Textarea className="text-sm resize-none" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <Button className="w-full h-9 text-sm" onClick={handleUpdateLead} disabled={updateLead.isPending}>
                {updateLead.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Convert to Client Dialog */}
        <Dialog open={isClientDialogOpen} onOpenChange={setIsClientDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-base">Converter em Cliente</DialogTitle>
            </DialogHeader>
            <div className="py-3 space-y-3">
              <p className="text-sm text-muted-foreground">
                Deseja converter <span className="font-medium text-foreground">{selectedLead?.name}</span> em cliente?
              </p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setIsClientDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1 h-9 text-sm" onClick={handleConvertToClient} disabled={createClient.isPending}>
                  {createClient.isPending ? "Convertendo..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
