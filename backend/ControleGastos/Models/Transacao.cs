namespace ControleGastos.Models;

public class Transacao
{
    public int Id { get; set; }
    public DateOnly Data { get; set; }
    public DateOnly MesRef { get; set; }
    public string Pessoa { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
    public decimal Valor { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string? Descricao { get; set; }
    public bool IsEstimativa { get; set; } = false;
    public bool Confirmado { get; set; } = false;
    public bool Pago { get; set; } = false;
}