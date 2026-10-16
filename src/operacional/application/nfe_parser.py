import xml.etree.ElementTree as ET
from datetime import datetime, date
from decimal import Decimal
from typing import Any
import re


def _clean_tag(tag: str) -> str:
    """Remove namespaces XML para busca simplificada."""
    if "}" in tag:
        return tag.split("}", 1)[1]
    return tag


def _find_elem(parent: ET.Element | None, tag_name: str) -> ET.Element | None:
    if parent is None:
        return None
    for child in parent.iter():
        if _clean_tag(child.tag) == tag_name:
            return child
    return None


def _find_elem_text(parent: ET.Element | None, tag_name: str, default: str = "") -> str:
    elem = _find_elem(parent, tag_name)
    if elem is not None and elem.text:
        return elem.text.strip()
    return default


def _classificar_categoria(x_prod: str, ncm: str) -> str:
    """Classifica automaticamente a categoria do insumo pelo NCM e descrição."""
    desc = x_prod.lower()
    ncm_clean = re.sub(r"\D", "", ncm)

    # 1. Biológicos
    if any(k in desc for k in ["inoculante", "bradyrhizobium", "bacillus", "trichoderma", "biologico"]):
        return "BIOLOGICO"

    # 2. Combustíveis e Lubrificantes (NCM 2710...)
    if ncm_clean.startswith("2710") or any(k in desc for k in ["diesel", "s10", "s-10", "gasolina", "arla", "lubrificante", "oleo motor"]):
        return "COMBUSTIVEL"

    # 3. Fertilizantes (NCM 3101 a 3105)
    if ncm_clean.startswith(("3101", "3102", "3103", "3104", "3105")) or any(
        k in desc for k in ["adubo", "npk", "kcl", "ureia", "fosfato", "potassio", "calcario", "superfosfato", "nitrato", "sulfato"]
    ):
        return "FERTILIZANTE"

    # 4. Sementes (NCM 1209...)
    if ncm_clean.startswith("1209") or any(k in desc for k in ["semente", "soja ipro", "milho hibrido", "germoplasmo", "cultivar"]):
        return "SEMENTE"

    # 5. Defensivos Agrícolas (NCM 3808...)
    if ncm_clean.startswith("3808") or any(
        k in desc for k in ["fungicida", "herbicida", "inseticida", "acaricida", "glifosato", "atrazina", "acefato", "azoxistrobina", "ciproconazol", "imidacloprido"]
    ):
        return "DEFENSIVO"

    return "DEFENSIVO"


