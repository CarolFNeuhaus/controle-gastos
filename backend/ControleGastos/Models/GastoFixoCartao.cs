namespace ControleGastos.Models;

public class GastoFixoCartao
{
    public int Id { get; set; }
    public int CartaoId { get; set; }
    public Cartao Cartao { get; set; } = null!;
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public int? ParcelasTotal { get; set; }
    public int? ParcelasRestantes { get; set; }
    public bool Ativo { get; set; } = true;
}