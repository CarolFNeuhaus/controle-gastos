using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Cartao>>> Listar()
    {
        return await _context.Cartoes.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Cartao>> Criar(Cartao cartao)
    {
        _context.Cartoes.Add(cartao);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = cartao.Id }, cartao);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Cartao cartao)
    {
        if (id != cartao.Id)
            return BadRequest();

        _context.Entry(cartao).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var cartao = await _context.Cartoes.FindAsync(id);
        if (cartao == null)
            return NotFound();

        _context.Cartoes.Remove(cartao);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
