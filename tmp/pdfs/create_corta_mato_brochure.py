from pathlib import Path
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "output" / "pdf" / "brochura-corta-mato-matosinhos.pdf"
ROUTE_IMAGE = ROOT / "images" / "investor-room" / "corta-mato-matosinhos-prova.png"
SHIRT_IMAGE = ROOT / "images" / "investor-room" / "camisola-oficial-corta-mato-final.png"
LOGO = ROOT / "images" / "leca.png"

W, H = landscape(A4)
BG = HexColor("#010f0c")
BG_DEEP = HexColor("#010907")
SURFACE = HexColor("#071a16")
SURFACE_2 = HexColor("#0b211b")
EMERALD = HexColor("#056b57")
MINT = HexColor("#5ecfb1")
TEXT = HexColor("#f5faf8")
MUTED = HexColor("#9aaba6")
FAINT = HexColor("#64746f")
LINE = HexColor("#244039")
BLACK = HexColor("#000000")

MARGIN = 46


def para(c, text, x, y_top, width, size=12, leading=None, color=TEXT,
         font="Helvetica", align=TA_LEFT, max_height=None):
    leading = leading or size * 1.45
    style = ParagraphStyle(
        "p",
        fontName=font,
        fontSize=size,
        leading=leading,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )
    p = Paragraph(text, style)
    _, ph = p.wrap(width, max_height or H)
    p.drawOn(c, x, y_top - ph)
    return ph


def draw_bg(c, variant=0):
    c.setFillColor(BG_DEEP if variant % 2 else BG)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # Subtle diagonal texture and mint glow.
    c.saveState()
    c.setStrokeColor(Color(1, 1, 1, alpha=0.025))
    c.setLineWidth(0.5)
    for offset in range(-400, 900, 56):
        c.line(offset, 0, offset + 360, H)
    c.setFillColor(Color(MINT.red, MINT.green, MINT.blue, alpha=0.05))
    c.circle(W - 48, H - 30, 175, stroke=0, fill=1)
    c.restoreState()


def draw_header(c, section, page_no):
    c.drawImage(str(LOGO), MARGIN, H - 36, 24, 24, mask="auto", preserveAspectRatio=True)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(TEXT)
    c.drawString(MARGIN + 32, H - 22, "CORTA-MATO MATOSINHOS")
    c.setFont("Helvetica", 6.7)
    c.setFillColor(FAINT)
    c.drawString(MARGIN + 32, H - 32, "INVESTOR ROOM  ·  UNIVERSO LEÇA")
    c.setFont("Helvetica-Bold", 6.5)
    c.setFillColor(MINT)
    c.drawRightString(W - MARGIN, H - 25, section.upper())
    c.setStrokeColor(LINE)
    c.setLineWidth(0.6)
    c.line(MARGIN, H - 45, W - MARGIN, H - 45)
    c.setFont("Helvetica", 6.5)
    c.setFillColor(FAINT)
    c.drawString(MARGIN, 20, "LEÇA FUTEBOL CLUBE  ·  APRESENTAÇÃO RESERVADA")
    c.drawRightString(W - MARGIN, 20, f"{page_no:02d} / 10")


def eyebrow(c, text, x, y):
    c.setStrokeColor(MINT)
    c.setLineWidth(1)
    c.line(x, y + 2, x + 22, y + 2)
    c.setFont("Helvetica-Bold", 7.5)
    c.setFillColor(MINT)
    c.drawString(x + 31, y, text.upper())


def title(c, text, x, y_top, size=33, width=650, color=TEXT):
    return para(c, text, x, y_top, width, size=size, leading=size * 0.98,
                color=color, font="Helvetica-Bold")


