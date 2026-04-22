namespace ControleGastos.Models;

public class MetaProgresso
{
    public int Id { get; set; }
    public int MetaId { get; set; }
    public Meta Meta { get; set; } = null!;
    public DateOnly MesRef { get; set; }
    public decimal ValorGuardadoMes { get; set; }
    public decimal ValorAcumulado { get; set; }
    public decimal PercentualAtingido { get; set; }
    public DateTime CalculadoEm { get; set; } = DateTime.UtcNow;
    public decimal SnapshotSaldo { get; set; }
}