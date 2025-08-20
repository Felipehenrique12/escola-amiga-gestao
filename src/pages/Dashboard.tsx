import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  BookOpen,
  ClipboardList,
  CreditCard,
  Calendar,
  Presentation,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { StudentManagement } from '@/components/StudentManagement';
import { SubjectManagement } from '@/components/SubjectManagement';
import { GradeManagement } from '@/components/GradeManagement';
import { PaymentManagement } from '@/components/PaymentManagement';
import { ClassManagement } from '@/components/ClassManagement';
import { EventCalendar } from '@/components/EventCalendar';

type ActiveSection = 'overview' | 'students' | 'subjects' | 'grades' | 'payments' | 'classes' | 'calendar';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // ======================
  // Contadores e loading
  // ======================
  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(true);

  const [disciplinasCount, setSubjectsCount] = useState<number>(0);
  const [loadingDisciplinas, setSubjectsLoading] = useState<boolean>(true);

  const [pagamentosEmDia, setPagamentosEmDia] = useState<number>(0); // percentual
  const [alunosEmDiaCount, setAlunosEmDiaCount] = useState<number>(0); // quantidade real
  const [loadingPagamentos, setLoadingPagamentos] = useState<boolean>(true);

  const [dark, setDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: GraduationCap },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
    { id: 'grades', label: 'Notas', icon: ClipboardList },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'classes', label: 'Turmas', icon: Presentation },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
  ];

  // ======================
  // Funções de fetch
  // ======================
  const fetchStudentsCount = async () => {
    setLoadingStudents(true);
    try {
      const { count, error } = await supabase
        .from('alunos')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      setStudentsCount(count ?? 0);
    } catch (err) {
      console.error('Erro ao buscar contagem de alunos:', err);
      setStudentsCount(0);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubjectsCount = async () => {
    setSubjectsLoading(true);
    try {
      const { count, error } = await supabase
        .from('disciplinas')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      setSubjectsCount(count ?? 0);
    } catch (err) {
      console.error('Erro ao buscar contagem de disciplinas:', err);
      setSubjectsCount(0);
    } finally {
      setSubjectsLoading(false);
    }
  };

  const fetchPagamentosEmDia = async () => {
    setLoadingPagamentos(true);
    try {
      const anoAtual = new Date().getFullYear();
      const hoje = new Date();
      const mesAtual = hoje.getMonth() + 1;
      const diaAtual = hoje.getDate();
      const ultimoMesVencido = diaAtual < 10 ? mesAtual - 1 : mesAtual;

      const [{ data: alunos }, { data: pagamentos }] = await Promise.all([
        supabase.from('alunos').select('id'),
        supabase
          .from('pagamentos')
          .select('aluno_id, mes, pago')
          .eq('ano_letivo', anoAtual)
      ]);

      let emDia = 0;
      alunos?.forEach(aluno => {
        const pagos = pagamentos?.filter(p => p.aluno_id === aluno.id && p.mes <= ultimoMesVencido) || [];
        if (ultimoMesVencido === 0 || pagos.length === 0 || pagos.every(p => p.pago)) emDia++;
      });

      setAlunosEmDiaCount(emDia);
      setPagamentosEmDia(alunos?.length ? Math.round((emDia / alunos.length) * 100) : 0);
    } catch {
      setAlunosEmDiaCount(0);
      setPagamentosEmDia(0);
    } finally {
      setLoadingPagamentos(false);
    }
  };

  const refreshOverview = async () => {
    await Promise.all([
      fetchStudentsCount(),
      fetchSubjectsCount(),
      fetchPagamentosEmDia()
    ]);
  };

  // ======================
  // Atualiza visão geral ao entrar
  // ======================
  useEffect(() => {
    if (activeSection === 'overview') {
      refreshOverview();
    }
  }, [activeSection]);

  // ======================
  // Dark mode
  // ======================
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // ======================
  // Renderiza conteúdo
  // ======================
  const renderContent = () => {
    switch (activeSection) {
      case 'students':
        return <StudentManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'grades':
        return <GradeManagement />;
      case 'payments':
        return <PaymentManagement />;
      case 'classes':
        return <ClassManagement />;
      case 'calendar':
        return <EventCalendar />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total de Alunos */}
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStudents ? '...' : studentsCount}
                </div>
              </CardContent>
            </Card>

            {/* Disciplinas */}
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Disciplinas Ativas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingDisciplinas ? '...' : disciplinasCount}
                </div>
              </CardContent>
            </Card>

            {/* Pagamentos em Dia */}
            <Card>
              <CardHeader className="flex justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos em Dia</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingPagamentos ? '...' : `${pagamentosEmDia}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loadingPagamentos ? '—' : `${alunosEmDiaCount} de ${studentsCount} Alunos em dia com pagamento`}
                </p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  // ======================
  // Render principal
  // ======================
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">SchoLab</h1>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Olá, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={() => setDark(d => !d)} aria-label="Alternar tema">
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setActiveSection(item.id as ActiveSection)}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h2>
            <p className="text-muted-foreground">
              {activeSection === 'overview'
                ? 'Bem-vindo ao sistema de gestão escolar'
                : `Gerencie ${menuItems.find(item => item.id === activeSection)?.label.toLowerCase()}`}
            </p>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
