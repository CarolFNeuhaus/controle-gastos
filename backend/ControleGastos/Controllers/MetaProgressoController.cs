using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetaProgressoController : ControllerBase
{
    private readonly AppDbContext _context;

    public MetaProgressoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("meta/{metaId}")]
    public async Task<ActionResult<IEnumerable<MetaProgresso>>> ListarPorMeta(int metaId)
    {
        return await _context.MetasProgresso
            .Include(mp => mp.Meta)
            .Where(mp => mp.MetaId == metaId)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<MetaProgresso>> Criar(MetaProgresso progresso)
    {
        progresso.CalculadoEm = DateTime.UtcNow;
        _context.MetasProgresso.Add(progresso);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(ListarPorMeta), new { metaId = progresso.MetaId }, progresso);
    }
}
