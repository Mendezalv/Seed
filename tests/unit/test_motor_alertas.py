import pytest

class MotorAlertasSanitarios:
    def calcular_risco(self, temp, umidade, vizinhos_com_praga):
        score_climatico = 0
        if 25 <= temp <= 30 and umidade > 80:
            score_climatico = 0.5
        elif temp > 35 or umidade < 40:
            score_climatico = 0.1
        else:
            score_climatico = 0.3
            
        risco_vizinhos = min(vizinhos_com_praga * 0.2, 0.5)
        return score_climatico + risco_vizinhos

def test_score_climatico_ideal():
    motor = MotorAlertasSanitarios()
    risco = motor.calcular_risco(temp=28, umidade=85, vizinhos_com_praga=0)
    assert risco == 0.5

def test_score_climatico_desfavoravel():
    motor = MotorAlertasSanitarios()
    risco = motor.calcular_risco(temp=36, umidade=30, vizinhos_com_praga=0)
    assert risco == 0.1

def test_risco_alto_com_vizinhos():
    motor = MotorAlertasSanitarios()
    risco = motor.calcular_risco(temp=28, umidade=85, vizinhos_com_praga=3)
    assert risco >= 0.9

def test_risco_baixo_sem_ocorrencias():
    motor = MotorAlertasSanitarios()
    risco = motor.calcular_risco(temp=20, umidade=60, vizinhos_com_praga=0)
    assert risco == 0.3
