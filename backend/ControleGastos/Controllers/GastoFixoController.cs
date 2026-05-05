using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GastoFixoController : ControllerBase
{
    private readonly AppDbContext _context;

    public GastoFixoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GastoFixo>>> Listar()
    {
        return await _context.GastosFixos
            .Include(g => g.Categoria)
            .OrderBy(g => g.Pessoa)
            .ThenBy(g => g.Descricao)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<GastoFixo>> Criar(GastoFixo gastoFixo)
    {
        _context.GastosFixos.Add(gastoFixo);
        await _context.SaveChangesAsync();
        return Ok(gastoFixo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, GastoFixo gastoFixo)
    {
        var existente = await _context.GastosFixos.FindAsync(id);
        if (existente == null) return NotFound();

        existente.Descricao = gastoFixo.Descricao;
        existente.Valor = gastoFixo.Valor;
        existente.CategoriaId = gastoFixo.CategoriaId;
        existente.Pessoa = gastoFixo.Pessoa;
        existente.DiaVencimento = gastoFixo.DiaVencimento;
        existente.Ativo = gastoFixo.Ativo;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var gastoFixo = await _context.GastosFixos.FindAsync(id);
        if (gastoFixo == null) return NotFound();
        _context.GastosFixos.Remove(gastoFixo);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // POST /api/gastofixo/gerar/2026-05-01
    // Gera as transações do mês para todos os gastos fixos ativos
    // Retorna quantos foram gerados (pula os que já existem)
    [HttpPost("gerar/{mesRef}")]
    public async Task<IActionResult> GerarParaMes(string mesRef)
    {
        if (!DateOnly.TryParse(mesRef, out var mesRefDate))
            return BadRequest("Formato de data inválido. Use YYYY-MM-DD.");

        var gastosFixos = await _context.GastosFixos
            .Where(g => g.Ativo)
            .ToListAsync();

        var gerados = 0;
        var atualizados = 0;

        foreach (var gf in gastosFixos)
        {
            var dia = gf.DiaVencimento ?? 1;
            var diasNoMes = DateTime.DaysInMonth(mesRefDate.Year, mesRefDate.Month);
            var dataVenc = new DateOnly(mesRefDate.Year, mesRefDate.Month, Math.Min(dia, diasNoMes));

            var existente = await _context.Transacoes
                .FirstOrDefaultAsync(t => t.GastoFixoId == gf.Id && t.MesRef == mesRefDate);

            if (existente != null)
            {
                existente.Valor = gf.Valor;
                existente.Descricao = gf.Descricao;
                existente.CategoriaId = gf.CategoriaId;
                existente.Data = dataVenc;
                atualizados++;
            }
            else
            {
                _context.Transacoes.Add(new Transacao
                {
                    Descricao = gf.Descricao,
                    Valor = gf.Valor,
                    CategoriaId = gf.CategoriaId,
                    Pessoa = gf.Pessoa,
                    Data = dataVenc,
                    MesRef = mesRefDate,
                    Tipo = "D",
                    Pago = false,
                    IsEstimativa = false,
                    Confirmado = true,
                    GastoFixoId = gf.Id,
                });
                gerados++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { gerados, atualizados, total = gastosFixos.Count });
    }
}
