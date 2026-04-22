namespace ControleGastos.Models;

public class SalarioEstimativa
{
    public int Id { get; set; }
    public string Pessoa { get; set; } = string.Empty;
    public DateOnly MesRef { get; set; }
    public decimal ValorEstimado { get; set; }
    public decimal? ValorReal { get; set; }
    public bool Confirmado { get; set; } = false;
    public string? Observacao { get; set; }
    public DateTime AtualizadoEm { get; set; } = DateTime.UtcNow;
}