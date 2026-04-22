namespace ControleGastos.Models;

public class Cartao
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Pessoa { get; set; } = string.Empty;
    public string? Bandeira { get; set; }
    public int DiaFechamento { get; set; }
    public bool Ativo { get; set; } = true;
    public string? Cor { get; set; }
}