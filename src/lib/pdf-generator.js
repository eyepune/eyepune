import { jsPDF } from "jspdf";
import "jspdf-autotable";
import fs from "fs";
import path from "path";
import sharp from "sharp";

/**
 * EyE PunE Premium Strategy PDF Generator
 * Elite Corporate Consulting Style (Minimalist, White Background, Red Accents)
 */
export async function generateStrategyPDF(data) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const { name, business, score, report } = data;
    const brandColor = [239, 68, 68];   // #ef4444 Crimson Red
    const darkGray = [40, 40, 40];      // Corporate Dark Gray
    const lightBg = [255, 255, 255];    // Crisp White
    const bodyText = [70, 70, 70];      // Soft Charcoal for readability

    // Pre-process Logo: Load SVG and convert to PNG base64 using sharp
    let logoBase64 = null;
    try {
        const svgPath = path.join(process.cwd(), "public", "logo.svg");
        const svgBuffer = fs.readFileSync(svgPath);
        // Convert to high-res PNG
        const pngBuffer = await sharp(svgBuffer).resize(300).png().toBuffer();
        logoBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    } catch (err) {
        console.warn("Could not load/convert logo.svg for PDF:", err.message);
    }

    // HELPER: Draw Exact EyE PunE Corporate Logo using the PNG
    function drawLogo(x, y, size = 1, align = "left") {
        const scale = size * 0.10; // Slightly smaller to match text height
        const iconWidth = 100 * scale; // 10mm for size=1
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18 * size);
        
        const text1 = "EyE";
        const text2 = "PunE";
        const textW1 = doc.getTextWidth(text1);
        const textW2 = doc.getTextWidth(text2);
        
        const gap = 2.5 * size;
        const totalWidth = iconWidth + gap + textW1 + textW2;
        
        let startX = x;
        if (align === "center") {
            startX = x - (totalWidth / 2);
        } else if (align === "right") {
            startX = x - totalWidth;
        }

        const crimson = [220, 20, 60];

        // The user mentioned the logo goes up too high.
        // We will lower iconY further so the icon perfectly visually aligns with the text center.
        const iconY = y - (6.4 * size); 

        // Draw the precise PNG Logo
        if (logoBase64) {
            doc.addImage(logoBase64, "PNG", startX, iconY, iconWidth, iconWidth);
        }

        // Draw Perfectly Aligned Text
        doc.setTextColor(...darkGray);
        doc.text(text1, startX + iconWidth + gap, y);
        doc.setTextColor(...crimson);
        doc.text(text2, startX + iconWidth + gap + textW1, y);

        // Add Tagline Underneath the Text Block
        doc.setFont("helvetica", "bold");
        doc.setFontSize(6 * size); // Small corporate tagline size
        
        const p1 = "CONNECT · ";
        const p2 = "ENGAGE";
        const p3 = " · GROW";
        
        const tagW1 = doc.getTextWidth(p1);
        const tagW2 = doc.getTextWidth(p2);
        const tagW3 = doc.getTextWidth(p3);
        const totalTagWidth = tagW1 + tagW2 + tagW3;
        
        // Center the tagline perfectly under the text "EyEPunE" ONLY
        const textStartX = startX + iconWidth + gap;
        const totalTextWidth = textW1 + textW2;
        const tagX = textStartX + (totalTextWidth / 2) - (totalTagWidth / 2);
        const tagY = y + (4.5 * size); // Place it slightly below the main text baseline
        
        // Draw the colored tagline
        doc.setTextColor(120, 120, 120); // Professional medium-gray
        doc.text(p1, tagX, tagY);
        
        doc.setTextColor(...crimson); // Red for ENGAGE
        doc.text(p2, tagX + tagW1, tagY);
        
        doc.setTextColor(120, 120, 120); // Professional medium-gray
        doc.text(p3, tagX + tagW1 + tagW2, tagY);
    }

    // --- PAGE 1: ELITE COVER PAGE ---
    doc.setFillColor(...lightBg);
    doc.rect(0, 0, 210, 297, "F");

    // Thick Red Left Margin Accent
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 15, 297, "F");

    // Draw Logo
    drawLogo(25, 30, 1.2);

    // Title Block
    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(38);
    doc.text("STRATEGIC", 25, 90);
    doc.text("GROWTH", 25, 105);
    doc.text("BLUEPRINT.", 25, 120);

    // Decorative Line
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(1.5);
    doc.line(25, 135, 60, 135);

    // Subtitle & Client Info
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(150, 150, 150);
    doc.text("PREPARED EXCLUSIVELY FOR", 25, 155);
    
    doc.setFontSize(18);
    doc.setTextColor(...darkGray);
    doc.text(`${name.toUpperCase()}`, 25, 165);
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...bodyText);
    doc.text(`${business || "Confidential Project"}`, 25, 173);

    // Date & Version
    const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`CONFIDENTIAL  |  ${dateStr}`, 25, 255);
    
    // Exact Tagline & Footer info
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("CONNECT · ENGAGE · GROW", 25, 263);
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Pune-based all-in-one growth partner serving clients across the globe.", 25, 270);


    // --- PAGE 2: MAIN STRATEGIC ROADMAP CONTENT ---
    doc.addPage();
    doc.setFillColor(...lightBg);
    doc.rect(0, 0, 210, 297, "F");

    let y = 45; 
    const leftMargin = 25;
    const rightMargin = 25;
    const printableWidth = 160;

    let inBoldMode = false;

    function drawFormattedText(textLine, xPos, yPos, baseStyle = "normal") {
        const segments = textLine.split("**");
        let currentX = xPos;

        segments.forEach((segment, index) => {
            if (!segment) {
                if (index < segments.length - 1) inBoldMode = !inBoldMode;
                return;
            }
            let activeStyle = inBoldMode ? "bold" : baseStyle;
            doc.setFont("helvetica", activeStyle);
            doc.text(segment, currentX, yPos);
            currentX += doc.getTextWidth(segment);
            if (index < segments.length - 1) inBoldMode = !inBoldMode;
        });
    }

    function ensureSpace(heightNeeded) {
        if (y + heightNeeded > 260) {
            doc.addPage();
            doc.setFillColor(...lightBg);
            doc.rect(0, 0, 210, 297, "F");
            y = 45;
        }
    }

    const mdLines = (report || "").split("\n");

    mdLines.forEach((rawLine) => {
        const trimmed = rawLine.trim();
        if (!trimmed) {
            y += 4;
            return;
        }

        if (trimmed.startsWith("---") || trimmed.startsWith("***")) {
            ensureSpace(8);
            y += 2;
            doc.setDrawColor(230, 230, 230);
            doc.setLineWidth(0.3);
            doc.line(leftMargin, y, 210 - rightMargin, y);
            y += 8;
            return;
        }

        if (trimmed.startsWith("# ")) {
            const headingText = trimmed.replace(/^#\s+/, "");
            ensureSpace(20);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(22);
            doc.setTextColor(...darkGray);
            doc.text(headingText, leftMargin, y);
            y += 8;
            return;
        }

        if (trimmed.startsWith("## ")) {
            const headingText = trimmed.replace(/^##\s+/, "");
            ensureSpace(16);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(16);
            doc.setTextColor(...brandColor);
            doc.text(headingText, leftMargin, y);
            y += 6;
            return;
        }

        if (trimmed.startsWith("### ")) {
            const headingText = trimmed.replace(/^###\s+/, "");
            ensureSpace(12);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(12);
            doc.setTextColor(...darkGray);
            doc.text(headingText, leftMargin, y);
            y += 5;
            return;
        }

        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            const itemContent = trimmed.replace(/^[\*\-\•]\s+/, "");
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            const wrappedLines = doc.splitTextToSize(itemContent, printableWidth - 8);

            ensureSpace(wrappedLines.length * 6 + 3);
            y += 2;

            wrappedLines.forEach((line, lineIndex) => {
                if (lineIndex === 0) {
                    doc.setFillColor(...brandColor);
                    doc.rect(leftMargin + 1, y - 2.5, 1.5, 1.5, "F");
                }
                doc.setTextColor(...bodyText);
                drawFormattedText(line, leftMargin + 6, y, "normal");
                y += 5.5;
            });
            return;
        }

        if (/^\d+\.\s+/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+\.)\s+/);
            const numPrefix = numMatch ? numMatch[1] : "1.";
            const itemContent = trimmed.replace(/^\d+\.\s+/, "");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10.5);
            const wrappedLines = doc.splitTextToSize(itemContent, printableWidth - 8);

            ensureSpace(wrappedLines.length * 6 + 3);
            y += 2;

            wrappedLines.forEach((line, lineIndex) => {
                if (lineIndex === 0) {
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...brandColor);
                    doc.text(numPrefix, leftMargin, y);
                }
                doc.setTextColor(...bodyText);
                drawFormattedText(line, leftMargin + 6, y, "normal");
                y += 5.5;
            });
            return;
        }

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10.5);
        const wrappedLines = doc.splitTextToSize(trimmed, printableWidth);

        ensureSpace(wrappedLines.length * 6 + 3);
        y += 1;

        wrappedLines.forEach((line) => {
            doc.setTextColor(...bodyText);
            drawFormattedText(line, leftMargin, y, "normal");
            y += 5.5;
        });
        y += 3; 
    });


    // --- PAGE 3: RECOMMENDATIONS TABLE ---
    ensureSpace(60);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(...darkGray);
    doc.text("Strategic Action Plan", leftMargin, y);
    y += 8;

    const recData = [
        ["Phase 1 (0-30 Days)", "Audit & Tracking Foundation Calibration", "High"],
        ["Phase 2 (30-90 Days)", "AI CRM & Content Engine Activation", "Medium-High"],
        ["Phase 3 (90+ Days)", "Autonomous Multi-Channel Scaling", "Massive"]
    ];

    doc.autoTable({
        startY: y,
        head: [["Timeline", "Key Integration Focus", "ROI Impact"]],
        body: recData,
        theme: "plain",
        headStyles: { 
            fillColor: [245, 245, 245], 
            textColor: darkGray, 
            fontStyle: "bold",
            fontSize: 10,
            lineWidth: { bottom: 0.5 },
            lineColor: brandColor
        },
        styles: { 
            fontSize: 9.5, 
            cellPadding: 6,
            textColor: bodyText,
            lineWidth: { bottom: 0.1 },
            lineColor: [230, 230, 230]
        },
        margin: { left: leftMargin, right: rightMargin }
    });


    // --- PAGE 4: CLEAN CALL-TO-ACTION PAGE ---
    doc.addPage();
    doc.setFillColor(...lightBg);
    doc.rect(0, 0, 210, 297, "F");

    drawLogo(105, 80, 1.8, "center"); // Perfectly centered logo

    doc.setTextColor(...darkGray);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("IMPLEMENTATION.", 105, 110, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...bodyText);
    const ctaText = "This blueprint is your competitive advantage. Our engineering team is ready to build these proprietary AI workflows into your business to drive autonomous revenue.";
    const ctaLines = doc.splitTextToSize(ctaText, 140);
    doc.text(ctaLines, 105, 125, { align: "center" });

    // Elegant button outline
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(0.8);
    doc.roundedRect(65, 150, 80, 14, 2, 2, "D");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...brandColor);
    doc.text("SCHEDULE STRATEGY CALL", 105, 159, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("www.eyepune.com  |  connect@eyepune.com  |  +91 9284712033", 105, 175, { align: "center" });


    // --- POST-PASS RUNNING HEADERS/FOOTERS ---
    const totalPages = doc.getNumberOfPages();
    
    for (let i = 2; i < totalPages; i++) {
        doc.setPage(i);

        // Header Line
        doc.setDrawColor(...brandColor);
        doc.setLineWidth(0.5);
        doc.line(leftMargin, 20, 210 - rightMargin, 20);

        // Header Text
        drawLogo(leftMargin, 16, 0.6); // Mini logo top left
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(180, 180, 180);
        doc.text("STRATEGIC ROADMAP", 210 - rightMargin, 17, { align: "right" });

        // Footer Text
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(150, 150, 150);
        doc.text("© EyE PunE  |  www.eyepune.com  |  +91 9284712033", leftMargin, 282);
        
        doc.setFont("helvetica", "bold");
        doc.text(`${i}`, 210 - rightMargin, 282, { align: "right" });
    }

    return doc.output("arraybuffer");
}
