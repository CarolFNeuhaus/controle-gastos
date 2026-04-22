using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalarioEstimativaController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalarioEstimativaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SalarioEstimativa>>> Listar()
    {
        return await _context.SalariosEstimativas.ToListAsync();
    }

    [HttpGet("{pessoa}/{mesRef}")]
    public async Task<ActionResult<SalarioEstimativa>> BuscarPorMes(string pessoa, DateOnly mesRef)
    {
        var salario = await _context.SalariosEstimativas
            .FirstOrDefaultAsync(s => s.Pessoa == pessoa && s.MesRef == mesRef);

        if (salario == null)
            return NotFound();

        return salario;
    }

    [HttpPost]
    public async Task<ActionResult<SalarioEstimativa>> Criar(SalarioEstimativa salario)
    {
        _context.SalariosEstimativas.Add(salario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Listar), new { id = salario.Id }, salario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, SalarioEstimativa salario)
    {
        if (id != salario.Id)
            return BadRequest();

        salario.AtualizadoEm = DateTime.UtcNow;
        _context.Entry(salario).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
