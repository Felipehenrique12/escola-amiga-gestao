import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  CreditCard, 
  Calendar,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react';
import { StudentManagement } from '@/components/StudentManagement';
import { SubjectManagement } from '@/components/SubjectManagement';
import { GradeManagement } from '@/components/GradeManagement';
import { PaymentManagement } from '@/components/PaymentManagement';
import { EventCalendar } from '@/components/EventCalendar';

type ActiveSection = 'overview' | 'students' | 'subjects' | 'grades' | 'payments' | 'calendar';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  const menuItems = [
    { id: 'overview', label: 'Visão Geral', icon: GraduationCap },
    { id: 'students', label: 'Alunos', icon: Users },
    { id: 'subjects', label: 'Disciplinas', icon: BookOpen },
    { id: 'grades', label: 'Notas', icon: ClipboardList },
    { id: 'payments', label: 'Pagamentos', icon: CreditCard },
    { id: 'calendar', label: 'Calendário', icon: Calendar },
  ];

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
      case 'calendar':
        return <EventCalendar />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">245</div>
                <p className="text-xs text-muted-foreground">+12% em relação ao mês passado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disciplinas Ativas</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-muted-foreground">Distribuídas em 12 turmas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagamentos em Dia</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89%</div>
                <p className="text-xs text-muted-foreground">218 de 245 alunos</p>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

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
                : `Gerencie ${menuItems.find(item => item.id === activeSection)?.label.toLowerCase()}`
              }
            </p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;