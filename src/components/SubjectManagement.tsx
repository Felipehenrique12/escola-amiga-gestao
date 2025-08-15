import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Subject {
  id: string;
  nome: string;
  professor: string;
}

interface Turma {
  id: string;
  nome: string;
  ano_letivo: number;
}

export const SubjectManagement = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedTurmas, setSelectedTurmas] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    nome: '',
    professor: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subjectsResponse, turmasResponse] = await Promise.all([
        supabase.from('disciplinas').select('*').order('nome'),
        supabase.from('turmas').select('*').order('nome')
      ]);

      if (subjectsResponse.error) throw subjectsResponse.error;
      if (turmasResponse.error) throw turmasResponse.error;

      setSubjects(subjectsResponse.data || []);
      setTurmas(turmasResponse.data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar disciplinas e turmas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let subjectId: string;

      if (editingSubject) {
        const { error } = await supabase
          .from('disciplinas')
          .update(formData)
          .eq('id', editingSubject.id);
        
        if (error) throw error;
        subjectId = editingSubject.id;
        
        toast({
          title: "Disciplina atualizada",
          description: "A disciplina foi atualizada com sucesso.",
        });
      } else {
        const { data, error } = await supabase
          .from('disciplinas')
          .insert([formData])
          .select()
          .single();
        
        if (error) throw error;
        subjectId = data.id;
        
        toast({
          title: "Disciplina cadastrada",
          description: "A disciplina foi cadastrada com sucesso.",
        });
      }

      // Update turma associations
      if (selectedTurmas.length > 0) {
        // Remove existing associations
        await supabase
          .from('disciplina_turma')
          .delete()
          .eq('disciplina_id', subjectId);

        // Add new associations
        const associations = selectedTurmas.map(turmaId => ({
          disciplina_id: subjectId,
          turma_id: turmaId
        }));

        await supabase
          .from('disciplina_turma')
          .insert(associations);
      }
      
      fetchData();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a disciplina.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      nome: subject.nome,
      professor: subject.professor,
    });

    // Load associated turmas
    try {
      const { data, error } = await supabase
        .from('disciplina_turma')
        .select('turma_id')
        .eq('disciplina_id', subject.id);

      if (error) throw error;
      setSelectedTurmas(data.map(item => item.turma_id));
    } catch (error) {
      setSelectedTurmas([]);
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta disciplina?')) return;
    
    try {
      const { error } = await supabase
        .from('disciplinas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Disciplina excluída",
        description: "A disciplina foi excluída com sucesso.",
      });
      
      fetchData();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a disciplina.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      professor: '',
    });
    setSelectedTurmas([]);
    setEditingSubject(null);
  };

  const handleNewSubject = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleTurmaChange = (turmaId: string, checked: boolean) => {
    if (checked) {
      setSelectedTurmas([...selectedTurmas, turmaId]);
    } else {
      setSelectedTurmas(selectedTurmas.filter(id => id !== turmaId));
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Disciplinas</h3>
          <p className="text-sm text-muted-foreground">
            Cadastre disciplinas e associe a turmas
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewSubject}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Disciplina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubject ? 'Editar Disciplina' : 'Nova Disciplina'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados da disciplina.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da Disciplina *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="professor">Professor Responsável *</Label>
                <Input
                  id="professor"
                  value={formData.professor}
                  onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Turmas</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {turmas.map((turma) => (
                    <div key={turma.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={turma.id}
                        checked={selectedTurmas.includes(turma.id)}
                        onCheckedChange={(checked) => 
                          handleTurmaChange(turma.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={turma.id} className="text-sm">
                        {turma.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSubject ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Disciplinas</CardTitle>
          <CardDescription>
            {subjects.length} disciplina(s) cadastrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.nome}</TableCell>
                  <TableCell>{subject.professor}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(subject)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(subject.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};