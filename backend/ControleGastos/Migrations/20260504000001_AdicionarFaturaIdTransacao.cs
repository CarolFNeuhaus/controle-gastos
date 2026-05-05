using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ControleGastos.Migrations
{
    /// <inheritdoc />
    public partial class AdicionarFaturaIdTransacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FaturaId",
                table: "Transacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_FaturaId",
                table: "Transacoes",
                column: "FaturaId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transacoes_Faturas_FaturaId",
                table: "Transacoes",
                column: "FaturaId",
                principalTable: "Faturas",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacoes_Faturas_FaturaId",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_FaturaId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "FaturaId",
                table: "Transacoes");
        }
    }
}
