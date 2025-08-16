import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle } from 'lucide-react';

interface Student {
  id: string;
  nome_completo: string;
}

interface Payment {
  id: string;
  aluno_id: string;
  mes: number;
  ano_letivo: number;
  pago: boolean;
  pago_em?: string;
  obs?: string;
}

interface StudentPaymentStatus {
  student: Student;
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
  status: { label: string; color: string };
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Função para calcular status considerando o vencimento no dia 10
const getStudentPaymentStatus = (payments: Payment[]) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Janeiro = 1
  const currentDay = today.getDate();

  // Se ainda não chegou dia 10, o mês atual não conta como vencido
  const lastDueMonth = currentDay < 10 ? currentMonth - 1 : currentMonth;

  // Filtra apenas os meses já vencidos
  const monthsToCheck = payments.filter(p => p.mes <= lastDueMonth);

  if (monthsToCheck.length === 0) {
    return { label: "Pagamento em Falta", color: "red" };
  }

  // Todos pagos até o último vencimento
  const allPaid = monthsToCheck.every(p => p.pago);
  if (allPaid) {
    return { label: "Em dia", color: "green" };
  }

  return { label: "Pagamento em Falta", color: "red" };
};

export const PaymentManagement = () => {
  const [studentsPayments, setStudentsPayments] = useState<StudentPaymentStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentPaymentStatus | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPaymentsData();
  }, []);

  const fetchPaymentsData = async () => {
    try {
      const currentYear = new Date().getFullYear();
      
      const { data: students, error: studentsError } = await supabase
        .from('alunos')
        .select('id, nome_completo')
        .order('nome_completo');

      if (studentsError) throw studentsError;

      const { data: payments, error: paymentsError } = await supabase
        .from('pagamentos')
        .select('*')
        .eq('ano_letivo', currentYear);

      if (paymentsError) throw paymentsError;

      const studentsWithPayments: StudentPaymentStatus[] = students.map(student => {
        const studentPayments = payments.filter(p => p.aluno_id === student.id);
        
        const allMonthsPayments: Payment[] = [];
        for (let month = 1; month <= 12; month++) {
          const existingPayment = studentPayments.find(p => p.mes === month);
          if (existingPayment) {
            allMonthsPayments.push(existingPayment);
          } else {
            allMonthsPayments.push({
              id: `temp-${student.id}-${month}`,
              aluno_id: student.id,
              mes: month,
              ano_letivo: currentYear,
              pago: false,
            });
          }
        }

        const totalPaid = allMonthsPayments.filter(p => p.pago).length;
        const totalPending = allMonthsPayments.filter(p => !p.pago).length;
        const status = getStudentPaymentStatus(allMonthsPayments);

        return {
          student,
          payments: allMonthsPayments,
          totalPaid,
          totalPending,
          status,
        };
      });

      setStudentsPayments(studentsWithPayments);
    } catch (error) {
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Não foi possível carregar os dados de pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentToggle = async (payment: Payment, paid: boolean) => {
    try {
      if (payment.id.startsWith('temp-')) {
        const { error } = await supabase
          .from('pagamentos')
          .insert([{
            aluno_id: payment.aluno_id,
            mes: payment.mes,
            ano_letivo: payment.ano_letivo,
            pago: paid,
            pago_em: paid ? new Date().toISOString() : null,
          }]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pagamentos')
          .update({
            pago: paid,
            pago_em: paid ? new Date().toISOString() : null,
          })
          .eq('id', payment.id);

        if (error) throw error;
      }

      toast({
        title: "Pagamento atualizado",
        description: `Pagamento ${paid ? 'confirmado' : 'removido'} com sucesso.`,
      });

      fetchPaymentsData();
    } catch (error) {
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Não foi possível atualizar o status do pagamento.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Situação de Pagamento</h3>
        <p className="text-sm text-muted-foreground">
          Visualize e gerencie os pagamentos dos alunos
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Alunos - Situação de Pagamento</CardTitle>
          <CardDescription>
            Status dos pagamentos para o ano de {new Date().getFullYear()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Meses Pagos</TableHead>
                <TableHead>Meses Pendentes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsPayments.map((studentData) => (
                <TableRow key={studentData.student.id}>
                  <TableCell className="flex items-center space-x-2">
                    {studentData.status.color === "green" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">{studentData.student.nome_completo}</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        studentData.status.color === "green"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {studentData.status.label}
                    </Badge>
                  </TableCell>
                  <TableCell>{studentData.totalPaid}/12</TableCell>
                  <TableCell>{studentData.totalPending}</TableCell>
                  <TableCell>
                    <Dialog
                      open={isDialogOpen && selectedStudent?.student.id === studentData.student.id}
                      onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) setSelectedStudent(null);
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(studentData)}
                        >
                          Ver Detalhes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Pagamentos - {studentData.student.nome_completo}
                          </DialogTitle>
                          <DialogDescription>
                            Gerencie os pagamentos mensais do aluno
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-3 gap-4">
                          {studentData.payments.map((payment) => (
                            <div
                              key={`${payment.aluno_id}-${payment.mes}`}
                              className="flex items-center space-x-2 p-2 border rounded"
                            >
                              <Checkbox
                                checked={payment.pago}
                                onCheckedChange={(checked) =>
                                  handlePaymentToggle(payment, checked as boolean)
                                }
                              />
                              <span className="text-sm">
                                {MONTHS[payment.mes - 1]}
                              </span>
                              {payment.pago && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
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
