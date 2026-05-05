using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ControleGastos.Models;

public class Fatura
{
    public int Id { get; set; }
    public int CartaoId { get; set; }
    [BindNever]
    public Cartao? Cartao { get; set; }
    public DateOnly MesRef { get; set; }
    public decimal ValorTotal { get; set; }
    public decimal ValorFixo { get; set; }
    public decimal ValorSuperfluo { get; set; }
    public bool Paga { get; set; } = false;
}