class NfeParser:
    @staticmethod
    def parse_xml_content(xml_text: str) -> dict[str, Any]:
        """
        Analisa o conteúdo XML de uma NF-e modelo 55 e extrai dados
        do cabeçalho, emitente, destinatário e itens de insumos.
        """
        try:
            root = ET.fromstring(xml_text)
        except Exception as e:
            raise ValueError(f"Arquivo XML de NF-e inválido ou corrompido: {str(e)}")

        # Busca infNFe
        inf_nfe = _find_elem(root, "infNFe")
        if inf_nfe is None:
            # Tenta a própria raiz se for infNFe
            if _clean_tag(root.tag) == "infNFe":
                inf_nfe = root
            else:
                raise ValueError("O XML fornecido não possui a tag <infNFe> padrão da Receita Federal.")

        chave_acesso = inf_nfe.attrib.get("Id", "")
        if chave_acesso.startswith("NFe"):
            chave_acesso = chave_acesso[3:]

        ide = _find_elem(inf_nfe, "ide")
        emit = _find_elem(inf_nfe, "emit")
        dest = _find_elem(inf_nfe, "dest")
        total = _find_elem(inf_nfe, "total")

        numero_nf = _find_elem_text(ide, "nNF", "0")
        serie = _find_elem_text(ide, "serie", "1")
        data_emissao_raw = _find_elem_text(ide, "dhEmi") or _find_elem_text(ide, "dEmi")

        try:
            if data_emissao_raw:
                data_emissao = data_emissao_raw[:10]
            else:
                data_emissao = date.today().isoformat()
        except Exception:
            data_emissao = date.today().isoformat()

        # Emitente (Fornecedor)
        emit_cnpj = _find_elem_text(emit, "CNPJ") or _find_elem_text(emit, "CPF")
        emit_razao = _find_elem_text(emit, "xNome", "Fornecedor Agro")
        emit_fantasia = _find_elem_text(emit, "xFant", emit_razao)
        ender_emit = _find_elem(emit, "enderEmit")
        emit_municipio = _find_elem_text(ender_emit, "xMun")
        emit_uf = _find_elem_text(ender_emit, "UF")

        # Destinatário
        dest_cnpj = _find_elem_text(dest, "CNPJ") or _find_elem_text(dest, "CPF")
        dest_razao = _find_elem_text(dest, "xNome")

        # Valor Total da NF
        icms_tot = _find_elem(total, "ICMSTot")
        valor_total_nf = Decimal(_find_elem_text(icms_tot, "vNF", "0.00"))

        # Itens (<det>)
        itens: list[dict[str, Any]] = []
        for det in inf_nfe.findall(".//{*}det") or inf_nfe.findall(".//det"):
            prod = _find_elem(det, "prod")
            if prod is None:
                continue

            c_prod = _find_elem_text(prod, "cProd")
            x_prod = _find_elem_text(prod, "xProd", "Insumo Agrícola")
            ncm = _find_elem_text(prod, "NCM")
            cfop = _find_elem_text(prod, "CFOP")
            u_com = _find_elem_text(prod, "uCom", "UN").upper()
            q_com = Decimal(_find_elem_text(prod, "qCom", "1.0"))
            v_un_com = Decimal(_find_elem_text(prod, "vUnCom", "0.0"))
            v_prod = Decimal(_find_elem_text(prod, "vProd", str(q_com * v_un_com)))

            # Rastreabilidade (<rastro>)
            rastro = _find_elem(prod, "rastro")
            n_lote = _find_elem_text(rastro, "nLote")
            d_val = _find_elem_text(rastro, "dVal")
            d_fab = _find_elem_text(rastro, "dFab")

            # Fallback de lote se a NF não tiver rastro
            if not n_lote:
                prefixo_fornecedor = re.sub(r"[^A-Z0-9]", "", emit_razao.split()[0].upper())[:5]
                n_lote = f"LT-{prefixo_fornecedor}-{numero_nf}-{c_prod[:6]}"

            if not d_val:
                # Default de 24 meses
                hoje = date.today()
                d_val = f"{hoje.year + 2}-{hoje.month:02d}-{hoje.day:02d}"

            categoria = _classificar_categoria(x_prod, ncm)

            itens.append({
                "item_numero": det.attrib.get("nItem", str(len(itens) + 1)),
                "codigo_produto": c_prod,
                "nome_produto": x_prod,
                "ncm": ncm,
                "cfop": cfop,
                "unidade": u_com,
                "quantidade": float(q_com),
                "custo_unitario": float(v_un_com),
                "custo_total": float(v_prod),
                "codigo_lote": n_lote,
                "data_validade": d_val,
                "data_fabricacao": d_fab,
                "categoria": categoria,
            })

        return {
            "chave_acesso": chave_acesso,
            "numero_nf": numero_nf,
            "serie": serie,
            "data_emissao": data_emissao,
            "emitente": {
                "cnpj": emit_cnpj,
                "razao_social": emit_razao,
                "nome_fantasia": emit_fantasia,
                "municipio": emit_municipio,
                "uf": emit_uf,
            },
            "destinatario": {
                "cnpj": dest_cnpj,
                "razao_social": dest_razao,
            },
            "valor_total_nf": float(valor_total_nf),
            "quantidade_itens": len(itens),
            "itens": itens,
        }
