import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  UserPlus,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KPICard } from "@/components/KPICard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient, type Client } from "@/hooks/useClients";
import { useLeads, type Lead } from "@/hooks/useLeads";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const statusConfig = {
  entregue: {
    label: "Entregue",
    icon: CheckCircle,
    class: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
  },
  andamento: {
    label: "Em Andamento",
    icon: Clock,
    class: "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    class: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
  },
};

const Clientes = () => {
  const { data: clients, isLoading } = useClients();
  const { data: leads } = useLeads();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    product_sold: "",
    sale_value: "",
    is_recurrent: false,
    recurrence_value: "",
    recurrence_date: "",
    contract_end_date: "",
    status: "andamento" as Client["status"],
  });

  // Filter leads that are not yet clients (stage = venda_concluida or any stage)
  const availableLeads = leads?.filter(lead => {
    // Check if lead is already a client
    const isAlreadyClient = clients?.some(c => c.lead_id === lead.id);
    return !isAlreadyClient;
  }) || [];

  const filteredClients = clients?.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.product_sold?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!dateFilter) return matchesSearch;

    const clientDate = new Date(client.created_at);
    return (
      matchesSearch &&
      clientDate.getDate() === dateFilter.getDate() &&
      clientDate.getMonth() === dateFilter.getMonth() &&
      clientDate.getFullYear() === dateFilter.getFullYear()
    );
  });

  const stats = {
    total: clients?.length || 0,
    delivered: clients?.filter((c) => c.status === "entregue").length || 0,
    recurrent: clients?.filter((c) => c.is_recurrent).length || 0,
    churn: clients?.length
      ? Math.round((clients.filter((c) => c.status === "cancelado").length / clients.length) * 100)
      : 0,
  };

  const handleCreateClient = async () => {
    if (!formData.name) {
      toast.error("Nome é obrigatório");
      return;
    }
    try {
      await createClient.mutateAsync({
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        product_sold: formData.product_sold || null,
        sale_value: formData.sale_value ? parseFloat(formData.sale_value) : null,
        is_recurrent: formData.is_recurrent,
        recurrence_value: formData.recurrence_value ? parseFloat(formData.recurrence_value) : null,
        recurrence_date: formData.recurrence_date ? parseInt(formData.recurrence_date) : null,
        contract_end_date: formData.contract_end_date || null,
        status: formData.status,
        lead_id: selectedLead?.id || null,
      });
      toast.success("Cliente criado!");
      setIsDialogOpen(false);
      setIsLeadDialogOpen(false);
      setSelectedLead(null);
      resetForm();
    } catch {
      toast.error("Erro ao criar cliente");
    }
  };

  const handleCreateFromLead = (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || "",
      phone: lead.phone || "",
      product_sold: "",
      sale_value: lead.estimated_value?.toString() || "",
      is_recurrent: false,
      recurrence_value: "",
      recurrence_date: "",
      contract_end_date: "",
      status: "andamento",
    });
    setIsLeadDialogOpen(false);
    setIsDialogOpen(true);
  };

  const handleUpdateClient = async () => {
    if (!selectedClient) return;
    try {
      await updateClient.mutateAsync({
        id: selectedClient.id,
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        product_sold: formData.product_sold || null,
        sale_value: formData.sale_value ? parseFloat(formData.sale_value) : null,
        is_recurrent: formData.is_recurrent,
        recurrence_value: formData.recurrence_value ? parseFloat(formData.recurrence_value) : null,
        recurrence_date: formData.recurrence_date ? parseInt(formData.recurrence_date) : null,
        contract_end_date: formData.contract_end_date || null,
        status: formData.status,
      });
      toast.success("Cliente atualizado!");
      setIsEditDialogOpen(false);
      setSelectedClient(null);
    } catch {
      toast.error("Erro ao atualizar cliente");
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      await deleteClient.mutateAsync(id);
      toast.success("Cliente excluído!");
    } catch {
      toast.error("Erro ao excluir cliente");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      product_sold: "",
      sale_value: "",
      is_recurrent: false,
      recurrence_value: "",
      recurrence_date: "",
      contract_end_date: "",
      status: "andamento",
    });
    setSelectedLead(null);
  };

  const openEditDialog = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      product_sold: client.product_sold || "",
      sale_value: client.sale_value?.toString() || "",
      is_recurrent: client.is_recurrent || false,
      recurrence_value: client.recurrence_value?.toString() || "",
      recurrence_date: client.recurrence_date?.toString() || "",
      contract_end_date: client.contract_end_date || "",
      status: client.status || "andamento",
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </AppLayout>
    );
  }

  const ClientForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="space-y-3 py-3">
      {selectedLead && !isEdit && (
        <div className="bg-muted/50 rounded-md p-2 text-xs text-muted-foreground">
          Criando cliente a partir do lead: <span className="font-medium text-foreground">{selectedLead.name}</span>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome *</Label>
          <Input className="h-9 text-sm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Email</Label>
          <Input type="email" className="h-9 text-sm" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Telefone</Label>
          <Input className="h-9 text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Produto Vendido</Label>
          <Input className="h-9 text-sm" value={formData.product_sold} onChange={(e) => setFormData({ ...formData, product_sold: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Valor da Venda</Label>
          <Input type="number" className="h-9 text-sm" value={formData.sale_value} onChange={(e) => setFormData({ ...formData, sale_value: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Status</Label>
          <Select value={formData.status || "andamento"} onValueChange={(v) => setFormData({ ...formData, status: v as Client["status"] })}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="andamento">Em Andamento</SelectItem>
              <SelectItem value="entregue">Entregue</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border border-border p-3">
        <div>
          <p className="text-sm font-medium text-foreground">Pagamento Recorrente</p>
          <p className="text-xs text-muted-foreground">Cliente paga mensalmente?</p>
        </div>
        <Switch checked={formData.is_recurrent} onCheckedChange={(v) => setFormData({ ...formData, is_recurrent: v })} />
      </div>
      {formData.is_recurrent && (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Valor Mensal</Label>
              <Input type="number" className="h-9 text-sm" value={formData.recurrence_value} onChange={(e) => setFormData({ ...formData, recurrence_value: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dia do Pagamento</Label>
              <Input type="number" min="1" max="31" className="h-9 text-sm" value={formData.recurrence_date} onChange={(e) => setFormData({ ...formData, recurrence_date: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Data Fim do Contrato (opcional)</Label>
            <Input type="date" className="h-9 text-sm" value={formData.contract_end_date} onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })} />
            <p className="text-[10px] text-muted-foreground">Deixe vazio para contrato sem prazo definido</p>
          </div>
        </>
      )}
      <Button className="w-full h-9 text-sm" onClick={isEdit ? handleUpdateClient : handleCreateClient} disabled={isEdit ? updateClient.isPending : createClient.isPending}>
        {isEdit 
          ? (updateClient.isPending ? "Salvando..." : "Salvar Alterações")
          : (createClient.isPending ? "Criando..." : "Criar Cliente")
        }
      </Button>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Clientes</h1>
            <p className="text-xs text-muted-foreground">{clients?.length || 0} clientes cadastrados</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setIsLeadDialogOpen(true)}>
              <UserPlus size={12} className="mr-1" />
              Adicionar do Pipeline
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus size={12} className="mr-1" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <KPICard title="Total" value={stats.total} icon={<CheckCircle size={16} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <KPICard title="Entregues" value={stats.delivered} icon={<CheckCircle size={16} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <KPICard title="Recorrentes" value={stats.recurrent} icon={<Clock size={16} />} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <KPICard title="Churn" value={`${stats.churn}%`} icon={<XCircle size={16} />} />
          </motion.div>
        </div>

        {/* Search & Table */}
        <div className="card-elevated overflow-hidden">
          {/* Search */}
          <div className="border-b border-border p-3 flex gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Filter size={12} className="mr-1" />
                  {dateFilter ? format(dateFilter, "dd/MM") : "Data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                {dateFilter && (
                  <div className="p-2 border-t">
                    <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setDateFilter(undefined)}>
                      Limpar
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Cliente</TableHead>
                <TableHead className="text-xs">Produto</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Recorrência</TableHead>
                <TableHead className="text-xs">Data</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    Nenhum cliente encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients?.map((client) => {
                  const StatusIcon = statusConfig[client.status || "andamento"].icon;
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div>
                          <p className="text-sm font-medium text-foreground">{client.name}</p>
                          <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-foreground">{client.product_sold || "-"}</TableCell>
                      <TableCell>
                        <Badge className={cn("gap-1 text-[10px]", statusConfig[client.status || "andamento"].class)}>
                          <StatusIcon size={10} />
                          {statusConfig[client.status || "andamento"].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {client.is_recurrent ? (
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              R$ {client.recurrence_value?.toLocaleString("pt-BR")}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Dia {client.recurrence_date}</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Único</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(client.created_at), "dd/MM/yy")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <MoreVertical size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(client)}>
                              <Edit2 className="mr-2 h-3.5 w-3.5" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClient(client.id)}>
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add from Pipeline Dialog */}
        <Dialog open={isLeadDialogOpen} onOpenChange={setIsLeadDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base">Adicionar do Pipeline</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-3">
              {availableLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum lead disponível no pipeline
                </p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {availableLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleCreateFromLead(lead)}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.email || lead.phone || "Sem contato"}</p>
                      </div>
                      {lead.estimated_value && (
                        <span className="text-xs font-medium text-gold">
                          R$ {lead.estimated_value.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Client Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">
                {selectedLead ? `Novo Cliente (do Lead)` : "Novo Cliente"}
              </DialogTitle>
            </DialogHeader>
            <ClientForm />
          </DialogContent>
        </Dialog>

        {/* Edit Client Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base">Editar Cliente</DialogTitle>
            </DialogHeader>
            <ClientForm isEdit />
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Clientes;