def rounded_card(c, x, y, w, h, fill=SURFACE, stroke=LINE, radius=12):
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(0.7)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def card(c, x, y, w, h, index, heading, body, featured=False):
    fill = HexColor("#0a3028") if featured else SURFACE
    stroke = MINT if featured else LINE
    rounded_card(c, x, y, w, h, fill, stroke)
    c.setFillColor(MINT)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 18, y + h - 24, index)
    c.setFillColor(Color(MINT.red, MINT.green, MINT.blue, alpha=0.18))
    c.circle(x + w - 28, y + h - 28, 15, fill=1, stroke=0)
    c.setFillColor(MINT)
    c.circle(x + w - 28, y + h - 28, 4, fill=1, stroke=0)
    para(c, heading, x + 18, y + h - 72, w - 36, size=16,
         leading=17, color=TEXT, font="Helvetica-Bold")
    para(c, body, x + 18, y + 68, w - 36, size=8.5,
         leading=12.5, color=MUTED)


def draw_cover(c):
    c.setFillColor(BG_DEEP)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    img = ImageReader(str(ROUTE_IMAGE))
    iw, ih = img.getSize()
    target_w = W * 0.58
    scale = max(target_w / iw, H / ih)
    dw, dh = iw * scale, ih * scale
    c.drawImage(img, W - target_w, (H - dh) / 2, dw, dh, mask="auto")
    # Dark gradient-like overlays.
    for i in range(18):
        alpha = 0.84 * (1 - i / 18)
        c.setFillColor(Color(BG_DEEP.red, BG_DEEP.green, BG_DEEP.blue, alpha=alpha))
        x = W * 0.34 + i * 13
        c.rect(x, 0, 18, H, fill=1, stroke=0)
    c.setFillColor(BG_DEEP)
    c.rect(0, 0, W * 0.36, H, fill=1, stroke=0)
    c.setFillColor(Color(0, 0, 0, alpha=0.22))
    c.rect(W * 0.58, 0, W * 0.42, H, fill=1, stroke=0)
    c.drawImage(str(LOGO), MARGIN, H - 74, 34, 34, mask="auto", preserveAspectRatio=True)
    c.setFont("Helvetica-Bold", 8.5)
    c.setFillColor(TEXT)
    c.drawString(MARGIN + 44, H - 52, "LEÇA FUTEBOL CLUBE")
    c.setFont("Helvetica", 7)
    c.setFillColor(FAINT)
    c.drawString(MARGIN + 44, H - 65, "INVESTOR ROOM  ·  APRESENTAÇÃO RESERVADA")
    eyebrow(c, "Leça da Palmeira · Época 2026/2027", MARGIN, H - 150)
    title(c, "Corta-Mato", MARGIN, H - 180, size=48, width=390)
    title(c, "Matosinhos.", MARGIN, H - 228, size=48, width=390, color=MINT)
    para(c,
         "Uma prova junto ao mar, em terra natural, criada para aproximar a elite nacional, a comunidade e uma nova geração de atletas.",
         MARGIN, H - 292, 365, size=11.5, leading=17, color=MUTED)
    chips = ["PROJETO-PILOTO", "SEM CORTES DE TRÂNSITO", "AMBIÇÃO NACIONAL"]
    x = MARGIN
    for label in chips:
        tw = stringWidth(label, "Helvetica-Bold", 6.3) + 20
        c.setFillColor(Color(1, 1, 1, alpha=0.035))
        c.setStrokeColor(LINE)
        c.roundRect(x, 61, tw, 22, 11, fill=1, stroke=1)
        c.setFont("Helvetica-Bold", 6.3)
        c.setFillColor(MUTED)
        c.drawCentredString(x + tw / 2, 69, label)
        x += tw + 8
    c.setFont("Helvetica", 6.5)
    c.setFillColor(Color(1, 1, 1, alpha=0.58))
    c.drawRightString(W - MARGIN, 24, "BROCHURA DO PROJETO  ·  2026/2027")


def draw_image_crop(c, path, x, y, w, h):
    img = ImageReader(str(path))
    iw, ih = img.getSize()
    scale = max(w / iw, h / ih)
    dw, dh = iw * scale, ih * scale
    c.saveState()
    p = c.beginPath()
    p.rect(x, y, w, h)
    c.clipPath(p, stroke=0, fill=0)
    c.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh)
    c.restoreState()


