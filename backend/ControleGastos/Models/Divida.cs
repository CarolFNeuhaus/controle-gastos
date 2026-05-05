namespace ControleGastos.Models;

public class Divida
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public string Pessoa { get; set; } = string.Empty;
    public string PessoaRelacionada { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty; // a_receber / a_pagar
    public decimal ValorTotal { get; set; }
    public decimal ValorPago { get; set; } = 0;
    public DateOnly DataInicio { get; set; }
    public DateOnly? DataPrevista { get; set; }
    public string? Observacao { get; set; }
    public string Status { get; set; } = "ativa"; // ativa / quitada
    public DateTime CriadaEm { get; set; } = DateTime.UtcNow;
}
