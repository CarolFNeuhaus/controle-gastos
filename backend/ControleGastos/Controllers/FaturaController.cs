using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaturaController : ControllerBase
{
    private readonly AppDbContext _context;

    public FaturaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Fatura>>> Listar()
    {
        return await _context.Faturas
            .Include(f => f.Cartao)
            .OrderByDescending(f => f.MesRef)
            .ToListAsync();
    }

    [HttpGet("cartao/{cartaoId}")]
    public async Task<ActionResult<IEnumerable<Fatura>>> ListarPorCartao(int cartaoId)
    {
        return await _context.Faturas
            .Include(f => f.Cartao)
            .Where(f => f.CartaoId == cartaoId)
            .OrderByDescending(f => f.MesRef)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Fatura>> Criar(Fatura fatura)
    {
        _context.Faturas.Add(fatura);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = fatura.Id }, fatura);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Fatura fatura)
    {
        if (id != fatura.Id)
            return BadRequest();

        _context.Entry(fatura).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/paga")]
    public async Task<IActionResult> MarcarPaga(int id)
    {
        var fatura = await _context.Faturas.FindAsync(id);
        if (fatura == null) return NotFound();

        fatura.Paga = !fatura.Paga;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var fatura = await _context.Faturas.FindAsync(id);
        if (fatura == null) return NotFound();

        _context.Faturas.Remove(fatura);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
