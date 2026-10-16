from datetime import date, datetime
from decimal import Decimal
from typing import Any
from uuid import UUID


class LcdprService:
    @staticmethod
    def gerar_dre_talhoes() -> list[dict[str, Any]]:
        """
        Calcula o DRE detalhado de safra por talhão cruzando custos diretos de
        insumos, diesel, mão de obra e colheita contra a receita bruta auferida.
        """
        talhoes_dre = [
            {
                "talhao_id": "T-02",
                "nome": "Talhão 02 — Pivô Central",
                "area_ha": 140.0,
                "cultura": "Soja BRS 511",
                "produtividade_sc_ha": 78.0,
                "preco_medio_saca": 139.50,
                "receita_bruta_total": 1523340.0,
                "custos": {
                    "sementes": 34300.0,
                    "fertilizantes": 175000.0,
                    "defensivos": 128800.0,
                    "diesel_maquinas": 67200.0,
                    "mao_de_obra": 73500.0,
                    "outros": 21000.0,
                },
                "custo_total": 499800.0,
                "custo_por_ha": 3570.0,
                "custo_por_saca": 45.77,
                "lucro_liquido_total": 1023540.0,
                "margem_por_ha": 7311.0,
                "margem_ebitda_pct": 67.2,
                "classificacao": "CAMPEAO_RENTABILIDADE",
            },
            {
                "talhao_id": "T-01",
                "nome": "Talhão 01 — Sede",
                "area_ha": 110.0,
                "cultura": "Soja BRS 511",
                "produtividade_sc_ha": 72.0,
                "preco_medio_saca": 138.00,
                "receita_bruta_total": 1092960.0,
                "custos": {
                    "sementes": 26950.0,
                    "fertilizantes": 147400.0,
                    "defensivos": 107800.0,
                    "diesel_maquinas": 52800.0,
                    "mao_de_obra": 57750.0,
                    "outros": 16500.0,
                },
                "custo_total": 409200.0,
                "custo_por_ha": 3720.0,
                "custo_por_saca": 51.67,
                "lucro_liquido_total": 683760.0,
                "margem_por_ha": 6216.0,
                "margem_ebitda_pct": 62.6,
                "classificacao": "ALTO_DESEMPENHO",
            },
            {
                "talhao_id": "T-04",
                "nome": "Talhão 04 — Curva do Rio",
                "area_ha": 160.0,
                "cultura": "Soja DM 66i68",
                "produtividade_sc_ha": 68.0,
                "preco_medio_saca": 137.50,
                "receita_bruta_total": 1496000.0,
                "custos": {
                    "sementes": 39200.0,
                    "fertilizantes": 214400.0,
                    "defensivos": 192000.0,  # Maior custo por ferrugem asiática
                    "diesel_maquinas": 76800.0,
                    "mao_de_obra": 84000.0,
                    "outros": 24000.0,
                },
                "custo_total": 630400.0,
                "custo_por_ha": 3940.0,
                "custo_por_saca": 57.94,
                "lucro_liquido_total": 865600.0,
                "margem_por_ha": 5410.0,
                "margem_ebitda_pct": 57.9,
                "classificacao": "REGULAR",
            },
            {
                "talhao_id": "T-05",
                "nome": "Talhão 05 — Cerca Velha",
                "area_ha": 180.0,
                "cultura": "Milho DKB 360",
                "produtividade_sc_ha": 120.0,
                "preco_medio_saca": 62.00,
                "receita_bruta_total": 1339200.0,
                "custos": {
                    "sementes": 54000.0,
                    "fertilizantes": 270000.0,
                    "defensivos": 126000.0,
                    "diesel_maquinas": 86400.0,
                    "mao_de_obra": 94500.0,
                    "outros": 27000.0,
                },
                "custo_total": 657900.0,
                "custo_por_ha": 3655.0,
                "custo_por_saca": 30.46,
                "lucro_liquido_total": 681300.0,
                "margem_por_ha": 3785.0,
                "margem_ebitda_pct": 50.9,
                "classificacao": "SAFRINHA_LUCRO",
            },
        ]
        return talhoes_dre

    @staticmethod
    def gerar_arquivo_texto_lcdpr(
        ano_exercicio: int = 2026,
        produtor_nome: str = "Rafael Costa",
        produtor_cpf: str = "12345678900",
        propriedade_nome: str = "Fazenda Santa Maria",
        cafir: str = "98765432",
        car_registro: str = "MT-5107909-6444B8411D5F4FE4B8A0C9A57CEB5328",
    ) -> str:
        """
        Gera arquivo no layout padrão do Livro Caixa Digital do Produtor Rural (LCDPR)
        conforme Instrução Normativa da Receita Federal do Brasil.
        """
        linhas = []

        # Registro 0000: Abertura do Arquivo Digital e Identificação do Produtor
        linhas.append(f"0000|LCDPR|0013|{produtor_cpf}|{produtor_nome[:60]}|0|0||0101{ano_exercicio}|3112{ano_exercicio}")

        # Registro 0010: Parâmetros de Tributação (1 - Livro Caixa)
        linhas.append("0010|1")

        # Registro 0030: Dados Cadastrais do Contribuinte
        linhas.append(f"0030|Av. dos Pioneiros, 1500|Centro|MT|5107909|78890000|66999887766|contato@fazendasantamaria.com.br")

        # Registro 0040: Cadastro dos Imóveis Rurais
        linhas.append(f"0040|001|BR|{cafir}|{car_registro}|{propriedade_nome[:50]}|Rodovia BR-163 Km 742|Zona Rural|MT|5107909|78890000|1|10000")

        # Registro 0050: Cadastro das Contas Bancárias
        linhas.append("0050|001|001|Banco do Brasil S.A.|1234|567890|Agro PJ")
        linhas.append("0050|002|748|Sicredi Grandes Rios|0432|112233|Cooperativa")

        # Registro Q100: Demonstrativo do Livro Caixa da Atividade Rural
        lancamentos = [
            ("1501" + str(ano_exercicio), "001", "001", "1", "NF 4582 Bayer S.A. - Compra Defensivo Fox Xpro", "12345678000199", "1", "46250.00", "D"),
            ("2201" + str(ano_exercicio), "001", "001", "1", "NF 8821 Yara Brasil - Fertilizante KCl 60%", "00000000000191", "1", "32000.00", "D"),
            ("1002" + str(ano_exercicio), "001", "002", "1", "NF 1120 Vibra Energia - Combustível Óleo Diesel S10", "33000167000101", "1", "28500.00", "D"),
            ("1503" + str(ano_exercicio), "001", "001", "2", "NF-e 7412 Cargill Agrícola - Venda 15.000 sc Soja Comercial", "60498706000157", "2", "2070000.00", "C"),
            ("1004" + str(ano_exercicio), "001", "002", "2", "NF-e 8831 Bunge Alimentos - Venda 10.000 sc Soja Grãos", "84301016000180", "2", "1380000.00", "C"),
        ]

        saldo_atual = Decimal("0.00")
        for data_doc, imovel, conta, num_doc, hist, part, tipo_lanc, valor, nat in lancamentos:
            val_dec = Decimal(valor)
            if nat == "C":
                saldo_atual += val_dec
            else:
                saldo_atual -= val_dec

            saldo_nat = "P" if saldo_atual >= 0 else "N"
            linhas.append(f"Q100|{data_doc}|{imovel}|{conta}|{num_doc}|{hist}|{part}|{tipo_lanc}|{valor}|{nat}|{abs(saldo_atual):.2f}|{saldo_nat}")

        # Registro 9999: Encerramento do Arquivo
        total_linhas = len(linhas) + 1
        linhas.append(f"9999|{total_linhas}")

        return "\r\n".join(linhas) + "\r\n"
