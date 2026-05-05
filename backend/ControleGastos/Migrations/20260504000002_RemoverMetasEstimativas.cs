using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ControleGastos.Migrations
{
    /// <inheritdoc />
    public partial class RemoverMetasEstimativas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "MetasProgresso");
            migrationBuilder.DropTable(name: "Metas");
            migrationBuilder.DropTable(name: "Projecoes");
            migrationBuilder.DropTable(name: "SalariosEstimativas");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SalariosEstimativas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    AtualizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Confirmado = table.Column<bool>(type: "boolean", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    ValorEstimado = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorReal = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_SalariosEstimativas", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Projecoes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CalculadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MediaGuardadaMes = table.Column<decimal>(type: "numeric", nullable: false),
                    MesesNecessarios = table.Column<int>(type: "integer", nullable: true),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    Projecao12m = table.Column<decimal>(type: "numeric", nullable: false),
                    Projecao60m = table.Column<decimal>(type: "numeric", nullable: false),
                    SimulacaoValorAlvo = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table => { table.PrimaryKey("PK_Projecoes", x => x.Id); });

            migrationBuilder.CreateTable(
                name: "Metas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CategoriaId = table.Column<int>(type: "integer", nullable: true),
                    Ativa = table.Column<bool>(type: "boolean", nullable: false),
                    Nome = table.Column<string>(type: "text", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    Prazo = table.Column<DateOnly>(type: "date", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    ValorAlvo = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Metas", x => x.Id);
                    table.ForeignKey(name: "FK_Metas_Categorias_CategoriaId", column: x => x.CategoriaId, principalTable: "Categorias", principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "MetasProgresso",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    MetaId = table.Column<int>(type: "integer", nullable: false),
                    CalculadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MesRef = table.Column<DateOnly>(type: "date", nullable: false),
                    PercentualAtingido = table.Column<decimal>(type: "numeric", nullable: false),
                    SnapshotSaldo = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorAcumulado = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorGuardadoMes = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MetasProgresso", x => x.Id);
                    table.ForeignKey(name: "FK_MetasProgresso_Metas_MetaId", column: x => x.MetaId, principalTable: "Metas", principalColumn: "Id", onDelete: ReferentialAction.Cascade);
                });
        }
    }
}
