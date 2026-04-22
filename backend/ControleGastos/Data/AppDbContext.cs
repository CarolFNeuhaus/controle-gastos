using Microsoft.EntityFrameworkCore;
using ControleGastos.Models;

namespace ControleGastos.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Cartao> Cartoes { get; set; }
    public DbSet<SalarioEstimativa> SalariosEstimativas { get; set; }
    public DbSet<Transacao> Transacoes { get; set; }
    public DbSet<GastoFixoCartao> GastosFixosCartao { get; set; }
    public DbSet<Fatura> Faturas { get; set; }
    public DbSet<Meta> Metas { get; set; }
    public DbSet<MetaProgresso> MetasProgresso { get; set; }
    public DbSet<Projecao> Projecoes { get; set; }
}