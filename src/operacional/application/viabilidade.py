from uuid import UUID
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from src.operacional.domain.models import Safra, AlocacaoInsumo, LoteInsumo, Insumo
from src.operacional.domain.schemas import ViabilidadeRequest, ViabilidadeResponse, CenarioViabilidade

class ViabilidadeService:
    @staticmethod
    async def calcular_viabilidade(request: ViabilidadeRequest, propriedade_id: UUID, session: AsyncSession) -> ViabilidadeResponse:
        safra = await session.get(Safra, request.safra_id)
        if not safra or safra.propriedade_id != propriedade_id:
            raise ValueError("Safra não encontrada ou pertence a outra propriedade.")

        stmt_insumos = select(
            func.sum(AlocacaoInsumo.quantidade * Insumo.preco_unitario)
        ).join(LoteInsumo, AlocacaoInsumo.lote_insumo_id == LoteInsumo.id)\
         .join(Insumo, LoteInsumo.insumo_id == Insumo.id)\
         .where(AlocacaoInsumo.safra_id == safra.id)

        result = await session.execute(stmt_insumos)
        custo_insumos = result.scalar() or Decimal('0')

        custo_total = custo_insumos + request.custo_mao_obra + request.custo_frete + request.custo_impostos
        
        # Obtenção de cotação de mercado em tempo real (CEPEA / Fallback)
        preco_mercado = request.preco_mercado_saca
        if preco_mercado is None:
            try:
                from src.shared.integrations.cotacoes.cepea import CEPEAClient
                cepea = CEPEAClient()
                cultura_normalizada = (safra.cultura or "").lower()
                if "soja" in cultura_normalizada:
                    cot = await cepea.obter_cotacao_soja()
                    preco_mercado = Decimal(str(cot.preco_brl)) if cot.preco_brl > 0 else Decimal('135.00')
                elif "milho" in cultura_normalizada:
                    cot = await cepea.obter_cotacao_milho()
                    preco_mercado = Decimal(str(cot.preco_brl)) if cot.preco_brl > 0 else Decimal('62.00')
                elif "cafe" in cultura_normalizada or "café" in cultura_normalizada:
                    cot = await cepea.obter_cotacao_cafe()
                    preco_mercado = Decimal(str(cot.preco_brl)) if cot.preco_brl > 0 else Decimal('1100.00')
                else:
                    preco_mercado = Decimal('140.00')
            except Exception:
                preco_mercado = Decimal('140.00')

        produtividade = safra.produtividade_estimada or safra.produtividade_real or Decimal('1')
        sacas_totais = produtividade

        custo_por_saca = custo_total / sacas_totais if sacas_totais > 0 else Decimal('0')
        break_even = custo_total / preco_mercado if preco_mercado > 0 else Decimal('0')
        receita_bruta = sacas_totais * preco_mercado
        lucro_liquido = receita_bruta - custo_total
        margem = (lucro_liquido / receita_bruta * Decimal('100')) if receita_bruta > 0 else Decimal('0')

        def criar_cenario(nome: str, variacao: Decimal) -> CenarioViabilidade:
            preco = preco_mercado * variacao
            rb = sacas_totais * preco
            ll = rb - custo_total
            m = (ll / rb * Decimal('100')) if rb > 0 else Decimal('0')
            return CenarioViabilidade(
                nome=nome,
                preco_saca=preco,
                receita_bruta=rb,
                lucro_liquido=ll,
                margem_percentual=m
            )

        cenarios = [
            criar_cenario("Pessimista (-20%)", Decimal('0.80')),
            criar_cenario("Base", Decimal('1.00')),
            criar_cenario("Otimista (+20%)", Decimal('1.20'))
        ]

        return ViabilidadeResponse(
            custo_total=custo_total,
            custo_por_saca=custo_por_saca,
            break_even_sacas=break_even,
            margem_percentual=margem,
            receita_bruta=receita_bruta,
            lucro_liquido=lucro_liquido,
            cenarios=cenarios
        )