def page_concept(c):
    draw_bg(c, 1); draw_header(c, "01 · O conceito", 2)
    eyebrow(c, "01 · O conceito", MARGIN, H - 84)
    title(c, "Onde a terra encontra o Atlântico.", MARGIN, H - 114, 31, 410)
    para(c,
         "Um cenário natural e diferenciador para devolver o corta-mato à sua essência: terreno, superação e proximidade. O percurso será pensado junto ao mar, sem necessidade de cortes de trânsito e com uma implantação concebida para não gerar impacto ambiental.",
         MARGIN, H - 194, 360, 10.5, 16, MUTED)
    x, y, w, h = 432, 64, 352, 405
    rounded_card(c, x, y, w, h, SURFACE, LINE, 14)
    c.setFont("Helvetica-Bold", 6.5); c.setFillColor(MINT)
    c.drawString(x + 14, y + h - 22, "VISUAL DO EVENTO")
    c.setFillColor(FAINT); c.drawRightString(x + w - 14, y + h - 22, "LEÇA DA PALMEIRA · 2026/27")
    draw_image_crop(c, ROUTE_IMAGE, x + 10, y + 42, w - 20, h - 76)
    para(c, "Visual conceptual. O percurso apresentado é representativo e será sujeito a validação e ajustes.",
         x + 14, y + 32, w - 28, 6.6, 9, FAINT)


def page_program(c):
    draw_bg(c, 0); draw_header(c, "02 · Um evento para todos", 3)
    eyebrow(c, "02 · Um evento para todos", MARGIN, H - 88)
    title(c, "Três provas. Uma só cidade.", MARGIN, H - 119, 34, 660)
    para(c,
         "O programa combina excelência desportiva com participação aberta, criando um evento capaz de mobilizar públicos diferentes e gerar uma experiência contínua ao longo do dia.",
         MARGIN, H - 172, 650, 10, 15, MUTED)
    gap = 14; cw = (W - 2 * MARGIN - 2 * gap) / 3; y = 70; ch = 265
    card(c, MARGIN, y, cw, ch, "01", "Elite nacional",
         "Uma prova desenhada para receber alguns dos melhores atletas nacionais da modalidade.", True)
    card(c, MARGIN + cw + gap, y, cw, ch, "02", "Corrida popular",
         "Uma experiência aberta a atletas e praticantes de dentro e de fora do concelho.")
    card(c, MARGIN + 2 * (cw + gap), y, cw, ch, "03", "Corrida jovem",
         "Um momento de descoberta que aproxima escolas, famílias e futuros atletas.")


def page_vision(c):
    draw_bg(c, 1); draw_header(c, "03 · Visão a três anos", 4)
    eyebrow(c, "03 · Visão a três anos", MARGIN, H - 88)
    title(c, "Começar com rigor.<br/>Crescer com ambição.", MARGIN, H - 120, 34, 600)
    para(c,
         "A primeira edição valida o conceito, o percurso e o modelo de parceria. O objetivo é construir, em três anos, um evento de referência no corta-mato nacional.",
         MARGIN, H - 202, 610, 10, 15, MUTED)
    y_line = 225
    c.setStrokeColor(EMERALD); c.setLineWidth(1.2); c.line(120, y_line, W - 120, y_line)
    items = [
        ("2026/27", "Projeto-piloto", "Estreia do formato e validação da experiência desportiva e logística."),
        ("ANO 2", "Consolidação", "Reforço do cartaz, da participação popular e do alcance do evento."),
        ("ANO 3", "Referência nacional", "Afirmação no calendário e projeção de Leça da Palmeira no atletismo nacional."),
    ]
    for idx, (period, heading, body) in enumerate(items):
        cx = 155 + idx * 265
        c.setFillColor(BG); c.setStrokeColor(MINT); c.setLineWidth(2)
        c.circle(cx, y_line, 7, fill=1, stroke=1)
        c.setFont("Helvetica-Bold", 7); c.setFillColor(MINT)
        c.drawCentredString(cx, y_line - 33, period)
        para(c, heading, cx - 95, y_line - 52, 190, 15, 17, TEXT, "Helvetica-Bold", TA_CENTER)
        para(c, body, cx - 98, y_line - 92, 196, 8.3, 12, MUTED, align=TA_CENTER)


