-- Enable RLS on all existing tables
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disciplina_turma ENABLE ROW LEVEL SECURITY;

-- Create missing tables for the school management system
CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  fim TIMESTAMP WITH TIME ZONE,
  dia_inteiro BOOLEAN DEFAULT false,
  tipo TEXT DEFAULT 'outro',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL,
  turma_id UUID NOT NULL,
  ano_letivo INTEGER NOT NULL,
  ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.notas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL,
  disciplina_id UUID NOT NULL,
  ano_letivo INTEGER NOT NULL,
  u1 DECIMAL(4,2),
  u2 DECIMAL(4,2),
  u3 DECIMAL(4,2),
  u4 DECIMAL(4,2),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  aluno_id UUID NOT NULL,
  ano_letivo INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  pago BOOLEAN NOT NULL DEFAULT false,
  pago_em TIMESTAMP WITH TIME ZONE,
  obs TEXT
);

-- Enable RLS on new tables
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access (since no authentication is implemented yet)
CREATE POLICY "Allow all operations on alunos" ON public.alunos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on disciplinas" ON public.disciplinas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on turmas" ON public.turmas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on disciplina_turma" ON public.disciplina_turma FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on eventos" ON public.eventos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on matriculas" ON public.matriculas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on notas" ON public.notas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on pagamentos" ON public.pagamentos FOR ALL USING (true) WITH CHECK (true);