namespace ControleGastos.Models;

public class GastoFixo
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Pessoa { get; set; } = string.Empty;
    public int? DiaVencimento { get; set; }
    public bool Ativo { get; set; } = true;
}
