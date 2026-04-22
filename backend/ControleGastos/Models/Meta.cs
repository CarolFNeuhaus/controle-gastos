namespace ControleGastos.Models;

public class Meta
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string Pessoa { get; set; } = string.Empty;
    public decimal ValorAlvo { get; set; }
    public DateOnly Prazo { get; set; }
    public int? CategoriaId { get; set; }
    public Categoria? Categoria { get; set; }
    public bool Ativa { get; set; } = true;
}