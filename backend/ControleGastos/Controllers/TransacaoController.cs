using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransacaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransacaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Transacao>>> Listar()
    {
        return await _context.Transacoes
            .Include(t => t.Categoria)
            .ToListAsync();
    }

    [HttpGet("{pessoa}/{mesRef}")]
    public async Task<ActionResult<IEnumerable<Transacao>>> ListarPorMes(string pessoa, DateOnly mesRef)
    {
        return await _context.Transacoes
            .Include(t => t.Categoria)
            .Where(t => t.Pessoa == pessoa && t.MesRef == mesRef)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Transacao>> Criar(Transacao transacao)
    {
        _context.Transacoes.Add(transacao);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = transacao.Id }, transacao);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Transacao transacao)
    {
        if (id != transacao.Id)
            return BadRequest();

        _context.Entry(transacao).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/pago")]
    public async Task<IActionResult> MarcarPago(int id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao == null)
            return NotFound();

        transacao.Pago = !transacao.Pago;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var transacao = await _context.Transacoes.FindAsync(id);
        if (transacao == null)
            return NotFound();

        _context.Transacoes.Remove(transacao);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
