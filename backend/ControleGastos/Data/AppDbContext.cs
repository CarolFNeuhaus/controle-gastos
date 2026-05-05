using Microsoft.EntityFrameworkCore;
using ControleGastos.Models;

namespace ControleGastos.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<Categoria> Categorias { get; set; }
    public DbSet<Divida> Dividas { get; set; }
    public DbSet<Cartao> Cartoes { get; set; }
    public DbSet<Transacao> Transacoes { get; set; }
    public DbSet<GastoFixoCartao> GastosFixosCartao { get; set; }
    public DbSet<Fatura> Faturas { get; set; }
    public DbSet<FaturaItem> FaturaItens { get; set; }
    public DbSet<GastoFixo> GastosFixos { get; set; }
}