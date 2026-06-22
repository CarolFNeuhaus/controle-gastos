using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalarioController : ControllerBase
{
    private readonly AppDbContext _context;

    public SalarioController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Salario>>> Listar()
    {
        return await _context.Salarios
            .OrderByDescending(s => s.MesRef)
            .ThenBy(s => s.Pessoa)
            .ToListAsync();
    }

    [HttpGet("{pessoa}/{mesRef}")]
    public async Task<ActionResult<Salario>> BuscarPorMes(string pessoa, string mesRef)
    {
        var mes = DateOnly.Parse(mesRef);
        var salario = await _context.Salarios
            .FirstOrDefaultAsync(s => s.Pessoa == pessoa && s.MesRef == mes);
        if (salario == null) return NotFound();
        return salario;
    }

    [HttpPost]
    public async Task<ActionResult<Salario>> Criar(Salario salario)
    {
        salario.CriadoEm = DateTime.UtcNow;
        _context.Salarios.Add(salario);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(BuscarPorMes),
            new { pessoa = salario.Pessoa, mesRef = salario.MesRef.ToString("yyyy-MM-dd") },
            salario);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Salario salario)
    {
        var existente = await _context.Salarios.FindAsync(id);
        if (existente == null) return NotFound();
        existente.Valor = salario.Valor;
        existente.Horas = salario.Horas;
        existente.TaxaHora = salario.TaxaHora;
        existente.IsEstimativa = salario.IsEstimativa;
        existente.MesRef = salario.MesRef;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var salario = await _context.Salarios.FindAsync(id);
        if (salario == null) return NotFound();
        _context.Salarios.Remove(salario);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
