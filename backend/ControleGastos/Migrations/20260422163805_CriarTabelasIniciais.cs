using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ControleGastos.Migrations
{
    /// <inheritdoc />
    public partial class CriarTabelasIniciais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Cartoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    Bandeira = table.Column<string>(type: "text", nullable: true),
                    DiaFechamento = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    Cor = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Cartoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Metas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    ValorAlvo = table.Column<decimal>(type: "numeric", nullable: false),
                    Prazo = table.Column<DateOnly>(type: "date", nullable: false),
                    CategoriaId = table.Column<int>(type: "integer", nullable: true),
                    Ativa = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Metas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Metas_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Projecoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CalculadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    MediaGuardadaMes = table.Column<decimal>(type: "numeric", nullable: false),
                    Projecao12m = table.Column<decimal>(type: "numeric", nullable: false),
                    Projecao60m = table.Column<decimal>(type: "numeric", nullable: false),
                    SimulacaoValorAlvo = table.Column<decimal>(type: "numeric", nullable: true),
                    MesesNecessarios = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projecoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SalariosEstimativas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    ValorEstimado = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorReal = table.Column<decimal>(type: "numeric", nullable: true),
                    Confirmado = table.Column<bool>(type: "boolean", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalariosEstimativas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Transacoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Data = table.Column<DateOnly>(type: "date", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    CategoriaId = table.Column<int>(type: "integer", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: true),
                    IsEstimativa = table.Column<bool>(type: "boolean", nullable: false),
                    Confirmado = table.Column<bool>(type: "boolean", nullable: false),
                    Pago = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Transacoes_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Faturas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CartaoId = table.Column<int>(type: "integer", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorFixo = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorSuperfluo = table.Column<decimal>(type: "numeric", nullable: false),
                    Paga = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Faturas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Faturas_Cartoes_CartaoId",
                        column: x => x.CartaoId,
                        principalTable: "Cartoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GastosFixosCartao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CartaoId = table.Column<int>(type: "integer", nullable: false),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    ParcelasTotal = table.Column<int>(type: "integer", nullable: true),
                    ParcelasRestantes = table.Column<int>(type: "integer", nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GastosFixosCartao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GastosFixosCartao_Cartoes_CartaoId",
                        column: x => x.CartaoId,
                        principalTable: "Cartoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MetasProgresso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MetaId = table.Column<int>(type: "integer", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    ValorGuardadoMes = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorAcumulado = table.Column<decimal>(type: "numeric", nullable: false),
                    PercentualAtingido = table.Column<decimal>(type: "numeric", nullable: false),
                    CalculadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    SnapshotSaldo = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetasProgresso", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MetasProgresso_Metas_MetaId",
                        column: x => x.MetaId,
                        principalTable: "Metas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Faturas_CartaoId",
                table: "Faturas",
                column: "CartaoId");

            migrationBuilder.CreateIndex(
                name: "IX_GastosFixosCartao_CartaoId",
                table: "GastosFixosCartao",
                column: "CartaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Metas_CategoriaId",
                table: "Metas",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_MetasProgresso_MetaId",
                table: "MetasProgresso",
                column: "MetaId");

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_CategoriaId",
                table: "Transacoes",
                column: "CategoriaId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Faturas");

            migrationBuilder.DropTable(
                name: "GastosFixosCartao");

            migrationBuilder.DropTable(
                name: "MetasProgresso");

            migrationBuilder.DropTable(
                name: "Projecoes");

            migrationBuilder.DropTable(
                name: "SalariosEstimativas");

            migrationBuilder.DropTable(
                name: "Transacoes");

            migrationBuilder.DropTable(
                name: "Cartoes");

            migrationBuilder.DropTable(
                name: "Metas");
        }
    }
}
