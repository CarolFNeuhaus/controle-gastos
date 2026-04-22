using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjecaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjecaoController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{pessoa}")]
    public async Task<ActionResult<IEnumerable<Projecao>>> ListarPorPessoa(string pessoa)
    {
        return await _context.Projecoes
            .Where(p => p.Pessoa == pessoa)
            .OrderByDescending(p => p.CalculadoEm)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<Projecao>> Criar(Projecao projecao)
    {
        projecao.CalculadoEm = DateTime.UtcNow;
        _context.Projecoes.Add(projecao);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(ListarPorPessoa), new { pessoa = projecao.Pessoa }, projecao);
    }
}
