namespace ControleGastos.Models;

public class Salario
{
    public int Id { get; set; }
    public string Pessoa { get; set; } = string.Empty;
    public DateOnly MesRef { get; set; }
    public decimal Valor { get; set; }
    public decimal? Horas { get; set; }
    public decimal? TaxaHora { get; set; }
    public bool IsEstimativa { get; set; } = false;
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
}
