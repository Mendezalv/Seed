import pytest

class CalculadoraESG:
    def calcular_co2_diesel(self, litros):
        return litros * 2.68
        
    def percentual_renovavel(self, renovavel, fossil):
        total = renovavel + fossil
        return (renovavel / total * 100) if total > 0 else 0
        
    def gerar_relatorio(self, dados):
        diesel_co2 = self.calcular_co2_diesel(dados.get("diesel_l", 0))
        solar_co2 = 0
        perc_ren = self.percentual_renovavel(dados.get("energia_solar_kwh", 0), dados.get("energia_fossil_kwh", 0))
        
        return {
            "emissoes_totais": diesel_co2 + solar_co2,
            "percentual_renovavel": perc_ren
        }

def test_emissao_diesel():
    calc = CalculadoraESG()
    emissoes = calc.calcular_co2_diesel(100)
    assert emissoes == 268.0

def test_percentual_renovavel():
    calc = CalculadoraESG()
    perc = calc.percentual_renovavel(renovavel=400, fossil=100)
    assert perc == 80.0

def test_relatorio_completo():
    calc = CalculadoraESG()
    relatorio = calc.gerar_relatorio({"diesel_l": 50, "energia_solar_kwh": 300, "energia_fossil_kwh": 100})
    assert relatorio["emissoes_totais"] == 134.0
    assert relatorio["percentual_renovavel"] == 75.0

def test_fator_emissao_solar_zero():
    calc = CalculadoraESG()
    relatorio = calc.gerar_relatorio({"diesel_l": 0, "energia_solar_kwh": 1000, "energia_fossil_kwh": 0})
    assert relatorio["emissoes_totais"] == 0
    assert relatorio["percentual_renovavel"] == 100.0
