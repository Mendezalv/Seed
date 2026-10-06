"""initial schema

Revision ID: 001
Revises: 
Create Date: 2026-10-06 19:53:48.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. propriedades
    op.create_table(
        'propriedades',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('cnpj_cpf', sa.String(length=18), nullable=True),
        sa.Column('inscricao_estadual', sa.String(length=20), nullable=True),
        sa.Column('endereco', sa.String(length=500), nullable=True),
        sa.Column('municipio', sa.String(length=200), nullable=True),
        sa.Column('estado', sa.String(length=2), nullable=True),
        sa.Column('area_total_hectares', sa.Numeric(precision=12, scale=2), nullable=True),
        sa.Column('car_numero', sa.String(length=50), nullable=True, comment='Cadastro Ambiental Rural'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='ATIVA'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('cnpj_cpf')
    )

    # 2. usuarios
    op.create_table(
        'usuarios',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('nome_completo', sa.String(length=255), nullable=False),
        sa.Column('senha_hash', sa.String(length=255), nullable=False),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('role', sa.String(length=20), nullable=False, server_default='OPERADOR'),
        sa.Column('ativo', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('ultimo_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], name='fk_usuario_propriedade'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email')
    )
    op.create_index(op.f('ix_usuarios_propriedade_id'), 'usuarios', ['propriedade_id'], unique=False)

    # 3. insumos
    op.create_table(
        'insumos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('unidade_medida', sa.String(length=20), nullable=False),
        sa.Column('preco_unitario', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # 4. lotes_insumo
    op.create_table(
        'lotes_insumo',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('insumo_id', sa.Uuid(), nullable=False),
        sa.Column('codigo_lote', sa.String(length=100), nullable=False),
        sa.Column('quantidade_inicial', sa.Numeric(precision=12, scale=3), nullable=False),
        sa.Column('quantidade_atual', sa.Numeric(precision=12, scale=3), nullable=False),
        sa.Column('data_validade', sa.Date(), nullable=True),
        sa.Column('fornecedor', sa.String(length=255), nullable=True),
        sa.Column('entrada_em', sa.DateTime(timezone=True), nullable=False),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['insumo_id'], ['insumos.id'], ),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_lotes_insumo_propriedade_id'), 'lotes_insumo', ['propriedade_id'], unique=False)

    # 5. talhoes
    op.create_table(
        'talhoes',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('area_hectares', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('geometria', Geometry('POLYGON', srid=4326), nullable=True),
        sa.Column('cultura_atual', sa.String(length=100), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='ATIVO'),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_talhoes_propriedade_id'), 'talhoes', ['propriedade_id'], unique=False)

    # 6. safras
    op.create_table(
        'safras',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('talhao_id', sa.Uuid(), nullable=False),
        sa.Column('cultura', sa.String(length=100), nullable=False),
        sa.Column('variedade', sa.String(length=100), nullable=True),
        sa.Column('data_plantio', sa.Date(), nullable=False),
        sa.Column('data_colheita', sa.Date(), nullable=True),
        sa.Column('produtividade_estimada', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('produtividade_real', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PLANEJADA'),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.ForeignKeyConstraint(['talhao_id'], ['talhoes.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_safras_propriedade_id'), 'safras', ['propriedade_id'], unique=False)

    # 7. alocacoes_insumo
    op.create_table(
        'alocacoes_insumo',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('lote_insumo_id', sa.Uuid(), nullable=False),
        sa.Column('safra_id', sa.Uuid(), nullable=False),
        sa.Column('talhao_id', sa.Uuid(), nullable=False),
        sa.Column('quantidade', sa.Numeric(precision=12, scale=3), nullable=False),
        sa.Column('area_hectares', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('operador_id', sa.Uuid(), nullable=False),
        sa.Column('aplicado_em', sa.DateTime(timezone=True), nullable=False),
        sa.Column('metadata_campo', sa.JSON(), nullable=True),
        sa.Column('sync_id', sa.Uuid(), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['lote_insumo_id'], ['lotes_insumo.id'], ),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.ForeignKeyConstraint(['safra_id'], ['safras.id'], ),
        sa.ForeignKeyConstraint(['talhao_id'], ['talhoes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sync_id')
    )
    op.create_index(op.f('ix_alocacoes_insumo_propriedade_id'), 'alocacoes_insumo', ['propriedade_id'], unique=False)

    # 8. maquinarios
    op.create_table(
        'maquinarios',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('modelo', sa.String(length=100), nullable=True),
        sa.Column('ano_fabricacao', sa.Integer(), nullable=True),
        sa.Column('horimetro_atual', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('intervalo_preventiva', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('proximo_servico_em', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='OPERACIONAL'),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_maquinarios_propriedade_id'), 'maquinarios', ['propriedade_id'], unique=False)

    # 9. ordens_manutencao
    op.create_table(
        'ordens_manutencao',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('maquinario_id', sa.Uuid(), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('descricao', sa.String(length=1000), nullable=True),
        sa.Column('horimetro_na_abertura', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='PENDENTE'),
        sa.Column('prioridade', sa.String(length=50), nullable=False, server_default='MEDIA'),
        sa.Column('concluida_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('custo_estimado', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('custo_real', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['maquinario_id'], ['maquinarios.id'], ),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ordens_manutencao_propriedade_id'), 'ordens_manutencao', ['propriedade_id'], unique=False)

    # 10. ocorrencias_sanitarias
    op.create_table(
        'ocorrencias_sanitarias',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('talhao_id', sa.Uuid(), nullable=True),
        sa.Column('tipo_cultura', sa.String(length=100), nullable=False),
        sa.Column('categoria', sa.String(length=50), nullable=False),
        sa.Column('agente_identificado', sa.String(length=255), nullable=False),
        sa.Column('severidade', sa.String(length=50), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('fotos_urls', sa.JSON(), nullable=True),
        sa.Column('dados_extras', sa.JSON(), nullable=True),
        sa.Column('reportado_por', sa.Uuid(), nullable=False),
        sa.Column('observado_em', sa.DateTime(timezone=True), nullable=False),
        sa.Column('sincronizado_em', sa.DateTime(timezone=True), nullable=True),
        sa.Column('origem', sa.String(length=50), nullable=False),
        sa.Column('sync_id', sa.Uuid(), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.ForeignKeyConstraint(['reportado_por'], ['usuarios.id'], name='fk_ocorrencia_usuario'),
        sa.ForeignKeyConstraint(['talhao_id'], ['talhoes.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sync_id')
    )
    op.create_index(op.f('ix_ocorrencias_sanitarias_propriedade_id'), 'ocorrencias_sanitarias', ['propriedade_id'], unique=False)

    # 11. dados_climaticos_cache
    op.create_table(
        'dados_climaticos_cache',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('data_referencia', sa.Date(), nullable=False),
        sa.Column('temp_media_c', sa.Float(), nullable=True),
        sa.Column('temp_max_c', sa.Float(), nullable=True),
        sa.Column('temp_min_c', sa.Float(), nullable=True),
        sa.Column('umidade_relativa_pct', sa.Float(), nullable=True),
        sa.Column('precipitacao_mm', sa.Float(), nullable=True),
        sa.Column('velocidade_vento_ms', sa.Float(), nullable=True),
        sa.Column('horas_molhamento_foliar', sa.Integer(), nullable=True),
        sa.Column('fonte', sa.String(length=50), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('latitude', 'longitude', 'data_referencia', 'fonte', name='uix_dados_climaticos_cache')
    )

    # 12. alertas_epidemiologicos
    op.create_table(
        'alertas_epidemiologicos',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tipo_alerta', sa.String(length=50), nullable=False),
        sa.Column('agente', sa.String(length=255), nullable=False),
        sa.Column('risco_score', sa.Float(), nullable=False),
        sa.Column('fatores_contribuintes', sa.JSON(), nullable=False),
        sa.Column('latitude_centro', sa.Float(), nullable=False),
        sa.Column('longitude_centro', sa.Float(), nullable=False),
        sa.Column('raio_km', sa.Float(), nullable=False),
        sa.Column('notificado', sa.Boolean(), nullable=False),
        sa.Column('valido_ate', sa.DateTime(timezone=True), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alertas_epidemiologicos_propriedade_id'), 'alertas_epidemiologicos', ['propriedade_id'], unique=False)

    # 13. fontes_energia
    op.create_table(
        'fontes_energia',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('tipo', sa.String(length=50), nullable=False),
        sa.Column('categoria', sa.String(length=50), nullable=False),
        sa.Column('unidade_medida', sa.String(length=20), nullable=False),
        sa.Column('fator_emissao_co2', sa.Float(), nullable=False),
        sa.Column('descricao', sa.String(length=255), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_fontes_energia_propriedade_id'), 'fontes_energia', ['propriedade_id'], unique=False)

    # 14. consumos_energia
    op.create_table(
        'consumos_energia',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('fonte_id', sa.Uuid(), nullable=False),
        sa.Column('periodo_inicio', sa.Date(), nullable=False),
        sa.Column('periodo_fim', sa.Date(), nullable=False),
        sa.Column('quantidade_consumida', sa.Numeric(precision=12, scale=3), nullable=False),
        sa.Column('custo_total_brl', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('equipamento_ref', sa.String(length=100), nullable=True),
        sa.Column('metadata_consumo', sa.JSON(), nullable=True),
        sa.Column('sync_id', sa.Uuid(), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['fonte_id'], ['fontes_energia.id'], ),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('sync_id')
    )
    op.create_index(op.f('ix_consumos_energia_propriedade_id'), 'consumos_energia', ['propriedade_id'], unique=False)

    # 15. relatorios_esg
    op.create_table(
        'relatorios_esg',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('periodo', sa.String(length=20), nullable=False),
        sa.Column('emissao_total_co2e_ton', sa.Numeric(precision=12, scale=3), nullable=False),
        sa.Column('emissao_por_hectare', sa.Numeric(precision=10, scale=3), nullable=False),
        sa.Column('pct_energia_renovavel', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('intensidade_carbono', sa.Numeric(precision=10, scale=3), nullable=True),
        sa.Column('indicadores_detalhados', sa.JSON(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='RASCUNHO'),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_relatorios_esg_propriedade_id'), 'relatorios_esg', ['propriedade_id'], unique=False)

    # 16. sync_logs
    op.create_table(
        'sync_logs',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('envelope_id', sa.Uuid(), nullable=False),
        sa.Column('device_id', sa.String(), nullable=False),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('usuario_id', sa.Uuid(), nullable=False),
        sa.Column('operations_count', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('result', sa.JSON(), nullable=True),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('envelope_id')
    )

    # 17. pending_reviews
    op.create_table(
        'pending_reviews',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('entity_type', sa.String(), nullable=False),
        sa.Column('entity_id', sa.Uuid(), nullable=False),
        sa.Column('local_data', sa.JSON(), nullable=False),
        sa.Column('remote_data', sa.JSON(), nullable=False),
        sa.Column('device_id', sa.String(), nullable=False),
        sa.Column('resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('resolved_by', sa.Uuid(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('resolution', sa.String(), nullable=True),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['propriedade_id'], ['propriedades.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_pending_reviews_propriedade_id'), 'pending_reviews', ['propriedade_id'], unique=False)

    # 18. sync_versions
    op.create_table(
        'sync_versions',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column('propriedade_id', sa.Uuid(), nullable=False),
        sa.Column('current_version', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_sync_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('propriedade_id')
    )

def downgrade() -> None:
    op.drop_table('sync_versions')
    op.drop_table('pending_reviews')
    op.drop_table('sync_logs')
    op.drop_table('relatorios_esg')
    op.drop_table('consumos_energia')
    op.drop_table('fontes_energia')
    op.drop_table('alertas_epidemiologicos')
    op.drop_table('dados_climaticos_cache')
    op.drop_table('ocorrencias_sanitarias')
    op.drop_table('ordens_manutencao')
    op.drop_table('maquinarios')
    op.drop_table('alocacoes_insumo')
    op.drop_table('safras')
    op.drop_table('talhoes')
    op.drop_table('lotes_insumo')
    op.drop_table('insumos')
    op.drop_table('usuarios')
    op.drop_table('propriedades')
