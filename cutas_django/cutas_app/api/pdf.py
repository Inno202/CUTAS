import io
from datetime import datetime
from xml.sax.saxutils import escape

from django.http import HttpResponse
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import HRFlowable, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

NAVY = colors.HexColor('#255190')
GOLD = colors.HexColor('#FDB813')


def _p(text, style):
    # Every user-supplied string is XML-escaped: reportlab parses Paragraph text as markup,
    # so raw "<" or "&" from a scholar would otherwise crash the PDF or inject markup.
    return Paragraph(escape(str(text if text is not None else '')).replace('\n', '<br/>'), style)


def build_pdf(filename, title, subtitle, sections):
    """sections: list of dicts {heading, fields:[(label,value)], text:str, table:{headers:[], rows:[[]]}}"""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=36, rightMargin=36, topMargin=36, bottomMargin=36)
    ss = getSampleStyleSheet()
    h1 = ParagraphStyle('h1', parent=ss['Heading1'], fontSize=15, textColor=NAVY, spaceAfter=4)
    h2 = ParagraphStyle('h2', parent=ss['Heading2'], fontSize=11, textColor=NAVY, spaceBefore=10, spaceAfter=4)
    body = ParagraphStyle('b', parent=ss['Normal'], fontSize=9.5, leading=13)
    small = ParagraphStyle('s', parent=ss['Normal'], fontSize=8.5, leading=11, textColor=colors.HexColor('#475569'))
    cell = ParagraphStyle('c', parent=ss['Normal'], fontSize=8.5, leading=11)

    story = [
        Paragraph('CENTRAL UNIVERSITY OF TECHNOLOGY ACADEMIC SOCIETY', h1),
        _p(f'{title} · Generated {datetime.now():%d %B %Y}', small),
        _p(subtitle, small),
        HRFlowable(width='100%', thickness=2, color=GOLD, spaceBefore=6, spaceAfter=10),
    ]
    for s in sections:
        if s.get('heading'):
            story.append(_p(s['heading'], h2))
        for label, value in s.get('fields', []):
            story.append(Paragraph(f'<b>{escape(label)}:</b> {escape(str(value or "-"))}', body))
        if s.get('text') is not None:
            story.append(_p(s['text'], body))
        t = s.get('table')
        if t:
            data = [t['headers']] + [[_p(c, cell) for c in r] for r in t['rows']]
            if len(data) == 1:
                story.append(_p('No records.', body))
            else:
                tbl = Table(data, repeatRows=1)
                tbl.setStyle(TableStyle([
                    ('BACKGROUND', (0, 0), (-1, 0), NAVY), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                    ('FONTSIZE', (0, 0), (-1, 0), 8.5), ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
                ]))
                story.append(tbl)
        story.append(Spacer(1, 6))
    doc.build(story)
    buf.seek(0)
    resp = HttpResponse(buf.getvalue(), content_type='application/pdf')
    resp['Content-Disposition'] = f'attachment; filename="{filename}"'
    return resp
