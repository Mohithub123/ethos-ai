from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO

def generate_pdf_report(stats, recent_sessions):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)

    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = styles["Heading1"]
    elements.append(Paragraph("ETHOS - Empathy Growth Report", title_style))
    elements.append(Spacer(1, 20))

    # Stats
    elements.append(Paragraph(f"Total Sessions: {stats['totalSessions']}", styles["Normal"]))
    elements.append(Paragraph(f"Average Score: {stats['averageScore']}/100", styles["Normal"]))
    elements.append(Paragraph(f"Trend: {stats['trend']} ({stats['trendPercentage']}%)", styles["Normal"]))
    elements.append(Paragraph(f"Most Common Sentiment: {stats['mostCommon']}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # Recent Sessions
    elements.append(Paragraph("Recent Reflections:", styles["Heading2"]))
    elements.append(Spacer(1, 10))

    for session in recent_sessions[:5]:
        elements.append(Paragraph(f"- {session['text'][:100]}...", styles["Normal"]))
        elements.append(Spacer(1, 5))

    doc.build(elements)
    buffer.seek(0)
    return buffer