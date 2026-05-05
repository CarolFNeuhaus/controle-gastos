using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ControleGastos.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarDividas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DividaId",
                table: "Transacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Dividas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descricao = table.Column<string>(type: "text", nullable: false),
                    Pessoa = table.Column<string>(type: "text", nullable: false),
                    PessoaRelacionada = table.Column<string>(type: "text", nullable: false),
                    Tipo = table.Column<string>(type: "text", nullable: false),
                    ValorTotal = table.Column<decimal>(type: "numeric", nullable: false),
                    ValorPago = table.Column<decimal>(type: "numeric", nullable: false),
                    DataInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    DataPrevista = table.Column<DateOnly>(type: "date", nullable: true),
                    Observacao = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dividas", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_DividaId",
                table: "Transacoes",
                column: "DividaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transacoes_Dividas_DividaId",
                table: "Transacoes",
                column: "DividaId",
                principalTable: "Dividas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacoes_Dividas_DividaId",
                table: "Transacoes");

            migrationBuilder.DropTable(
                name: "Dividas");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_DividaId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "DividaId",
                table: "Transacoes");
        }
    }
}
