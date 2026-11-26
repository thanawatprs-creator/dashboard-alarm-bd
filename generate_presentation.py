import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_isuzu_presentation_v2():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Colors
    ISUZU_RED = RGBColor(237, 28, 36)      # #ED1C24
    BG_DARK = RGBColor(10, 13, 20)          # #0A0D14
    CARD_DARK = RGBColor(18, 24, 38)        # #121826
    CARD_BORDER = RGBColor(37, 50, 72)      # #253248
    TEXT_WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(156, 163, 175)    # #9CA3AF
    TEXT_GRAY = RGBColor(209, 213, 219)     # #D1D5DB
    COLOR_GREEN = RGBColor(16, 185, 129)    # #10B981
    COLOR_YELLOW = RGBColor(245, 158, 11)   # #F59E0B
    COLOR_RED = RGBColor(239, 68, 68)       # #EF4444
    COLOR_BLUE = RGBColor(59, 130, 246)     # #3B82F6
    ACCENT_CYAN = RGBColor(56, 189, 248)    # #38BDF8

    logo_path = os.path.abspath('frontend/public/isuzu-logo.png')

    def add_header_and_footer(slide, title_text, category_text="ISUZU ENGINE MANUFACTURING (THAILAND) • PROJECT PROPOSAL"):
        # Dark Background
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.fill.background()

        # Top Red Accent Bar
        top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
        top_bar.fill.solid()
        top_bar.fill.fore_color.rgb = ISUZU_RED
        top_bar.line.fill.background()

        # Header Area Box
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.32), Inches(8.8), Inches(1.15))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        p_cat = tf.paragraphs[0]
        p_cat.text = category_text.upper()
        p_cat.font.size = Pt(11)
        p_cat.font.bold = True
        p_cat.font.color.rgb = ISUZU_RED
        p_cat.font.name = "Arial"

        p_title = tf.add_paragraph()
        p_title.text = title_text
        p_title.font.size = Pt(22)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE
        p_title.font.name = "Arial"

        # Isuzu Logo at Top Right
        if os.path.exists(logo_path):
            slide.shapes.add_picture(logo_path, Inches(10.2), Inches(0.38), width=Inches(2.3))

        # Bottom Footer line & text
        footer_line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(7.05), Inches(11.733), Inches(0.02))
        footer_line.fill.solid()
        footer_line.fill.fore_color.rgb = CARD_BORDER
        footer_line.line.fill.background()

        fb = slide.shapes.add_textbox(Inches(0.8), Inches(7.1), Inches(11.733), Inches(0.32))
        ftf = fb.text_frame
        ftf.word_wrap = True
        ftf.margin_left = ftf.margin_top = ftf.margin_right = ftf.margin_bottom = 0
        p_foot = ftf.paragraphs[0]
        p_foot.text = "Dashboard Alarm BD – Phase 1 • Isuzu Engine Manufacturing (Thailand) Co., Ltd. • ผู้นำเสนอ: นาย ธนวัฒน์ ประสาทเขตรการ (66004375)"
        p_foot.font.size = Pt(9.5)
        p_foot.font.color.rgb = TEXT_MUTED
        p_foot.font.name = "Arial"

    # ==========================================
    # SLIDE 1: Title Slide
    # ==========================================
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = BG_DARK
    bg1.line.fill.background()

    ribbon = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.18))
    ribbon.fill.solid()
    ribbon.fill.fore_color.rgb = ISUZU_RED
    ribbon.line.fill.background()

    dec_card = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(11.733), Inches(5.9))
    dec_card.fill.solid()
    dec_card.fill.fore_color.rgb = CARD_DARK
    dec_card.line.color.rgb = CARD_BORDER
    dec_card.line.width = Pt(1.5)

    if os.path.exists(logo_path):
        s1.shapes.add_picture(logo_path, Inches(1.3), Inches(1.35), width=Inches(3.3))

    badge = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.5), Inches(1.35), Inches(3.5), Inches(0.48))
    badge.fill.solid()
    badge.fill.fore_color.rgb = RGBColor(28, 38, 58)
    badge.line.color.rgb = ISUZU_RED
    badge.line.width = Pt(1)
    btf = badge.text_frame
    btf.vertical_anchor = MSO_ANCHOR.MIDDLE
    bp = btf.paragraphs[0]
    bp.alignment = PP_ALIGN.CENTER
    bp.text = "PROJECT PROPOSAL (PHASE 1)"
    bp.font.size = Pt(12)
    bp.font.bold = True
    bp.font.color.rgb = ISUZU_RED
    bp.font.name = "Arial"

    tb_title = s1.shapes.add_textbox(Inches(1.3), Inches(2.2), Inches(10.7), Inches(2.2))
    ttf = tb_title.text_frame
    ttf.word_wrap = True
    p1 = ttf.paragraphs[0]
    p1.text = "Dashboard Alarm BD – Phase 1"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE
    p1.font.name = "Arial"

    p2 = ttf.add_paragraph()
    p2.text = "ข้อเสนอโครงการแดชบอร์ดแจ้งเตือนเครื่องจักรหยุดทำงานแบบเรียลไทม์"
    p2.font.size = Pt(18)
    p2.font.bold = True
    p2.font.color.rgb = ISUZU_RED
    p2.font.name = "Arial"

    p3 = ttf.add_paragraph()
    p3.text = "Isuzu Engine Manufacturing (Thailand) Co., Ltd. • Maintenance Department (PM Shop)"
    p3.font.size = Pt(14)
    p3.font.color.rgb = TEXT_GRAY
    p3.font.name = "Arial"
    p3.space_before = Pt(8)

    info_items = [
        ("ผู้นำเสนอโครงการ", "นาย ธนวัฒน์ ประสาทเขตรการ (รหัสนักศึกษา: 66004375)"),
        ("สถาบันการศึกษา", "มหาวิทยาลัยศรีปทุม (Sripatum University)"),
        ("สถานประกอบการ", "Isuzu Engine Manufacturing (Thailand) Co., Ltd. (PM Shop)"),
        ("เทคโนโลยีที่พัฒนา", "React 18 TypeScript + FastAPI WebSocket + SQLite Demo")
    ]
    for idx, (label, val) in enumerate(info_items):
        col = idx % 2
        row = idx // 2
        ix = Inches(1.3 + col * 5.4)
        iy = Inches(4.7 + row * 0.95)
        
        ibox = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ix, iy, Inches(5.1), Inches(0.8))
        ibox.fill.solid()
        ibox.fill.fore_color.rgb = RGBColor(12, 17, 29)
        ibox.line.color.rgb = CARD_BORDER
        ibox.line.width = Pt(1)
        itf = ibox.text_frame
        itf.margin_left = Inches(0.2)
        itf.margin_top = Inches(0.12)
        ip1 = itf.paragraphs[0]
        ip1.text = label
        ip1.font.size = Pt(10)
        ip1.font.bold = True
        ip1.font.color.rgb = ISUZU_RED
        ip1.font.name = "Arial"
        ip2 = itf.add_paragraph()
        ip2.text = val
        ip2.font.size = Pt(12)
        ip2.font.color.rgb = TEXT_WHITE
        ip2.font.name = "Arial"

    # ==========================================
    # SLIDE 2: Background & Problem Statement
    # ==========================================
    s2 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s2, "ความเป็นมาและความสำคัญของโครงการ (Background & Problem)")

    # 3 Column Comparison
    c_items = [
        ("สถานการณ์ปัจจุบัน (Current)", [
            "ข้อมูล Machine Breakdown ถูกบันทึกในระบบ IBM Maximo เมื่อ Production แจ้งซ่อม",
            "การบันทึกข้อมูลทำได้สมบูรณ์ แต่ 'ยังขาดการแสดงผลแบบ Real-Time'",
            "ข้อมูลอยู่ในฐานข้อมูล Maximo แต่ไม่มีหน้าจอมอนิเตอร์แบบรวมศูนย์ที่หน้างาน"
        ], COLOR_BLUE),
        ("ปัญหาที่พบ (Problem Statement)", [
            "PM Shop ต้องล็อกอินเข้าไปตรวจเช็กใน Maximo เป็นระยะๆ",
            "เมื่อมีแจ้งซ่อมพร้อมกันหลายเครื่อง ช่างไม่ทราบลำดับความเร่งด่วนทันที",
            "ส่งผลให้ Response Time ช้า และ Downtime ของเครื่องจักรเพิ่มสูงขึ้นโดยไม่จำเป็น",
            "ขาดการวัดผลเชิงตัวเลข (No Live Tracking) ของเวลาหยุดเครื่อง ณ ขณะนั้น"
        ], COLOR_RED),
        ("โอกาสในการพัฒนา (Opportunity)", [
            "ดึงข้อมูลสถานะ Breakdown ที่มีอยู่ใน Maximo มาแสดงผลผ่านจอ TV หน้างาน",
            "ทั้งฝ่าย Production และ PM Shop มองเห็นข้อมูลชุดเดียวกันทันที",
            "ยกระดับการตอบสนอง (Quick Response) และลดเวลาการหยุดสายการผลิตให้น้อยที่สุด"
        ], COLOR_GREEN)
    ]
    for idx, (title, bullets, bcolor) in enumerate(c_items):
        cx = Inches(0.8 + idx * 4.0)
        cy = Inches(1.65)
        card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, cx, cy, Inches(3.733), Inches(5.1))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_DARK
        card.line.color.rgb = CARD_BORDER
        card.line.width = Pt(1)

        cbar = s2.shapes.add_shape(MSO_SHAPE.RECTANGLE, cx, cy, Inches(3.733), Inches(0.12))
        cbar.fill.solid()
        cbar.fill.fore_color.rgb = bcolor
        cbar.line.fill.background()

        ctb = s2.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.3), Inches(3.233), Inches(4.5))
        ctf = ctb.text_frame
        ctf.word_wrap = True
        cp1 = ctf.paragraphs[0]
        cp1.text = title
        cp1.font.size = Pt(15)
        cp1.font.bold = True
        cp1.font.color.rgb = bcolor
        cp1.font.name = "Arial"
        cp1.space_after = Pt(14)

        for b in bullets:
            bp = ctf.add_paragraph()
            bp.text = f"• {b}"
            bp.font.size = Pt(11.5)
            bp.font.color.rgb = TEXT_GRAY
            bp.font.name = "Arial"
            bp.space_after = Pt(10)

    # ==========================================
    # SLIDE 3: Current Workflow vs Proposed Workflow (Visual Diagram)
    # ==========================================
    s3 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s3, "เปรียบเทียบกระบวนการทำงานเดิม vs กระบวนการใหม่ (Workflow Comparison)")

    # Top: Existing Workflow (4 Steps)
    ew_title = s3.shapes.add_textbox(Inches(0.8), Inches(1.5), Inches(11.733), Inches(0.4))
    ew_tf = ew_title.text_frame
    ew_p = ew_tf.paragraphs[0]
    ew_p.text = "🔴 กระบวนการเดิม (EXISTING WORKFLOW) — ขาดการมองเห็นแบบทันที"
    ew_p.font.size = Pt(13)
    ew_p.font.bold = True
    ew_p.font.color.rgb = COLOR_RED

    steps_old = [
        ("01. Machine Breakdown", "เครื่องจักรหยุดทำงาน\nหยุดการผลิต"),
        ("02. Open SR in Maximo", "Production เปิดใบแจ้งซ่อม\nService Request ในระบบ"),
        ("03. Data Recorded", "ข้อมูลถูกบันทึกใน Maximo\nรอเปิดตรวจสอบ"),
        ("04. PM Check Maximo (?)", "PM ต้องเข้าไปเปิดดูเอง\nช่างอาจไม่ทราบทันที")
    ]
    for idx, (st, sd) in enumerate(steps_old):
        sx = Inches(0.8 + idx * 2.95)
        scard = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(1.95), Inches(2.75), Inches(1.6))
        scard.fill.solid()
        scard.fill.fore_color.rgb = CARD_DARK
        scard.line.color.rgb = COLOR_RED if idx == 3 else CARD_BORDER
        scard.line.width = Pt(1.5 if idx == 3 else 1)

        stb = s3.shapes.add_textbox(sx + Inches(0.15), Inches(2.05), Inches(2.45), Inches(1.4))
        stf = stb.text_frame
        stf.word_wrap = True
        sp1 = stf.paragraphs[0]
        sp1.text = st
        sp1.font.size = Pt(11)
        sp1.font.bold = True
        sp1.font.color.rgb = COLOR_RED if idx == 3 else TEXT_WHITE
        sp2 = stf.add_paragraph()
        sp2.text = sd
        sp2.font.size = Pt(10)
        sp2.font.color.rgb = TEXT_MUTED
        sp2.space_before = Pt(4)

    # Bottom: Proposed Workflow with Dashboard Alarm
    pw_title = s3.shapes.add_textbox(Inches(0.8), Inches(3.9), Inches(11.733), Inches(0.4))
    pw_tf = pw_title.text_frame
    pw_p = pw_tf.paragraphs[0]
    pw_p.text = "🟢 กระบวนการใหม่ที่เสนอ (PROPOSED WORKFLOW) — แจ้งเตือนขึ้นจอ TV Wall ทันที"
    pw_p.font.size = Pt(13)
    pw_p.font.bold = True
    pw_p.font.color.rgb = COLOR_GREEN

    steps_new = [
        ("01. Machine Breakdown", "เครื่องจักรขัดข้อง\nระบบตรวจจับทันที"),
        ("02. Maximo Data Link", "ข้อมูล SR ถูกเชื่อมโยงเข้าสู่\nDashboard Integration"),
        ("03. Real-Time Broadcast", "WebSocket กระจายสัญญาณ\nทันทีภายใน 1 วินาที"),
        ("04. TV Wall Alarm in PM Shop", "จอ TV ใน PM Shop สว่างแจ้งเตือน\nพร้อมตัวนับ Downtime สดทุกวินาที")
    ]
    for idx, (st, sd) in enumerate(steps_new):
        sx = Inches(0.8 + idx * 2.95)
        scard = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, sx, Inches(4.35), Inches(2.75), Inches(2.4))
        scard.fill.solid()
        scard.fill.fore_color.rgb = CARD_DARK
        scard.line.color.rgb = COLOR_GREEN if idx >= 2 else CARD_BORDER
        scard.line.width = Pt(1.5 if idx >= 2 else 1)

        # banner
        if idx >= 2:
            sban = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, sx, Inches(4.35), Inches(2.75), Inches(0.08))
            sban.fill.solid()
            sban.fill.fore_color.rgb = COLOR_GREEN
            sban.line.fill.background()

        stb = s3.shapes.add_textbox(sx + Inches(0.15), Inches(4.5), Inches(2.45), Inches(2.1))
        stf = stb.text_frame
        stf.word_wrap = True
        sp1 = stf.paragraphs[0]
        sp1.text = st
        sp1.font.size = Pt(11)
        sp1.font.bold = True
        sp1.font.color.rgb = COLOR_GREEN if idx >= 2 else TEXT_WHITE
        sp2 = stf.add_paragraph()
        sp2.text = sd
        sp2.font.size = Pt(10)
        sp2.font.color.rgb = TEXT_GRAY
        sp2.space_before = Pt(6)

        if idx == 3:
            sp3 = stf.add_paragraph()
            sp3.text = "★ ทีมช่างตอบสนองทันที\nลดเวลาจอดรอช่าง 100%"
            sp3.font.size = Pt(9.5)
            sp3.font.bold = True
            sp3.font.color.rgb = ISUZU_RED
            sp3.space_before = Pt(6)

    # ==========================================
    # SLIDE 4: Project Objectives (4 Pillars)
    # ==========================================
    s4 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s4, "วัตถุประสงค์หลักของโครงการ (Project Objectives)")

    objs = [
        ("01", "Better Visibility", "เพิ่มการมองเห็นสถานะชัดเจน", "แสดงสถานะ Machine Breakdown ให้ทีมช่างและหัวหน้างานมองเห็นได้อย่างชัดเจนและรวดเร็วที่สุด ผ่านโทนสีสถานะมาตรฐานสากล (แดง-เหลือง-เขียว)"),
        ("02", "Centralized Dashboard", "รวมศูนย์ข้อมูลในจอเดียว", "รวบรวมข้อมูลเหตุขัดข้อง ข้อมูลเครื่องจักร และหมายเลขใบแจ้งซ่อม (SR) จากระบบ Maximo ไว้ในหน้าจอ Dashboard เดียว ไม่ต้องเปิดหลายหน้าต่าง"),
        ("03", "Better Communication", "ยกระดับการประสานงาน", "สนับสนุนการสื่อสารข้อมูลระหว่างฝ่ายผลิต (Production) และฝ่ายซ่อมบำรุง (PM Shop) ให้มีข้อมูลชุดเดียวกันแบบเรียลไทม์ ลดความเข้าใจคลาดเคลื่อน"),
        ("04", "Accessible Display", "เข้าถึงได้ง่ายผ่านจอ TV หน้างาน", "แสดงผลผ่านจอโทรทัศน์ขนาดใหญ่ในพื้นที่ PM Shop และ Overhaul เพื่อให้ช่างซ่อมบำรุงและผู้เกี่ยวข้องเข้าถึงข้อมูลได้ทันทีตลอด 24 ชั่วโมง")
    ]
    for idx, (num, en, th, desc) in enumerate(objs):
        col = idx % 2
        row = idx // 2
        ox = Inches(0.8 + col * 5.95)
        oy = Inches(1.65 + row * 2.55)

        ocard = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox, oy, Inches(5.75), Inches(2.35))
        ocard.fill.solid()
        ocard.fill.fore_color.rgb = CARD_DARK
        ocard.line.color.rgb = CARD_BORDER
        ocard.line.width = Pt(1)

        # Number tag
        ntag = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ox + Inches(0.25), oy + Inches(0.25), Inches(0.8), Inches(0.45))
        ntag.fill.solid()
        ntag.fill.fore_color.rgb = ISUZU_RED
        ntag.line.fill.background()
        ntf = ntag.text_frame
        ntf.vertical_anchor = MSO_ANCHOR.MIDDLE
        np = ntf.paragraphs[0]
        np.alignment = PP_ALIGN.CENTER
        np.text = num
        np.font.size = Pt(14)
        np.font.bold = True
        np.font.color.rgb = TEXT_WHITE

        otb = s4.shapes.add_textbox(ox + Inches(1.2), oy + Inches(0.2), Inches(4.3), Inches(2.0))
        otf = otb.text_frame
        otf.word_wrap = True
        op1 = otf.paragraphs[0]
        op1.text = f"{en} ({th})"
        op1.font.size = Pt(14)
        op1.font.bold = True
        op1.font.color.rgb = TEXT_WHITE
        op1.font.name = "Arial"
        op1.space_after = Pt(6)

        op2 = otf.add_paragraph()
        op2.text = desc
        op2.font.size = Pt(11)
        op2.font.color.rgb = TEXT_GRAY
        op2.font.name = "Arial"

    # ==========================================
    # SLIDE 5: Preliminary Scope & TV Installation Areas
    # ==========================================
    s5 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s5, "ขอบเขตเบื้องต้นและจุดติดตั้ง TV Dashboard (Phase 1 Scope)")

    # 4 Proposed Locations
    loc_cards = [
        ("01. PM1 Shop", "PM1 AREA", "จุดติดตั้งจอ TV Dashboard", "สายการผลิตหลักแผนก PM1 ติดตั้งจอ TV Wall สำหรับมอนิเตอร์เครื่อง MC-001 ถึง MC-003"),
        ("02. PM1 Overhaul", "PM1 AREA", "จุดติดตั้งจอ TV Dashboard", "พื้นที่ซ่อมบำรุงใหญ่เครื่องจักร PM1 มอนิเตอร์เครื่อง MC-004 และ MC-005"),
        ("03. PM2 Shop", "PM2 AREA", "จุดติดตั้งจอ TV Dashboard", "สายการผลิตเครื่องยนต์ดีเซล PM2 ติดตั้งจอ TV มอนิเตอร์เครื่อง MC-006 ถึง MC-008"),
        ("04. PM2 Overhaul", "PM2 AREA", "จุดติดตั้งจอ TV Dashboard", "พื้นที่ปรับปรุงสภาพเครื่องยนต์ PM2 มอนิเตอร์เครื่อง MC-009 และ MC-010")
    ]
    for idx, (ltitle, larea, ltype, ldesc) in enumerate(loc_cards):
        lx = Inches(0.8 + idx * 2.95)
        ly = Inches(1.65)
        lcard = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, lx, ly, Inches(2.75), Inches(3.2))
        lcard.fill.solid()
        lcard.fill.fore_color.rgb = CARD_DARK
        lcard.line.color.rgb = ISUZU_RED if "Shop" in ltitle else CARD_BORDER
        lcard.line.width = Pt(1.5 if "Shop" in ltitle else 1)

        ltb = s5.shapes.add_textbox(lx + Inches(0.18), ly + Inches(0.2), Inches(2.39), Inches(2.8))
        ltf = ltb.text_frame
        ltf.word_wrap = True
        lp1 = ltf.paragraphs[0]
        lp1.text = larea
        lp1.font.size = Pt(10)
        lp1.font.bold = True
        lp1.font.color.rgb = ISUZU_RED
        lp1.font.name = "Arial"

        lp2 = ltf.add_paragraph()
        lp2.text = ltitle
        lp2.font.size = Pt(13)
        lp2.font.bold = True
        lp2.font.color.rgb = TEXT_WHITE
        lp2.font.name = "Arial"
        lp2.space_after = Pt(6)

        lp3 = ltf.add_paragraph()
        lp3.text = f"🖥 {ltype}\n\n{ldesc}"
        lp3.font.size = Pt(10.5)
        lp3.font.color.rgb = TEXT_GRAY
        lp3.font.name = "Arial"

    # Bottom Scope Notes (In Scope vs To Be Confirmed)
    bb1 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.05), Inches(5.75), Inches(1.8))
    bb1.fill.solid()
    bb1.fill.fore_color.rgb = CARD_DARK
    bb1.line.color.rgb = COLOR_GREEN
    bb1.line.width = Pt(1)
    b1_tb = s5.shapes.add_textbox(Inches(1.0), Inches(5.15), Inches(5.35), Inches(1.6))
    b1_tf = b1_tb.text_frame
    b1_tf.word_wrap = True
    bp1 = b1_tf.paragraphs[0]
    bp1.text = "✔ PROPOSED – อยู่ในขอบเขต Phase 1"
    bp1.font.size = Pt(12)
    bp1.font.bold = True
    bp1.font.color.rgb = COLOR_GREEN
    bp1.space_after = Pt(4)
    bp2 = b1_tf.add_paragraph()
    bp2.text = "• ติดตั้ง TV Dashboard 4 จุด: PM1 Shop, PM1 Overhaul, PM2 Shop, PM2 Overhaul\n• พัฒนาหน้าจอ React Dashboard แสดงสถานะ Machine Breakdown\n• เชื่อมต่ออุปกรณ์ Mini PC สำหรับรัน Dashboard เข้าสู่จอ TV หน้างาน"
    bp2.font.size = Pt(10.5)
    bp2.font.color.rgb = TEXT_GRAY

    bb2 = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(5.05), Inches(5.733), Inches(1.8))
    bb2.fill.solid()
    bb2.fill.fore_color.rgb = CARD_DARK
    bb2.line.color.rgb = COLOR_YELLOW
    bb2.line.width = Pt(1)
    b2_tb = s5.shapes.add_textbox(Inches(7.0), Inches(5.15), Inches(5.35), Inches(1.6))
    b2_tf = b2_tb.text_frame
    b2_tf.word_wrap = True
    b2p1 = b2_tf.paragraphs[0]
    b2p1.text = "⚠ TO BE CONFIRMED – รอการยืนยันกับโรงงาน"
    b2p1.font.size = Pt(12)
    b2p1.font.bold = True
    b2p1.font.color.rgb = COLOR_YELLOW
    b2p1.space_after = Pt(4)
    b2p2 = b2_tf.add_paragraph()
    b2p2.text = "• ยืนยันตำแหน่งติดตั้งจริงและขนาดจอ TV หน้างาน (55-65 นิ้ว)\n• รูปแบบการเชื่อมต่อข้อมูลกับ IBM Maximo (REST API หรือ Database Link)\n• รอบการอัปเดตข้อมูลและนโยบายความปลอดภัยของเครือข่ายโรงงาน"
    b2p2.font.size = Pt(10.5)
    b2p2.font.color.rgb = TEXT_GRAY

    # ==========================================
    # SLIDE 6: Proposed Hardware & Software Tools
    # ==========================================
    s6 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s6, "เครื่องมือและเทคโนโลยีที่นำเสนอ (Proposed Tools & Technology)")

    tools = [
        ("01", "IBM Maximo", "EXISTING SYSTEM", "แหล่งข้อมูลหลักของ Machine Breakdown และประวัติการซ่อม (ระบบที่ใช้งานอยู่แล้วในปัจจุบันของ Isuzu Engine)"),
        ("02", "React Dashboard", "PROPOSED TECHNOLOGY", "หน้าจอเว็บแอปพลิเคชันแบบ Real-Time สร้างด้วย React 18 + TypeScript + Tailwind CSS พร้อม Recharts สำหรับกราฟวิเคราะห์"),
        ("03", "Mini PC (Windows/Linux)", "PROPOSED HARDWARE", "คอมพิวเตอร์ขนาดเล็กสำหรับรัน Dashboard เชื่อมต่อจอ TV ผ่านพอร์ต HDMI ตลอด 24 ชม. ทนทานต่อสภาพแวดล้อมโรงงาน"),
        ("04", "TV Display (55\"-65\")", "PROPOSED DISPLAY", "จอโทรทัศน์ความละเอียดสูงติดตั้งประจำจุด PM Shop มองเห็นได้ชัดเจนจากระยะไกล ออกแบบ Dark Theme ไม่สะท้อนแสง")
    ]
    for idx, (num, name, ttype, desc) in enumerate(tools):
        tx = Inches(0.8 + idx * 2.95)
        ty = Inches(1.65)
        tcard = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx, ty, Inches(2.75), Inches(5.1))
        tcard.fill.solid()
        tcard.fill.fore_color.rgb = CARD_DARK
        tcard.line.color.rgb = CARD_BORDER
        tcard.line.width = Pt(1)

        # tag
        tag = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, tx + Inches(0.2), ty + Inches(0.2), Inches(0.65), Inches(0.4))
        tag.fill.solid()
        tag.fill.fore_color.rgb = ISUZU_RED if idx > 0 else COLOR_BLUE
        tag.line.fill.background()
        ttf = tag.text_frame
        ttf.vertical_anchor = MSO_ANCHOR.MIDDLE
        tp = ttf.paragraphs[0]
        tp.alignment = PP_ALIGN.CENTER
        tp.text = num
        tp.font.size = Pt(12)
        tp.font.bold = True
        tp.font.color.rgb = TEXT_WHITE

        ttb = s6.shapes.add_textbox(tx + Inches(0.2), ty + Inches(0.8), Inches(2.35), Inches(4.1))
        ttf2 = ttb.text_frame
        ttf2.word_wrap = True
        tp1 = ttf2.paragraphs[0]
        tp1.text = ttype
        tp1.font.size = Pt(10)
        tp1.font.bold = True
        tp1.font.color.rgb = ISUZU_RED if idx > 0 else COLOR_BLUE
        tp1.font.name = "Arial"

        tp2 = ttf2.add_paragraph()
        tp2.text = name
        tp2.font.size = Pt(14)
        tp2.font.bold = True
        tp2.font.color.rgb = TEXT_WHITE
        tp2.font.name = "Arial"
        tp2.space_after = Pt(10)

        tp3 = ttf2.add_paragraph()
        tp3.text = desc
        tp3.font.size = Pt(11)
        tp3.font.color.rgb = TEXT_GRAY
        tp3.font.name = "Arial"

    # ==========================================
    # SLIDE 7: High-Fidelity Dashboard Concept (Visual UI Mockup)
    # ==========================================
    s7 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s7, "การออกแบบหน้าจอแดชบอร์ดต้นแบบ (Dashboard UI Architecture & Mockup)")

    # Construct High-Fidelity UI Mockup inside slide!
    mock_frame = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(5.35))
    mock_frame.fill.solid()
    mock_frame.fill.fore_color.rgb = RGBColor(6, 11, 24)
    mock_frame.line.color.rgb = ISUZU_RED
    mock_frame.line.width = Pt(1.5)

    # Mock Header Bar
    mhb = s7.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.733), Inches(0.6))
    mhb.fill.solid()
    mhb.fill.fore_color.rgb = RGBColor(18, 24, 38)
    mhb.line.color.rgb = CARD_BORDER

    # Mock Title text in Header
    mhtb = s7.shapes.add_textbox(Inches(1.0), Inches(1.55), Inches(11.3), Inches(0.5))
    mtf = mhtb.text_frame
    mtf.word_wrap = True
    mp = mtf.paragraphs[0]
    mp.text = "ISUZU   |   MACHINE BREAKDOWN MONITOR   •   Quick Response | Less Downtime | Stable Production       14:32:10"
    mp.font.size = Pt(11)
    mp.font.bold = True
    mp.font.color.rgb = TEXT_WHITE
    mp.font.name = "Arial"

    # 4 Mock KPI Cards
    kpis = [
        ("MACHINE DOWN", "5", "Machines", COLOR_RED),
        ("IN REPAIR", "3", "Machines", COLOR_YELLOW),
        ("WAITING (STOP)", "2", "Machines", COLOR_BLUE),
        ("NORMAL", "42", "Machines", COLOR_GREEN)
    ]
    for kidx, (klabel, kval, ksub, kcol) in enumerate(kpis):
        kx = Inches(1.0 + kidx * 2.85)
        kbox = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, kx, Inches(2.2), Inches(2.7), Inches(0.95))
        kbox.fill.solid()
        kbox.fill.fore_color.rgb = CARD_DARK
        kbox.line.color.rgb = kcol
        kbox.line.width = Pt(1.5)

        ktb = s7.shapes.add_textbox(kx + Inches(0.1), Inches(2.25), Inches(2.5), Inches(0.85))
        ktf = ktb.text_frame
        kp1 = ktf.paragraphs[0]
        kp1.text = f"{klabel}: {kval} {ksub}"
        kp1.font.size = Pt(12)
        kp1.font.bold = True
        kp1.font.color.rgb = kcol

        kp2 = ktf.add_paragraph()
        kp2.text = "● Real-time dynamic count"
        kp2.font.size = Pt(9)
        kp2.font.color.rgb = TEXT_MUTED

    # Mock Active Breakdown Table Box
    tbl_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(3.25), Inches(7.5), Inches(3.45))
    tbl_box.fill.solid()
    tbl_box.fill.fore_color.rgb = CARD_DARK
    tbl_box.line.color.rgb = CARD_BORDER

    ttb = s7.shapes.add_textbox(Inches(1.15), Inches(3.35), Inches(7.2), Inches(3.25))
    ttf = ttb.text_frame
    ttf.word_wrap = True
    tp1 = ttf.paragraphs[0]
    tp1.text = "🚨 ACTIVE BREAKDOWN LIST (SR / WO)"
    tp1.font.size = Pt(12)
    tp1.font.bold = True
    tp1.font.color.rgb = COLOR_RED

    table_mock_rows = [
        "SR No.     Machine   Location      Downtime    Description",
        "----------------------------------------------------------------------",
        "SR-12541   MC-003    PM1 Shop      04:07:18    Spindle Motor Alarm",
        "SR-12548   MC-008    PM2 Shop      03:27:35    Hydraulic Pressure Low",
        "SR-12542   MC-004    PM1 Overhaul  02:17:33    Motor Overheat",
        "SR-12544   MC-001    PM1 Shop      01:27:18    Sensor NG / Stopped"
    ]
    for r in table_mock_rows:
        rp = ttf.add_paragraph()
        rp.text = r
        rp.font.size = Pt(10)
        rp.font.color.rgb = ACCENT_CYAN if "SR-" in r else TEXT_MUTED
        rp.font.name = "Courier New"
        rp.space_before = Pt(3)

    # Mock Chart & Highlights on the Right
    rt_box = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(8.65), Inches(3.25), Inches(3.68), Inches(3.45))
    rt_box.fill.solid()
    rt_box.fill.fore_color.rgb = CARD_DARK
    rt_box.line.color.rgb = CARD_BORDER

    rtb = s7.shapes.add_textbox(Inches(8.8), Inches(3.35), Inches(3.38), Inches(3.25))
    rtf = rtb.text_frame
    rtf.word_wrap = True
    rp1 = rtf.paragraphs[0]
    rp1.text = "📊 DOWNTIME ANALYTICS"
    rp1.font.size = Pt(12)
    rp1.font.bold = True
    rp1.font.color.rgb = TEXT_WHITE

    rp2 = rtf.add_paragraph()
    rp2.text = "• Top 5 Breakdowns by duration\n• Status Distribution (Normal vs BD)\n• Status by Location (PM1/PM2)\n• 1-Second live ticking counter"
    rp2.font.size = Pt(10.5)
    rp2.font.color.rgb = TEXT_GRAY
    rp2.space_before = Pt(8)

    rp3 = rtf.add_paragraph()
    rp3.text = "\n📢 MESSAGE NOTICE:\nPlease respond to machine breakdown immediately to minimize downtime.\n— PM Department"
    rp3.font.size = Pt(10)
    rp3.font.color.rgb = COLOR_YELLOW
    rp3.space_before = Pt(8)

    # ==========================================
    # SLIDE 8: Proposed System Architecture (Phase 1 vs Future Maximo)
    # ==========================================
    s8 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s8, "สถาปัตยกรรมระบบการเชื่อมต่อข้อมูล (System Architecture)")

    arch_cols = [
        ("EXISTING (ระบบปัจจุบัน)", [
            "01. Machine Breakdown เกิดขึ้นที่สายการผลิต",
            "02. Production ทำการเปิดใบแจ้งซ่อม (SR) ในระบบ",
            "03. IBM Maximo Database บันทึกข้อมูลและจัดเก็บเป็นฐานข้อมูลหลัก (Single Source of Truth)"
        ], COLOR_BLUE),
        ("INTEGRATION (ส่วนเชื่อมโยง)", [
            "04. Data Access / Integration Layer (FastAPI)",
            "• Phase 1 (Demo): ดึงข้อมูลจำลองและบันทึกลง SQLite Database พร้อมทำ Continuous Simulation",
            "• Phase 2 (Production): เชื่อมต่อ Maximo REST API / Integration Framework (MIF)"
        ], COLOR_YELLOW),
        ("PROPOSED DASHBOARD (หน้างาน)", [
            "05. React Dashboard (Web Application)",
            "06. Mini PC ประมวลผลและเปิดแอปพลิเคชัน",
            "07. TV Display 55\"-65\" ณ จุด PM Shop และ Overhaul แสดงผลแบบเรียลไทม์ 24 ชม."
        ], COLOR_GREEN)
    ]
    for idx, (atitle, abullets, acol) in enumerate(arch_cols):
        ax = Inches(0.8 + idx * 4.0)
        ay = Inches(1.65)
        acard = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, ax, ay, Inches(3.733), Inches(5.1))
        acard.fill.solid()
        acard.fill.fore_color.rgb = CARD_DARK
        acard.line.color.rgb = acol
        acard.line.width = Pt(1)

        aban = s8.shapes.add_shape(MSO_SHAPE.RECTANGLE, ax, ay, Inches(3.733), Inches(0.12))
        aban.fill.solid()
        aban.fill.fore_color.rgb = acol
        aban.line.fill.background()

        atb = s8.shapes.add_textbox(ax + Inches(0.2), ay + Inches(0.25), Inches(3.333), Inches(4.5))
        atf = atb.text_frame
        atf.word_wrap = True
        ap1 = atf.paragraphs[0]
        ap1.text = atitle
        ap1.font.size = Pt(13.5)
        ap1.font.bold = True
        ap1.font.color.rgb = acol
        ap1.font.name = "Arial"
        ap1.space_after = Pt(14)

        for b in abullets:
            bp = atf.add_paragraph()
            bp.text = b
            bp.font.size = Pt(11)
            bp.font.color.rgb = TEXT_GRAY
            bp.font.name = "Arial"
            bp.space_after = Pt(10)

    # ==========================================
    # SLIDE 9: Project Timeline / Gantt Chart
    # ==========================================
    s9 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s9, "แผนการดำเนินงานโครงการ (Project Timeline / Gantt Chart)")

    # Gantt Visual Table Card
    gt_card = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(11.733), Inches(5.1))
    gt_card.fill.solid()
    gt_card.fill.fore_color.rgb = CARD_DARK
    gt_card.line.color.rgb = CARD_BORDER
    gt_card.line.width = Pt(1)

    gt_tb = s9.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(11.2), Inches(4.6))
    gt_tf = gt_tb.text_frame
    gt_tf.word_wrap = True
    gp1 = gt_tf.paragraphs[0]
    gp1.text = "DASHBOARD ALARM | MASTER TIMELINE (PHASE 1 & PHASE 2)"
    gp1.font.size = Pt(15)
    gp1.font.bold = True
    gp1.font.color.rgb = ISUZU_RED
    gp1.font.name = "Arial"
    gp1.space_after = Pt(12)

    gantt_tasks = [
        ("PHASE 1: การศึกษา ออกแบบ และพัฒนาระบบต้นแบบ (1/1/2027 - 2/14/2027)", "ระยะเวลา 1.5 เดือน", COLOR_BLUE),
        ("   • ศึกษาและประชุม Requirement กับ User (5 ม.ค. - 20 ม.ค. 2027)", "ทำความเข้าใจความต้องการและ Flow ข้อมูล Maximo", TEXT_GRAY),
        ("   • Design สรุปปัญหา และแก้ไข พัฒนาระบบต้นแบบ (21 ม.ค. - 26 มี.ค. 2027)", "พัฒนา React + FastAPI + WebSocket Dashboard", TEXT_GRAY),
        ("   • UAT (User Acceptance Testing) (29 มี.ค. - 2 เม.ย. 2027)", "ทดสอบการใช้งานร่วมกับเจ้าหน้าที่ PM Shop", TEXT_GRAY),
        ("PHASE 2: จัดซื้ออุปกรณ์ ติดตั้งหน้างาน และเชื่อมต่อระบบจริง (2/15/2027 - 5/14/2027)", "ระยะเวลา 3 เดือน", COLOR_GREEN),
        ("   • สั่งซื้อ Hardware (TV 55-65\", Mini PC, ตัวยึดผนัง) (5 เม.ย. - 4 พ.ค. 2027)", "จัดเตรียมอุปกรณ์สำหรับติดตั้ง 4 จุดหน้างาน", TEXT_GRAY),
        ("   • ติดตั้งหน้างาน และ Go-Live เชื่อมต่อ Maximo จริง (10 พ.ค. - 14 พ.ค. 2027)", "เปิดใช้งานอย่างเป็นทางการใน PM1 และ PM2", TEXT_GRAY)
    ]
    for ttitle, tdetail, tcol in gantt_tasks:
        tp = gt_tf.add_paragraph()
        tp.text = ttitle
        tp.font.size = Pt(11.5 if "PHASE" in ttitle else 10.5)
        tp.font.bold = True if "PHASE" in ttitle else False
        tp.font.color.rgb = tcol
        tp.font.name = "Arial"

        tp2 = gt_tf.add_paragraph()
        tp2.text = f"     ➜ {tdetail}"
        tp2.font.size = Pt(9.5)
        tp2.font.color.rgb = TEXT_MUTED
        tp2.font.name = "Arial"
        tp2.space_after = Pt(4)

    # ==========================================
    # SLIDE 10: Expected Benefits & Conclusion
    # ==========================================
    s10 = prs.slides.add_slide(blank_layout)
    add_header_and_footer(s10, "ประโยชน์ที่คาดว่าจะได้รับและสรุป (Expected Benefits & Conclusion)")

    # Left: 5 Expected Benefits
    eb_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.65), Inches(5.75), Inches(5.1))
    eb_card.fill.solid()
    eb_card.fill.fore_color.rgb = CARD_DARK
    eb_card.line.color.rgb = CARD_BORDER
    eb_card.line.width = Pt(1)

    eb_tb = s10.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(5.25), Inches(4.6))
    eb_tf = eb_tb.text_frame
    eb_tf.word_wrap = True
    ep1 = eb_tf.paragraphs[0]
    ep1.text = "ประโยชน์ที่คาดว่าจะได้รับ (EXPECTED BENEFITS)"
    ep1.font.size = Pt(15)
    ep1.font.bold = True
    ep1.font.color.rgb = COLOR_GREEN
    ep1.font.name = "Arial"
    ep1.space_after = Pt(10)

    benefits = [
        "1. ช่วยให้เห็นสถานะ Machine Breakdown ชัดเจนขึ้นทันที",
        "2. เข้าถึงข้อมูล Breakdown ที่เกี่ยวข้องได้อย่างรวดเร็ว ไม่ต้องรอเปิดคอมฯ",
        "3. สนับสนุนการแบ่งปันข้อมูลและสื่อสารระหว่างฝ่ายผลิตกับฝ่ายซ่อมบำรุง",
        "4. แสดงข้อมูล Breakdown แบบรวมศูนย์ (Centralized) ผ่านจอ TV หน้างาน",
        "5. มีศักยภาพสนับสนุนการติดตามงานซ่อม (Maintenance Follow-up) และลด Downtime ได้อย่างเป็นรูปธรรม"
    ]
    for b in benefits:
        bp = eb_tf.add_paragraph()
        bp.text = f"✔ {b}"
        bp.font.size = Pt(11)
        bp.font.color.rgb = TEXT_GRAY
        bp.font.name = "Arial"
        bp.space_after = Pt(8)

    # Right: Conclusion & Next Steps
    cb_card = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.65), Inches(5.733), Inches(5.1))
    cb_card.fill.solid()
    cb_card.fill.fore_color.rgb = CARD_DARK
    cb_card.line.color.rgb = CARD_BORDER
    cb_card.line.width = Pt(1)

    cb_tb = s10.shapes.add_textbox(Inches(7.05), Inches(1.85), Inches(5.2), Inches(4.6))
    cb_tf = cb_tb.text_frame
    cb_tf.word_wrap = True
    cp1 = cb_tf.paragraphs[0]
    cp1.text = "บทสรุปและขั้นตอนถัดไป (CONCLUSION & NEXT STEPS)"
    cp1.font.size = Pt(15)
    cp1.font.bold = True
    cp1.font.color.rgb = ISUZU_RED
    cp1.font.name = "Arial"
    cp1.space_after = Pt(10)

    concl_items = [
        ("บทสรุป (Conclusion)", "ข้อมูล Machine Breakdown มีอยู่ในระบบ Maximo อยู่แล้ว โครงการนี้นำเสนอแนวทางนำข้อมูลมาแสดงผลผ่าน Dashboard ที่หน้างานเพื่อให้มองเห็นได้ง่ายขึ้น จึงคุ้มค่าที่จะศึกษาและพัฒนาต่อยอด"),
        ("ขั้นตอนถัดไป (Next Steps)", "• ยืนยัน Requirement เชิงลึกกับผู้ใช้งาน (User Confirmation)\n• ยืนยันวิธีเชื่อมต่อข้อมูลกับ IBM Maximo (Integration Method - TBC)\n• ขอความเห็นชอบจากผู้บริหารและบริษัท (Subject to company approval)")
    ]
    for ch, cd in concl_items:
        cp = cb_tf.add_paragraph()
        cp.text = ch
        cp.font.size = Pt(12)
        cp.font.bold = True
        cp.font.color.rgb = TEXT_WHITE
        cp.font.name = "Arial"

        cpd = cb_tf.add_paragraph()
        cpd.text = cd
        cpd.font.size = Pt(10.5)
        cpd.font.color.rgb = TEXT_GRAY
        cpd.font.name = "Arial"
        cpd.space_after = Pt(8)

    output_path = os.path.abspath('Dashboard_Alarm_BD_Isuzu_Presentation.pptx')
    prs.save(output_path)
    print(f"Presentation updated successfully to: {output_path}")

if __name__ == '__main__':
    create_isuzu_presentation_v2()
