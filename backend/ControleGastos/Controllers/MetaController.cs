using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetaController : ControllerBase
{
    private readonly AppDbContext _context;

    public MetaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Meta>>> Listar()
    {
        return await _context.Metas
            .Include(m => m.Categoria)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Meta>> Criar(Meta meta)
    {
        _context.Metas.Add(meta);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = meta.Id }, meta);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Meta meta)
    {
        if (id != meta.Id)
            return BadRequest();

        _context.Entry(meta).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var meta = await _context.Metas.FindAsync(id);
        if (meta == null)
            return NotFound();

        _context.Metas.Remove(meta);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
