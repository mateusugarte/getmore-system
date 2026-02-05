import { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Package,
  RotateCcw,
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
  DialogTrigger,
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
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface ClientProcess {
  id: string;
  title: string;
  isCompleted: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  productSold: string;
  isRecurrent: boolean;
  recurrenceValue?: number;
  recurrenceDate?: number;
  status: "entregue" | "andamento" | "cancelado";
  processes: ClientProcess[];
  createdAt: string;
}

const initialClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    productSold: "Mentoria Premium",
    isRecurrent: true,
    recurrenceValue: 2500,
    recurrenceDate: 10,
    status: "entregue",
    processes: [
      { id: "1", title: "Onboarding", isCompleted: true },
      { id: "2", title: "Primeira sessão", isCompleted: true },
    ],
    createdAt: "2026-01-15",
  },
  {
    id: "2",
    name: "João Santos",
    email: "joao@empresa.com",
    phone: "(11) 98888-8888",
    productSold: "Consultoria Empresarial",
    isRecurrent: false,
    status: "andamento",
    processes: [
      { id: "1", title: "Diagnóstico", isCompleted: true },
      { id: "2", title: "Proposta de melhorias", isCompleted: false },
      { id: "3", title: "Implementação", isCompleted: false },
    ],
    createdAt: "2026-01-20",
  },
  {
    id: "3",
    name: "Ana Oliveira",
    email: "ana@studio.com",
    phone: "(11) 97777-7777",
    productSold: "Curso Online",
    isRecurrent: true,
    recurrenceValue: 197,
    recurrenceDate: 5,
    status: "entregue",
    processes: [
      { id: "1", title: "Acesso liberado", isCompleted: true },
    ],
    createdAt: "2026-02-01",
  },
  {
    id: "4",
    name: "Pedro Costa",
    email: "pedro@tech.io",
    phone: "(11) 96666-6666",
    productSold: "Mentoria VIP",
    isRecurrent: true,
    recurrenceValue: 5000,
    recurrenceDate: 15,
    status: "cancelado",
    processes: [
      { id: "1", title: "Onboarding", isCompleted: true },
      { id: "2", title: "Primeira sessão", isCompleted: true },
    ],
    createdAt: "2026-01-10",
  },
];

const statusConfig = {
  entregue: {
    label: "Entregue",
    icon: CheckCircle,
    class: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  andamento: {
    label: "Em Andamento",
    icon: Clock,
    class: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  cancelado: {
    label: "Cancelado",
    icon: XCircle,
    class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

const Clientes = () => {
  const [clients] = useState<Client[]>(initialClients);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.productSold.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deliveredCount = clients.filter((c) => c.status === "entregue").length;
  const churnRate = Math.round(
    (clients.filter((c) => c.status === "cancelado").length / clients.length) * 100
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="mt-1 text-muted-foreground">
              Gerencie sua carteira de clientes
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-rose hover:opacity-90">
                <Plus size={18} />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" placeholder="Nome do cliente" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="email@exemplo.com" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" placeholder="(00) 00000-0000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto Vendido</Label>
                    <Input id="product" placeholder="Nome do produto" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium text-foreground">Pagamento Recorrente</p>
                    <p className="text-sm text-muted-foreground">
                      Este cliente paga mensalmente?
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status do Produto</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="andamento">Em Andamento</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full bg-gradient-rose hover:opacity-90">
                  Criar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <KPICard
              title="Total de Clientes"
              value={clients.length}
              icon={<Package size={24} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <KPICard
              title="Produtos Entregues"
              value={deliveredCount}
              subtitle="Este mês"
              icon={<CheckCircle size={24} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <KPICard
              title="Recorrentes"
              value={clients.filter((c) => c.isRecurrent).length}
              icon={<RotateCcw size={24} />}
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <KPICard
              title="Taxa de Churn"
              value={`${churnRate}%`}
              icon={<XCircle size={24} />}
              trend={churnRate > 10 ? { value: churnRate, isPositive: false } : undefined}
            />
          </motion.div>
        </div>

        {/* Search & Table */}
        <div className="card-elevated overflow-hidden">
          {/* Search */}
          <div className="border-b border-border p-4">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar clientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recorrência</TableHead>
                <TableHead>Processos</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => {
                const StatusIcon = statusConfig[client.status].icon;
                const completedProcesses = client.processes.filter(
                  (p) => p.isCompleted
                ).length;

                return (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground">{client.productSold}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("gap-1", statusConfig[client.status].class)}>
                        <StatusIcon size={12} />
                        {statusConfig[client.status].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {client.isRecurrent ? (
                        <div>
                          <p className="font-medium text-foreground">
                            R$ {client.recurrenceValue?.toLocaleString("pt-BR")}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Todo dia {client.recurrenceDate}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Pagamento único</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{
                              width: `${(completedProcesses / client.processes.length) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {completedProcesses}/{client.processes.length}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedClient(client)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </DropdownMenuItem>
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
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Client Detail Dialog */}
        <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedClient?.name}</DialogTitle>
            </DialogHeader>
            {selectedClient && (
              <div className="space-y-6 py-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{selectedClient.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium text-foreground">{selectedClient.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Produto</p>
                    <p className="font-medium text-foreground">
                      {selectedClient.productSold}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={cn("mt-1", statusConfig[selectedClient.status].class)}
                    >
                      {statusConfig[selectedClient.status].label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="mb-3 font-semibold text-foreground">
                    Processos / Checklist
                  </h4>
                  <div className="space-y-2">
                    {selectedClient.processes.map((process) => (
                      <div
                        key={process.id}
                        className="flex items-center gap-3 rounded-lg border border-border p-3"
                      >
                        <Checkbox checked={process.isCompleted} />
                        <span
                          className={cn(
                            "text-sm",
                            process.isCompleted
                              ? "text-muted-foreground line-through"
                              : "text-foreground"
                          )}
                        >
                          {process.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Plus size={14} />
                    Adicionar Processo
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Clientes;
