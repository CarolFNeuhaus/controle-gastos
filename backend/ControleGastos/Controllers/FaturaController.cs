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
            .ToListAsync();
    }

    [HttpGet("cartao/{cartaoId}/{mesRef}")]
    public async Task<ActionResult<Fatura>> BuscarPorMes(int cartaoId, DateOnly mesRef)
    {
        var fatura = await _context.Faturas
            .Include(f => f.Cartao)
            .FirstOrDefaultAsync(f => f.CartaoId == cartaoId && f.MesRef == mesRef);

        if (fatura == null)
            return NotFound();

        return fatura;
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
}
