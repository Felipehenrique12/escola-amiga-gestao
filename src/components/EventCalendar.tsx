import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Plus, Calendar, List, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Event {
  id: string;
  titulo: string;
  descricao?: string;
  inicio: string;
  fim?: string;
  dia_inteiro: boolean;
  tipo: string;
}

interface EventCalendarProps {
  readOnly?: boolean;
  initialView?: 'calendar' | 'list'; // nova prop
  hideViewButtons?: boolean;
  isDashboard?: boolean; // nova prop para dashboard
}

const EVENT_TYPES = [
  { value: 'aula', label: 'Aula', color: 'bg-blue-500' },
  { value: 'prova', label: 'Prova', color: 'bg-red-500' },
  { value: 'feriado', label: 'Feriado', color: 'bg-green-500' },
  { value: 'evento', label: 'Evento', color: 'bg-purple-500' },
  { value: 'outro', label: 'Outro', color: 'bg-gray-500' },
];

export const EventCalendar = ({ readOnly = false, initialView = 'list', isDashboard = false, }: EventCalendarProps) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(initialView);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    inicio: '',
    fim: '',
    dia_inteiro: false,
    tipo: 'outro',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('inicio');

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar eventos",
        description: "Não foi possível carregar os eventos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;

    try {
      const eventData = {
        ...formData,
        inicio: formData.dia_inteiro
          ? new Date(formData.inicio + 'T00:00:00').toISOString()
          : new Date(formData.inicio).toISOString(),
        fim: formData.fim
          ? (formData.dia_inteiro
            ? new Date(formData.fim + 'T23:59:59').toISOString()
            : new Date(formData.fim).toISOString())
          : null,
      };

      if (editingEvent) {
        const { error } = await supabase
          .from('eventos')
          .update(eventData)
          .eq('id', editingEvent.id);

        if (error) throw error;

        toast({
          title: "Evento atualizado",
          description: "O evento foi atualizado com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('eventos')
          .insert([eventData]);

        if (error) throw error;

        toast({
          title: "Evento criado",
          description: "O evento foi criado com sucesso.",
        });
      }

      fetchEvents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar evento",
        description: "Não foi possível salvar o evento.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (event: Event) => {
    if (readOnly) return;
    setEditingEvent(event);
    setFormData({
      titulo: event.titulo,
      descricao: event.descricao || '',
      inicio: event.dia_inteiro
        ? event.inicio.split('T')[0]
        : new Date(event.inicio).toISOString().slice(0, 16),
      fim: event.fim
        ? (event.dia_inteiro
          ? event.fim.split('T')[0]
          : new Date(event.fim).toISOString().slice(0, 16))
        : '',
      dia_inteiro: event.dia_inteiro,
      tipo: event.tipo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (readOnly) return;
    if (!confirm('Tem certeza que deseja excluir este evento?')) return;

    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso.",
      });

      fetchEvents();
    } catch (error) {
      toast({
        title: "Erro ao excluir evento",
        description: "Não foi possível excluir o evento.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      inicio: '',
      fim: '',
      dia_inteiro: false,
      tipo: 'outro',
    });
    setEditingEvent(null);
  };

  const handleNewEvent = () => {
    if (readOnly) return;
    resetForm();
    setIsDialogOpen(true);
  };

  const formatDate = (dateString: string, allDay: boolean) => {
    const date = new Date(dateString);
    if (allDay) return date.toLocaleDateString('pt-BR');
    return date.toLocaleString('pt-BR');
  };

  const getEventTypeColor = (tipo: string) => {
    return EVENT_TYPES.find(t => t.value === tipo)?.color || 'bg-gray-500';
  };

  const getEventTypeLabel = (tipo: string) => {
    return EVENT_TYPES.find(t => t.value === tipo)?.label || 'Outro';
  };

  const renderCalendarView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-border"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDayEvents = events.filter(event => {
        const eventDate = new Date(event.inicio);
        return eventDate.getDate() === day &&
          eventDate.getMonth() === month &&
          eventDate.getFullYear() === year;
      });

      days.push(
        <div key={day} className="h-24 border border-border p-1 overflow-hidden">
          <div className="font-semibold text-sm">{day}</div>
          <div className="space-y-1">
            {currentDayEvents.slice(0, 2).map(event => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded text-white truncate ${getEventTypeColor(event.tipo)}`}
                title={event.titulo}
              >
                {event.titulo}
              </div>
            ))}
            {currentDayEvents.length > 2 && (
              <div className="text-xs text-muted-foreground">
                +{currentDayEvents.length - 2} mais
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-border">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-muted p-2 text-center font-semibold">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          {!isDashboard && (
            <>
              <h3 className="text-lg font-medium">Calendário de Eventos</h3>
              <p className="text-sm text-muted-foreground">
                Gerencie eventos, feriados e atividades escolares
              </p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          {/*  <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" /> Calendário
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" /> Lista
          </Button> */}

          {!isDashboard && (
            <>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" /> Calendário
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" /> Lista
              </Button>
            </>
          )}


          {!readOnly && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                {!isDashboard && (
                  <>
                    <Button onClick={handleNewEvent}>
                      <Plus className="h-4 w-4 mr-2" /> Novo Evento
                    </Button>
                  </>
                )}

              </DialogTrigger>
              <DialogContent className="max-w-md">
                {/* Formulário continua igual */}
                <DialogHeader>
                  <DialogTitle>{editingEvent ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
                  <DialogDescription>Preencha os dados do evento.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Evento</Label>
                    <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map(type => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="dia_inteiro"
                      checked={formData.dia_inteiro}
                      onCheckedChange={(checked) => setFormData({ ...formData, dia_inteiro: checked as boolean })}
                    />
                    <Label htmlFor="dia_inteiro">Dia inteiro</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inicio">{formData.dia_inteiro ? 'Data de Início' : 'Data e Hora de Início'} *</Label>
                    <Input
                      id="inicio"
                      type={formData.dia_inteiro ? 'date' : 'datetime-local'}
                      value={formData.inicio}
                      onChange={(e) => setFormData({ ...formData, inicio: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fim">{formData.dia_inteiro ? 'Data de Término' : 'Data e Hora de Término'}</Label>
                    <Input
                      id="fim"
                      type={formData.dia_inteiro ? 'date' : 'datetime-local'}
                      value={formData.fim}
                      onChange={(e) => setFormData({ ...formData, fim: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    {!isDashboard && (
                      <>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button type="submit">{editingEvent ? 'Atualizar' : 'Criar'}</Button>
                      </>
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>{currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>← Anterior</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>Hoje</Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>Próximo →</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>{renderCalendarView()}</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Eventos</CardTitle>
            <CardDescription>{events.length} evento(s) cadastrado(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold">{event.titulo}</h4>
                      <Badge className={`text-white ${getEventTypeColor(event.tipo)}`}>{getEventTypeLabel(event.tipo)}</Badge>
                    </div>
                    {event.descricao && <p className="text-sm text-muted-foreground mt-1">{event.descricao}</p>}
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(event.inicio, event.dia_inteiro)}
                      {event.fim && ` - ${formatDate(event.fim, event.dia_inteiro)}`}
                    </p>
                  </div>
                  {!readOnly && !isDashboard && (
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(event)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(event.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
