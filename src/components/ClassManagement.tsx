import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

export const ClassManagement = () => {
    const [turmas, setTurmas] = useState<any[]>([]);
    const [nome, setNome] = useState("");
    const [anoLetivo, setAnoLetivo] = useState<number | "">("");
    const [turno, setTurno] = useState("");
    const [editing, setEditing] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const fetchTurmas = async () => {
        const { data, error } = await supabase.from("turmas").select("*").order("nome");
        if (!error) setTurmas(data || []);
    };

    useEffect(() => { fetchTurmas(); }, []);

    const handleSave = async () => {
        if (!nome.trim() || anoLetivo === "" || !turno.trim()) return;
        const anoLetivoNumber = Number(anoLetivo);
        if (isNaN(anoLetivoNumber)) {
            toast({ title: "Ano letivo inválido", variant: "destructive" });
            return;
        }
        if (editing) {
            const { error } = await supabase.from("turmas").update({ nome, ano_letivo: anoLetivoNumber, turno }).eq("id", editing.id);
            if (!error) toast({ title: "Turma atualizada!" });
            else toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
        } else {
            const { error } = await supabase.from("turmas").insert({ nome, ano_letivo: anoLetivoNumber, turno });
            if (!error) toast({ title: "Turma cadastrada!" });
            else toast({ title: "Erro ao cadastrar", description: error.message, variant: "destructive" });
        }
        setNome("");
        setAnoLetivo("");
        setTurno("");
        setEditing(null);
        setOpen(false);
        fetchTurmas();
    };
    const handleEdit = (turma: any) => {
        setNome(turma.nome);
        setAnoLetivo(turma.ano_letivo || "");
        setTurno(turma.turno || "");
        setEditing(turma);
        setOpen(true);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Turmas</CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={() => { setNome(""); setAnoLetivo(""); setTurno(""); setEditing(null); setOpen(true); }} className="mb-4">
                    Nova Turma
                </Button>
                <ul className="space-y-2">
                    {turmas.map(turma => (
                        <li key={turma.id} className="flex justify-between items-center border p-2 rounded">
                            <span>
                                {turma.nome} - {turma.ano_letivo} - {turma.turno}
                            </span>
                            <Button size="sm" variant="outline" onClick={() => handleEdit(turma)}>Editar</Button>
                        </li>
                    ))}
                </ul>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editing ? "Editar Turma" : "Nova Turma"}</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="Nome da turma"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            className="mb-2"
                        />
                        <Input
                            placeholder="Ano letivo"
                            value={anoLetivo}
                            onChange={e => setAnoLetivo(e.target.value === "" ? "" : Number(e.target.value))}
                            className="mb-2"
                            type="number"
                        />
                        <select
                            value={turno}
                            onChange={e => setTurno(e.target.value)}
                            className="mb-2 border rounded px-2 py-1 w-full"
                        >
                            <option value="">Selecione o turno</option>
                            <option value="manhã">Manhã</option>
                            <option value="tarde">Tarde</option>
                            <option value="noite">Noite</option>
                        </select>
                        <Button onClick={handleSave}>{editing ? "Salvar" : "Cadastrar"}</Button>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};