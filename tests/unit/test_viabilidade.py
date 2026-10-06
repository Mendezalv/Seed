import pytest

class ViabilidadeService:
    def calcular_basico(self, custo, preco, produtividade):
        receita = preco * produtividade
        lucro = receita - custo
        ponto_equilibrio = custo / preco if preco > 0 else 0
        return {"receita": receita, "lucro": lucro, "ponto_equilibrio": ponto_equilibrio, "margem": lucro/receita if receita > 0 else 0}
        
    def gerar_cenarios(self, basico):
        return {
            "pessimista": {"lucro": basico["lucro"] * 0.8},
            "base": {"lucro": basico["lucro"]},
            "otimista": {"lucro": basico["lucro"] * 1.2}
        }
        
    def calcular_custo_por_saca(self, custo, sacas):
        return custo / sacas if sacas > 0 else 0

def test_calculo_basico():
    service = ViabilidadeService()
    resultado = service.calcular_basico(custo=1000, preco=100, produtividade=20)
    assert resultado["receita"] == 2000
    assert resultado["lucro"] == 1000
    assert resultado["ponto_equilibrio"] == 10
    assert resultado["margem"] == 0.5

def test_cenarios_gerados():
    service = ViabilidadeService()
    basico = {"lucro": 1000}
    cenarios = service.gerar_cenarios(basico)
    assert cenarios["pessimista"]["lucro"] == 800
    assert cenarios["base"]["lucro"] == 1000
    assert cenarios["otimista"]["lucro"] == 1200

def test_custo_por_saca_correto():
    service = ViabilidadeService()
    custo_saca = service.calcular_custo_por_saca(custo=5000, sacas=100)
    assert custo_saca == 50
