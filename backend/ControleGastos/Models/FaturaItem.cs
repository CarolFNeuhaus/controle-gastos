using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ControleGastos.Models;

public class FaturaItem
{
    public int Id { get; set; }
    public int FaturaId { get; set; }
    [BindNever]
    public Fatura? Fatura { get; set; }
    public DateOnly Data { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string? Parcela { get; set; }
    public decimal? ValorTotalCompra { get; set; }
}
