import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface Student {
  id: string;
  nome_completo: string;
  data_nascimento: string;
  nome_pai?: string;
  nome_mae?: string;
  endereco?: string;
  telefone1?: string;
  telefone2?: string;
  alergia?: string;
}

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    nome_pai: '',
    nome_mae: '',
    endereco: '',
    telefone1: '',
    telefone2: '',
    alergia: '',
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('alunos')
        .select('*')
        .order('nome_completo');

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar alunos",
        description: "Não foi possível carregar a lista de alunos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingStudent) {
        const { error } = await supabase
          .from('alunos')
          .update(formData)
          .eq('id', editingStudent.id);

        if (error) throw error;

        toast({
          title: "Aluno atualizado",
          description: "Os dados do aluno foram atualizados com sucesso.",
        });
      } else {
        const { error } = await supabase
          .from('alunos')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Aluno cadastrado",
          description: "O aluno foi cadastrado com sucesso.",
        });
      }

      fetchStudents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados do aluno.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nome_completo: student.nome_completo,
      data_nascimento: student.data_nascimento,
      nome_pai: student.nome_pai || '',
      nome_mae: student.nome_mae || '',
      endereco: student.endereco || '',
      telefone1: student.telefone1 || '',
      telefone2: student.telefone2 || '',
      alergia: student.alergia || '',
    });
    setIsDialogOpen(true);
  };

  const fillFormData = (student: Student) => ({
    nome_completo: student.nome_completo,
    data_nascimento: student.data_nascimento,
    nome_pai: student.nome_pai || '',
    nome_mae: student.nome_mae || '',
    endereco: student.endereco || '',
    telefone1: student.telefone1 || '',
    telefone2: student.telefone2 || '',
    alergia: student.alergia || '',
  });

  const handleView = (student: Student) => {
    setFormData(fillFormData(student));
    setViewingStudent(student);
    
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return;

    try {
      const { error } = await supabase
        .from('alunos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Aluno excluído",
        description: "O aluno foi excluído com sucesso.",
      });

      fetchStudents();
    } catch (error) {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o aluno.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      data_nascimento: '',
      nome_pai: '',
      nome_mae: '',
      endereco: '',
      telefone1: '',
      telefone2: '',
      alergia: '',
    });
    setEditingStudent(null);
  };

  const handleNewStudent = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Gerenciar Alunos</h3>
          <p className="text-sm text-muted-foreground">
            Cadastre, edite e visualize informações dos alunos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewStudent}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? 'Editar Aluno' : 'Novo Aluno'}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do aluno abaixo.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_pai">Nome do Pai</Label>
                  <Input
                    id="nome_pai"
                    value={formData.nome_pai}
                    onChange={(e) => setFormData({ ...formData, nome_pai: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_mae">Nome da Mãe</Label>
                  <Input
                    id="nome_mae"
                    value={formData.nome_mae}
                    onChange={(e) => setFormData({ ...formData, nome_mae: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone1">Telefone 1</Label>
                  <Input
                    id="telefone1"
                    value={formData.telefone1}
                    onChange={(e) => setFormData({ ...formData, telefone1: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone2">Telefone 2</Label>
                  <Input
                    id="telefone2"
                    value={formData.telefone2}
                    onChange={(e) => setFormData({ ...formData, telefone2: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alergia">Alergia</Label>
                <Input
                  id="alergia"
                  value={formData.alergia}
                  onChange={(e) => setFormData({ ...formData, alergia: e.target.value })}
                />
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
                  {editingStudent ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewingStudent} onOpenChange={() => setViewingStudent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do aluno</DialogTitle>
              <DialogDescription>Informações do aluno</DialogDescription>
            </DialogHeader>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_completo">Nome Completo *</Label>
                  <Input
                    id="nome_completo"
                    value={formData.nome_completo}
                    readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                  <Input
                    id="data_nascimento"
                    type="date"
                    value={formData.data_nascimento}
                    readOnly />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome_pai">Nome do Pai</Label>
                  <Input
                    id="nome_pai"
                    value={formData.nome_pai}
                    readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nome_mae">Nome da Mãe</Label>
                  <Input
                    id="nome_mae"
                    value={formData.nome_mae}
                    readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  readOnly />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone1">Telefone 1</Label>
                  <Input
                    id="telefone1"
                    value={formData.telefone1}
                    readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefone2">Telefone 2</Label>
                  <Input
                    id="telefone2"
                    value={formData.telefone2}
                    readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alergia">Alergia</Label>
                <Input

                  value={formData.alergia}
                  readOnly />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setViewingStudent(null)}
                >
                  Voltar
                </Button>
                
                </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos</CardTitle>
          <CardDescription>
            {students.length} aluno(s) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Nascimento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.nome_completo}</TableCell>
                  <TableCell>{new Date(student.data_nascimento).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{student.telefone1}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(student)}
                        title="Editar Aluno"
                        aria-label="Editar Aluno"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(student)}
                        title="Detalhes do aluno"
                        aria-label="Detalhes do aluno"
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(student.id)}
                        title="Excluir Aluno"
                        aria-label="Excluir Aluno"
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