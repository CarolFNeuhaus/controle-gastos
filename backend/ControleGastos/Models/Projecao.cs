namespace ControleGastos.Models;

public class Projecao
{
    public int Id { get; set; }
    public DateTime CalculadoEm { get; set; } = DateTime.UtcNow;
    public string Pessoa { get; set; } = string.Empty;
    public decimal MediaGuardadaMes { get; set; }
    public decimal Projecao12m { get; set; }
    public decimal Projecao60m { get; set; }
    public decimal? SimulacaoValorAlvo { get; set; }
    public int? MesesNecessarios { get; set; }
}