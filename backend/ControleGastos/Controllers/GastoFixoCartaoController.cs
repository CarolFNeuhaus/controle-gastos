using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GastoFixoCartaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public GastoFixoCartaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<GastoFixoCartao>>> Listar()
    {
        return await _context.GastosFixosCartao
            .Include(g => g.Cartao)
            .ToListAsync();
    }

    [HttpGet("cartao/{cartaoId}")]
    public async Task<ActionResult<IEnumerable<GastoFixoCartao>>> ListarPorCartao(int cartaoId)
    {
        return await _context.GastosFixosCartao
            .Include(g => g.Cartao)
            .Where(g => g.CartaoId == cartaoId)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<GastoFixoCartao>> Criar(GastoFixoCartao gasto)
    {
        _context.GastosFixosCartao.Add(gasto);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = gasto.Id }, gasto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, GastoFixoCartao gasto)
    {
        if (id != gasto.Id)
            return BadRequest();

        _context.Entry(gasto).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var gasto = await _context.GastosFixosCartao.FindAsync(id);
        if (gasto == null)
            return NotFound();

        _context.GastosFixosCartao.Remove(gasto);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