def page_investment(c):
    draw_bg(c, 0); draw_header(c, "04 · Primeira edição", 5)
    eyebrow(c, "04 · Primeira edição", MARGIN, H - 88)
    c.setFont("Helvetica", 7.5); c.setFillColor(MUTED)
    c.drawString(MARGIN, H - 128, "INVESTIMENTO ESTIMADO")
    c.setFont("Helvetica-Bold", 68); c.setFillColor(TEXT)
    c.drawString(MARGIN, H - 205, "6.000")
    c.setFont("Helvetica-Bold", 30); c.setFillColor(MINT)
    c.drawString(MARGIN + 190, H - 205, "€")
    para(c, "Um orçamento-piloto focado nas condições essenciais para uma prova credível, segura e memorável.",
         MARGIN, H - 232, 300, 10, 15, MUTED)
    entries = [
        ("Enquadramento federativo", "Federação Portuguesa de Atletismo e Associação de Atletismo do Porto"),
        ("Organização e logística", "Preparação e operação da prova"),
        ("Troféus e prémios", "Reconhecimento desportivo dos participantes"),
        ("Refeições e alojamento", "Condições de acolhimento aos atletas convidados"),
    ]
    x = 395; w = 390; h = 76; gap = 10
    for i, (heading, body) in enumerate(entries):
        y = H - 132 - (i + 1) * h - i * gap
        rounded_card(c, x, y, w, h, SURFACE, LINE, 10)
        c.setFillColor(Color(MINT.red, MINT.green, MINT.blue, alpha=0.15)); c.circle(x + 35, y + h / 2, 17, fill=1, stroke=0)
        c.setFillColor(MINT); c.setFont("Helvetica-Bold", 9); c.drawCentredString(x + 35, y + h / 2 - 3, f"{i+1:02d}")
        para(c, heading, x + 68, y + h - 20, w - 88, 9.2, 11, TEXT, "Helvetica-Bold")
        para(c, body, x + 68, y + 34, w - 88, 7.5, 10, MUTED)


def page_impact(c):
    draw_bg(c, 1); draw_header(c, "05 · Retorno para o território", 6)
    eyebrow(c, "05 · Retorno para o território", MARGIN, H - 88)
    title(c, "Uma prova que fica<br/>para além da meta.", MARGIN, H - 120, 34, 620)
    para(c,
         "Atletas, equipas, famílias e participantes populares vindos de fora do concelho representam estadias, refeições, visitas e consumo local. O evento cria uma oportunidade concreta para projetar Leça da Palmeira e a sua frente marítima através do desporto.",
         MARGIN, H - 202, 680, 10, 15, MUTED)
    labels = [
        ("01", "Participação", "Atletas e famílias"),
        ("02", "Economia local", "Estadia e restauração"),
        ("03", "Território", "Visita e notoriedade"),
    ]
    cw = 200; ch = 145; gap = 48; total = 3 * cw + 2 * gap; sx = (W - total) / 2; y = 94
    for i, (num, head, sub) in enumerate(labels):
        x = sx + i * (cw + gap)
        rounded_card(c, x, y, cw, ch, HexColor("#09231e"), HexColor("#1b5648"), 12)
        c.setFont("Helvetica-Bold", 8); c.setFillColor(MINT); c.drawString(x + 18, y + ch - 25, num)
        para(c, head, x + 18, y + 76, cw - 36, 14, 16, TEXT, "Helvetica-Bold")
        para(c, sub, x + 18, y + 48, cw - 36, 8.5, 11, MUTED)
        if i < 2:
            c.setStrokeColor(MINT); c.setLineWidth(1.2)
            c.line(x + cw + 11, y + ch / 2, x + cw + gap - 12, y + ch / 2)
            c.line(x + cw + gap - 18, y + ch / 2 + 5, x + cw + gap - 12, y + ch / 2)
            c.line(x + cw + gap - 18, y + ch / 2 - 5, x + cw + gap - 12, y + ch / 2)


