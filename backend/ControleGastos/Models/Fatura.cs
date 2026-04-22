namespace ControleGastos.Models;

public class Fatura
{
    public int Id { get; set; }
    public int CartaoId { get; set; }
    public Cartao Cartao { get; set; } = null!;
    public DateOnly MesRef { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal ValorFixo { get; set; }
    public decimal ValorSuperfluo { get; set; }
    public bool Paga { get; set; } = false;
}