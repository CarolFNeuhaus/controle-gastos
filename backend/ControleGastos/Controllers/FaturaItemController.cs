using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FaturaItemController : ControllerBase
{
    private readonly AppDbContext _context;

    public FaturaItemController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("fatura/{faturaId}")]
    public async Task<ActionResult<IEnumerable<FaturaItem>>> ListarPorFatura(int faturaId)
    {
        return await _context.FaturaItens
            .Where(i => i.FaturaId == faturaId)
            .OrderBy(i => i.Data)
            .ToListAsync();
    }

    [HttpPost("fatura/{faturaId}/bulk")]
    public async Task<IActionResult> CriarBulk(int faturaId, List<FaturaItem> itens)
    {
        foreach (var item in itens)
            item.FaturaId = faturaId;

        _context.FaturaItens.AddRange(itens);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var item = await _context.FaturaItens.FindAsync(id);
        if (item == null) return NotFound();
        _context.FaturaItens.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("fatura/{faturaId}")]
    public async Task<IActionResult> DeletarPorFatura(int faturaId)
    {
        var itens = await _context.FaturaItens.Where(i => i.FaturaId == faturaId).ToListAsync();
        _context.FaturaItens.RemoveRange(itens);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