def page_visibility(c):
    draw_bg(c, 0); draw_header(c, "06 · Visibilidade e patrocínio", 7)
    eyebrow(c, "06 · Visibilidade e patrocínio", MARGIN, H - 88)
    title(c, "A marca entra em prova.", MARGIN, H - 120, 34, 620)
    para(c,
         "Ao longo da zona da prova serão criados vários pontos de publicidade para dar visibilidade aos parceiros junto dos atletas, público e conteúdos produzidos durante o evento.",
         MARGIN, H - 172, 650, 10, 15, MUTED)
    entries = [
        ("01", "Partida e chegada", "Pórtico, corredor final e zona de maior concentração de público."),
        ("02", "Percurso", "Barreiras, lonas, bandeiras e pontos de passagem com elevada exposição."),
        ("03", "Aldeia da prova", "Espaços de ativação, contacto com participantes e presença de produto."),
        ("04", "Pódio e media wall", "Presença em fotografias, entrevistas, entrega de prémios e comunicação digital."),
    ]
    gap = 11; cw = (W - 2 * MARGIN - 3 * gap) / 4; y = 72; ch = 260
    for i, item in enumerate(entries):
        card(c, MARGIN + i * (cw + gap), y, cw, ch, *item, featured=(i == 0))


def page_shirt(c):
    draw_bg(c, 1); draw_header(c, "Camisola oficial da prova", 8)
    eyebrow(c, "Camisola oficial da prova", MARGIN, H - 82)
    title(c, "Uma presença que continua depois da meta.", MARGIN, H - 110, 27, 620)
    para(c,
         "A camisola oficial acrescenta exposição durante a competição, nas fotografias e na utilização posterior pelos participantes. As posições comerciais podem ocupar frente, peito, costas e mangas, de acordo com o nível de parceria.",
         MARGIN, H - 159, 700, 9.3, 13.5, MUTED)
    x, y, w, h = 94, 48, W - 188, 330
    rounded_card(c, x, y, w, h, HexColor("#f1eee7"), LINE, 14)
    draw_image_crop(c, SHIRT_IMAGE, x + 8, y + 8, w - 16, h - 16)
    c.setFillColor(Color(BG_DEEP.red, BG_DEEP.green, BG_DEEP.blue, alpha=0.86))
    c.roundRect(x + 18, y + 18, 300, 28, 8, fill=1, stroke=0)
    c.setFillColor(TEXT); c.setFont("Helvetica", 6.7)
    c.drawString(x + 30, y + 29, "PROPOSTA CONCEPTUAL · APLICAÇÃO DE MARCAS SUJEITA A VALIDAÇÃO FINAL")


def page_packages(c):
    draw_bg(c, 0); draw_header(c, "Oportunidades de parceria", 9)
    eyebrow(c, "Oportunidades de parceria", MARGIN, H - 88)
    title(c, "Quatro níveis de presença.", MARGIN, H - 120, 32, 620)
    entries = [
        ("PARCEIRO PRINCIPAL", "3.000 €", "Destaque principal na frente e costas da camisola, presença no pórtico, zona premium do percurso e comunicação do evento."),
        ("PATROCINADOR OFICIAL", "1.500 €", "Posição de destaque no peito ou costas, duas zonas publicitárias no recinto e integração na comunicação digital."),
        ("PARCEIRO DE PERCURSO", "750 €", "Uma posição na manga ou costas inferiores, uma zona dedicada no percurso e presença no painel de parceiros."),
        ("PARCEIRO DE APOIO", "350 €", "Presença partilhada numa zona publicitária, media wall e suportes digitais de agradecimento aos parceiros."),
    ]
    gap = 11; cw = (W - 2 * MARGIN - 3 * gap) / 4; y = 116; ch = 270
    for i, (label, price, body) in enumerate(entries):
        x = MARGIN + i * (cw + gap)
        rounded_card(c, x, y, cw, ch, HexColor("#0a3028") if i == 0 else SURFACE, MINT if i == 0 else LINE, 12)
        c.setFont("Helvetica-Bold", 6.5); c.setFillColor(MINT); c.drawString(x + 16, y + ch - 28, label)
        c.setFont("Helvetica-Bold", 23); c.setFillColor(TEXT); c.drawString(x + 16, y + ch - 70, price)
        c.setStrokeColor(LINE); c.line(x + 16, y + ch - 88, x + cw - 16, y + ch - 88)
        para(c, body, x + 16, y + ch - 112, cw - 32, 8.3, 12, MUTED)
    para(c,
         "Valores indicativos, sem IVA, sujeitos a disponibilidade, combinação de formatos e validação final. Parcerias institucionais, técnicas, de sustentabilidade e media podem incluir apoio em espécie e proposta personalizada.",
         MARGIN, 86, W - 2 * MARGIN, 7.2, 10, FAINT, align=TA_CENTER)


