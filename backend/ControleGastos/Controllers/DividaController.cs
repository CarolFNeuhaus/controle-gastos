using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ControleGastos.Data;
using ControleGastos.Models;

namespace ControleGastos.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DividaController : ControllerBase
{
    private readonly AppDbContext _context;

    public DividaController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Divida>>> Listar()
    {
        return await _context.Dividas
            .OrderByDescending(d => d.CriadaEm)
            .ToListAsync();
    }

    [HttpGet("ativas")]
    public async Task<ActionResult<IEnumerable<Divida>>> ListarAtivas()
    {
        return await _context.Dividas
            .Where(d => d.Status == "ativa")
            .OrderByDescending(d => d.CriadaEm)
            .ToListAsync();
    }

    [HttpGet("historico")]
    public async Task<ActionResult<IEnumerable<Divida>>> ListarHistorico()
    {
        return await _context.Dividas
            .Where(d => d.Status == "quitada")
            .OrderByDescending(d => d.CriadaEm)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Divida>> Buscar(int id)
    {
        var divida = await _context.Dividas.FindAsync(id);
        if (divida == null) return NotFound();
        return divida;
    }

    [HttpPost]
    public async Task<ActionResult<Divida>> Criar(Divida divida)
    {
        divida.ValorPago = 0;
        divida.Status = "ativa";
        divida.CriadaEm = DateTime.UtcNow;
        _context.Dividas.Add(divida);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Buscar), new { id = divida.Id }, divida);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Editar(int id, Divida divida)
    {
        if (id != divida.Id) return BadRequest();
        _context.Entry(divida).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/pagamento")]
    public async Task<ActionResult<Transacao>> RegistrarPagamento(int id, [FromBody] PagamentoRequest req)
    {
        var divida = await _context.Dividas.FindAsync(id);
        if (divida == null) return NotFound();

        var mesRef = new DateOnly(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
        var tipoDono = divida.Tipo == "a_receber" ? "R" : "D";
        var descricao = req.Descricao ?? $"Pagamento: {divida.Descricao}";

        // Transação para o dono da dívida
        var transacaoDono = new Transacao
        {
            Data = req.Data,
            MesRef = mesRef,
            Pessoa = divida.Pessoa,
            CategoriaId = req.CategoriaId,
            Valor = req.Valor,
            Tipo = tipoDono,
            Descricao = descricao,
            Pago = true,
            Confirmado = true,
            DividaId = divida.Id,
        };
        _context.Transacoes.Add(transacaoDono);

        // Se pessoaRelacionada é Caca ou João, cria transação inversa para ela
        var pessoasConhecidas = new[] { "Caca", "João" };
        if (pessoasConhecidas.Contains(divida.PessoaRelacionada) && divida.PessoaRelacionada != divida.Pessoa)
        {
            var tipoRelacionada = tipoDono == "R" ? "D" : "R";
            _context.Transacoes.Add(new Transacao
            {
                Data = req.Data,
                MesRef = mesRef,
                Pessoa = divida.PessoaRelacionada,
                CategoriaId = req.CategoriaId,
                Valor = req.Valor,
                Tipo = tipoRelacionada,
                Descricao = descricao,
                Pago = true,
                Confirmado = true,
                DividaId = divida.Id,
            });
        }

        // Atualiza valor_pago
        divida.ValorPago += req.Valor;
        if (divida.ValorPago >= divida.ValorTotal)
        {
            divida.ValorPago = divida.ValorTotal;
            divida.Status = "quitada";
        }

        await _context.SaveChangesAsync();
        return Ok(transacaoDono);
    }

    [HttpGet("{id}/pagamentos")]
    public async Task<ActionResult<IEnumerable<Transacao>>> ListarPagamentos(int id)
    {
        var divida = await _context.Dividas.FindAsync(id);
        if (divida == null) return NotFound();

        // Retorna só as transações do dono da dívida para não duplicar pagamentos duplos
        return await _context.Transacoes
            .Include(t => t.Categoria)
            .Where(t => t.DividaId == id && t.Pessoa == divida.Pessoa)
            .OrderByDescending(t => t.Data)
            .ToListAsync();
    }

    [HttpPut("{id}/pagamento/{transacaoId}")]
    public async Task<IActionResult> EditarPagamento(int id, int transacaoId, [FromBody] EditarPagamentoRequest req)
    {
        var divida = await _context.Dividas.FindAsync(id);
        if (divida == null) return NotFound();

        var transacao = await _context.Transacoes.FindAsync(transacaoId);
        if (transacao == null || transacao.DividaId != id) return NotFound();

        transacao.Valor = req.Valor;
        transacao.Data = req.Data;
        transacao.Descricao = req.Descricao;
        await _context.SaveChangesAsync();

        // Recalcula valorPago da dívida somando todas as transações do dono
        var totalPago = await _context.Transacoes
            .Where(t => t.DividaId == id && t.Pessoa == divida.Pessoa)
            .SumAsync(t => t.Valor);

        divida.ValorPago = Math.Min(totalPago, divida.ValorTotal);
        divida.Status = divida.ValorPago >= divida.ValorTotal ? "quitada" : "ativa";
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deletar(int id)
    {
        var divida = await _context.Dividas.FindAsync(id);
        if (divida == null) return NotFound();

        // Remove todas as transações vinculadas a esta dívida
        var transacoesVinculadas = await _context.Transacoes
            .Where(t => t.DividaId == id)
            .ToListAsync();
        _context.Transacoes.RemoveRange(transacoesVinculadas);

        _context.Dividas.Remove(divida);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}

public class PagamentoRequest
{
    public decimal Valor { get; set; }
    public DateOnly Data { get; set; }
    public int CategoriaId { get; set; }
    public string? Descricao { get; set; }
}

public class EditarPagamentoRequest
{
    public decimal Valor { get; set; }
    public DateOnly Data { get; set; }
    public string? Descricao { get; set; }
}
