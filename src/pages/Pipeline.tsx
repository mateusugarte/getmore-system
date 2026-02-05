import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Phone, Mail, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: "instagram" | "trafego" | "indicacao" | "prospeccao";
  status: "contato_feito" | "aquecendo" | "proposta_enviada" | "venda_concluida";
  value?: number;
  notes?: string;
  tags: string[];
}

const columns = [
  { id: "contato_feito", title: "Contato Feito", color: "bg-blue-500" },
  { id: "aquecendo", title: "Aquecendo", color: "bg-amber-500" },
  { id: "proposta_enviada", title: "Proposta Enviada", color: "bg-purple-500" },
  { id: "venda_concluida", title: "Venda Concluída", color: "bg-emerald-500" },
];

const sourceLabels = {
  instagram: { label: "Instagram", class: "source-instagram" },
  trafego: { label: "Tráfego Pago", class: "source-trafego" },
  indicacao: { label: "Indicação", class: "source-indicacao" },
  prospeccao: { label: "Prospecção", class: "source-prospeccao" },
};

const initialLeads: Lead[] = [
  {
    id: "1",
    name: "Maria Silva",
    phone: "(11) 99999-9999",
    email: "maria@email.com",
    source: "instagram",
    status: "contato_feito",
    value: 2500,
    tags: ["Premium"],
  },
  {
    id: "2",
    name: "João Santos",
    phone: "(11) 98888-8888",
    email: "joao@email.com",
    source: "trafego",
    status: "aquecendo",
    value: 5000,
    tags: ["Urgente"],
  },
  {
    id: "3",
    name: "Ana Oliveira",
    phone: "(11) 97777-7777",
    email: "ana@email.com",
    source: "indicacao",
    status: "proposta_enviada",
    value: 8500,
    tags: ["B2B"],
  },
  {
    id: "4",
    name: "Pedro Costa",
    phone: "(11) 96666-6666",
    email: "pedro@email.com",
    source: "prospeccao",
    status: "venda_concluida",
    value: 12000,
    tags: ["Recorrente"],
  },
];

const Pipeline = () => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, status: Lead["status"]) => {
    e.preventDefault();
    if (draggedLead) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === draggedLead.id ? { ...lead, status } : lead
        )
      );
      setDraggedLead(null);
    }
  };

  const getLeadsByStatus = (status: Lead["status"]) =>
    leads.filter((lead) => lead.status === status);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pipeline</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie seus leads e acompanhe o funil de vendas
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-rose hover:opacity-90">
                <Plus size={18} />
                Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Lead</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input id="name" placeholder="Nome do lead" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input id="phone" placeholder="(00) 00000-0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplo.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="source">Origem</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="trafego">Tráfego Pago</SelectItem>
                      <SelectItem value="indicacao">Indicação</SelectItem>
                      <SelectItem value="prospeccao">Prospecção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea id="notes" placeholder="Notas sobre o lead..." />
                </div>
                <Button className="w-full bg-gradient-rose hover:opacity-90">
                  Criar Lead
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board */}
        <div className="grid gap-4 lg:grid-cols-4">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id as Lead["status"])}
            >
              {/* Column Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", column.color)} />
                  <h3 className="font-semibold text-foreground">{column.title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {getLeadsByStatus(column.id as Lead["status"]).length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {getLeadsByStatus(column.id as Lead["status"]).map((lead) => (
                  <motion.div
                    key={lead.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, lead)}
                    className="cursor-grab rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md active:cursor-grabbing"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">{lead.name}</h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone size={12} />
                            {lead.phone}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail size={12} />
                            {lead.email}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit2 className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Source Badge */}
                    <div className="mt-3 flex items-center justify-between">
                      <Badge className={cn("text-xs", sourceLabels[lead.source].class)}>
                        {sourceLabels[lead.source].label}
                      </Badge>
                      {lead.value && (
                        <span className="text-sm font-semibold text-primary">
                          R$ {lead.value.toLocaleString("pt-BR")}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {lead.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Pipeline;
