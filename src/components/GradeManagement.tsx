import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Search, Save } from 'lucide-react';

interface Student {
  id: string;
  nome_completo: string;
}

interface Subject {
  id: string;
  nome: string;
}

interface Grade {
  id?: string;
  aluno_id: string;
  disciplina_id: string;
  ano_letivo: number;
  u1?: number;
  u2?: number;
  u3?: number;
  u4?: number;
}

export const GradeManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [grades, setGrades] = useState<Grade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudentsAndSubjects();
  }, []);

  const fetchStudentsAndSubjects = async () => {
    try {
      const [studentsResponse, subjectsResponse] = await Promise.all([
        supabase.from('alunos').select('id, nome_completo').order('nome_completo'),
        supabase.from('disciplinas').select('id, nome').order('nome')
      ]);

      if (studentsResponse.error) throw studentsResponse.error;
      if (subjectsResponse.error) throw subjectsResponse.error;

      setStudents(studentsResponse.data || []);
      setSubjects(subjectsResponse.data || []);
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar alunos e disciplinas.",
        variant: "destructive",
      });
    }
  };

  const fetchGrades = async () => {
    if (!selectedStudent) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notas')
        .select('*')
        .eq('aluno_id', selectedStudent)
        .eq('ano_letivo', parseInt(selectedYear));

      if (error) throw error;

      // Create grades array for all subjects
      const existingGrades = data || [];
      const allGrades = subjects.map(subject => {
        const existingGrade = existingGrades.find(g => g.disciplina_id === subject.id);
        return existingGrade || {
          aluno_id: selectedStudent,
          disciplina_id: subject.id,
          ano_letivo: parseInt(selectedYear),
          u1: undefined,
          u2: undefined,
          u3: undefined,
          u4: undefined,
        };
      });

      setGrades(allGrades);
    } catch (error) {
      toast({
        title: "Erro ao carregar notas",
        description: "Não foi possível carregar as notas do aluno.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchGrades();
    }
  }, [selectedStudent, selectedYear, subjects]);

  const handleGradeChange = (disciplinaId: string, unit: 'u1' | 'u2' | 'u3' | 'u4', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);

    setGrades(prev => prev.map(grade =>
      grade.disciplina_id === disciplinaId
        ? { ...grade, [unit]: numValue }
        : grade
    ));
  };

  const saveGrades = async () => {
    if (!selectedStudent) return;

    try {
      for (const grade of grades) {
        if (grade.id) {
          // Update existing grade
          const { error } = await supabase
            .from('notas')
            .update({
              u1: grade.u1,
              u2: grade.u2,
              u3: grade.u3,
              u4: grade.u4,
              updated_at: new Date().toISOString()
            })
            .eq('id', grade.id);

          if (error) throw error;
        } else {
          // Insert new grade (only if at least one unit has a value)
          const hasValue = grade.u1 !== undefined || grade.u2 !== undefined ||
            grade.u3 !== undefined || grade.u4 !== undefined;

          if (hasValue) {
            const { error } = await supabase
              .from('notas')
              .insert([{
                aluno_id: grade.aluno_id,
                disciplina_id: grade.disciplina_id,
                ano_letivo: grade.ano_letivo,
                u1: grade.u1,
                u2: grade.u2,
                u3: grade.u3,
                u4: grade.u4,
              }]);

            if (error) throw error;
          }
        }
      }

      toast({
        title: "Notas salvas",
        description: "As notas foram salvas com sucesso.",
      });

      fetchGrades(); // Refresh to get updated data with IDs
    } catch (error) {
      toast({
        title: "Erro ao salvar notas",
        description: "Não foi possível salvar as notas.",
        variant: "destructive",
      });
    }
  };

  const filteredStudents = students.filter(student =>
    student.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateAverage = (grade: Grade) => {
    const units = [grade.u1, grade.u2, grade.u3, grade.u4].filter(u => u !== undefined) as number[];
    if (units.length === 0) return '-';
    return (units.reduce((a, b) => a + b, 0) / units.length).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Lançamento de Notas</h3>
        <p className="text-sm text-muted-foreground">
          Busque um aluno e lance as notas por disciplina
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Aluno</CardTitle>
          <CardDescription>
            Selecione o aluno e o ano letivo para lançar as notas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar por nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Digite o nome do aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-32">
              <Label htmlFor="year">Ano Letivo</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {searchTerm && (
            <div className="space-y-2">
              <Label>Selecionar Aluno</Label>
              <div className="max-h-32 overflow-y-auto border rounded-md">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 cursor-pointer hover:bg-accent ${selectedStudent === student.id ? 'bg-accent' : ''
                      }`}
                    onClick={() => setSelectedStudent(student.id)}
                  >
                    {student.nome_completo}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedStudent && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Notas do Aluno</CardTitle>
                <CardDescription>
                  {students.find(s => s.id === selectedStudent)?.nome_completo} - Ano {selectedYear}
                </CardDescription>
              </div>
              <Button onClick={saveGrades}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Notas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Carregando notas...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disciplina</TableHead>
                    <TableHead>U1</TableHead>
                    <TableHead>U2</TableHead>
                    <TableHead>U3</TableHead>
                    <TableHead>U4</TableHead>
                    <TableHead>Média</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {grades.map((grade) => {
                    const subject = subjects.find(s => s.id === grade.disciplina_id);
                    return (
                      <TableRow key={grade.disciplina_id}>
                        <TableCell className="font-medium">
                          {subject?.nome}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={grade.u1 || ''}
                            onChange={(e) => handleGradeChange(grade.disciplina_id, 'u1', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={grade.u2 || ''}
                            onChange={(e) => handleGradeChange(grade.disciplina_id, 'u2', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={grade.u3 || ''}
                            onChange={(e) => handleGradeChange(grade.disciplina_id, 'u3', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={grade.u4 || ''}
                            onChange={(e) => handleGradeChange(grade.disciplina_id, 'u4', e.target.value)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell
                          className={`font-medium ${Number(calculateAverage(grade)) >= 7
                              ? 'text-green-600'
                              : Number(calculateAverage(grade)) < 7 && calculateAverage(grade) !== '-'
                                ? 'text-red-600'
                                : ''
                            }`}
                        >
                          {calculateAverage(grade)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};