def page_closing(c):
    draw_bg(c, 1)
    c.drawImage(str(LOGO), W / 2 - 32, H - 105, 64, 64, mask="auto", preserveAspectRatio=True)
    c.setFont("Helvetica-Bold", 7); c.setFillColor(MINT)
    c.drawCentredString(W / 2, H - 132, "07 · CONSTRUIR A PRIMEIRA EDIÇÃO")
    para(c, "O primeiro passo de uma<br/>nova referência nacional.", 120, H - 170, W - 240,
         34, 36, TEXT, "Helvetica-Bold", TA_CENTER)
    para(c,
         "Procuramos parceiros fundadores para dar escala, credibilidade e continuidade ao Corta-Mato Matosinhos - do apoio institucional à operação, comunicação, presença na camisola e ativação de marca na zona da prova.",
         180, H - 270, W - 360, 10.5, 16, MUTED, align=TA_CENTER)
    labels = ["CÂMARA MUNICIPAL DE MATOSINHOS", "FEDERAÇÃO", "ASSOCIAÇÃO", "PATROCINADORES"]
    widths = [190, 85, 85, 105]; total = sum(widths) + 3 * 10; x = (W - total) / 2
    for label, wid in zip(labels, widths):
        c.setFillColor(Color(MINT.red, MINT.green, MINT.blue, alpha=0.06)); c.setStrokeColor(HexColor("#1b5648"))
        c.roundRect(x, 176, wid, 28, 14, fill=1, stroke=1)
        c.setFont("Helvetica-Bold", 6); c.setFillColor(MUTED); c.drawCentredString(x + wid / 2, 187, label)
        x += wid + 10
    c.setFillColor(MINT); c.roundRect(W / 2 - 110, 107, 220, 38, 19, fill=1, stroke=0)
    c.setFillColor(BG_DEEP); c.setFont("Helvetica-Bold", 8.5)
    c.drawCentredString(W / 2, 121, "CONSTRUIR ESTA PARCERIA")
    c.setFont("Helvetica-Bold", 8); c.setFillColor(TEXT)
    c.drawCentredString(W / 2, 79, "MARKETING@LECAFC.PT   ·   +351 913 640 795")
    c.setFont("Helvetica", 6.5); c.setFillColor(FAINT)
    c.drawCentredString(W / 2, 35, "LEÇA FUTEBOL CLUBE  ·  INVESTOR ROOM  ·  2026")


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=(W, H), pageCompression=1)
    c.setTitle("Corta-Mato Matosinhos - Brochura do Projeto")
    c.setAuthor("Leça Futebol Clube")
    c.setSubject("Investor Room - Corta-Mato Matosinhos 2026/2027")
    pages = [draw_cover, page_concept, page_program, page_vision, page_investment,
             page_impact, page_visibility, page_shirt, page_packages, page_closing]
    for fn in pages:
        fn(c)
        c.showPage()
    c.save()
    print(OUT)


if __name__ == "__main__":
    build()
