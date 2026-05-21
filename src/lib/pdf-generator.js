import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * EyE PunE Premium Strategy PDF Generator
 * Generates an ultra-premium, authority-building PDF document matching corporate brand guidelines.
 */
export async function generateStrategyPDF(data) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const { name, business, score, report, answers } = data;
    const brandColor = [239, 68, 68];   // #ef4444 Crimson Red
    const accentColor = [249, 115, 22]; // #f97316 Warm Orange
    const darkColor = [10, 10, 10];     // #0a0a0a Pitch Black
    const lightBg = [255, 255, 255];    // White Content Area
    const bodyTextColor = [60, 60, 60];  // Deep Charcoal

    // --- PAGE 1: STUNNING DARK COVER PAGE ---
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 297, "F");

    // Decorative Red Accent Header Stripe
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 12, "F");

    // Glowing background element (simulated using light opacity red lines/shapes)
    doc.setDrawColor(239, 68, 68, 0.15);
    doc.setLineWidth(0.5);
    doc.line(10, 60, 200, 60);
    doc.line(10, 250, 200, 250);

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("STRATEGIC", 20, 80);
    doc.text("TRANSFORMATION", 20, 94);
    doc.text("ROADMAP", 20, 108);

    // Subtitle
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("PREPARED EXCLUSIVELY FOR", 20, 126);
    
    doc.setFontSize(26);
    doc.setTextColor(255, 255, 255);
    doc.text(`${name.toUpperCase()}`, 20, 142);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(`${business || "Personal Project"}`, 20, 152);

    // Score Circle Badge
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(1.5);
    doc.setFillColor(20, 20, 20);
    doc.circle(105, 212, 28, "FD");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(160, 160, 160);
    doc.text("GROWTH MATURITY SCORE", 105, 196, { align: "center" });
    
    doc.setFontSize(44);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}`, 105, 216, { align: "center" });
    
    doc.setFontSize(11);
    doc.setTextColor(...brandColor);
    doc.text("OUT OF 100", 105, 226, { align: "center" });

    // Footer on Cover
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text("© 2026 EyE PunE  |  Elite AI Automation & Digital Growth Partner", 105, 275, { align: "center" });
    doc.text("PUNE, MAHARASHTRA  ·  SERVING GLOBALLY", 105, 281, { align: "center" });


    // --- PAGE 2: MAIN STRATEGIC ROADMAP CONTENT ---
    doc.addPage();
    doc.setFillColor(...lightBg);
    doc.rect(0, 0, 210, 297, "F");

    let y = 35; // Content starts at y = 35 (below header line)
    const leftMargin = 20;
    const rightMargin = 20;
    const printableWidth = 170;

    // State machine for formatting inline bolding
    let inBoldMode = false;

    // Helper to format inline bolding on a single line
    function drawFormattedText(textLine, xPos, yPos, baseStyle = "normal") {
        const segments = textLine.split("**");
        let currentX = xPos;

        segments.forEach((segment, index) => {
            if (!segment) {
                // If it's empty, we just toggle bold and continue
                if (index < segments.length - 1) {
                    inBoldMode = !inBoldMode;
                }
                return;
            }

            // Determine active font style
            let activeStyle = baseStyle;
            if (inBoldMode) {
                activeStyle = "bold";
            }

            doc.setFont("helvetica", activeStyle);
            doc.text(segment, currentX, yPos);
            currentX += doc.getTextWidth(segment);

            // Toggle bold mode if there is a next segment
            if (index < segments.length - 1) {
                inBoldMode = !inBoldMode;
            }
        });
    }

    // Helper to safety-check page spacing
    function ensureSpace(heightNeeded) {
        if (y + heightNeeded > 265) {
            doc.addPage();
            doc.setFillColor(...lightBg);
            doc.rect(0, 0, 210, 297, "F");
            y = 35;
        }
    }

    // Parse the Markdown report content line by line
    const mdLines = report.split("\n");

    mdLines.forEach((rawLine) => {
        const trimmed = rawLine.trim();
        if (!trimmed) {
            // Empty line translates to some vertical whitespace
            y += 4;
            return;
        }

        // 1. Horizontal Rule (e.g. ---)
        if (trimmed.startsWith("---") || trimmed.startsWith("***")) {
            ensureSpace(8);
            y += 2;
            doc.setDrawColor(220, 220, 220);
            doc.setLineWidth(0.3);
            doc.line(leftMargin, y, 210 - rightMargin, y);
            y += 6;
            return;
        }

        // 2. H1 Header (e.g. # Header)
        if (trimmed.startsWith("# ")) {
            const headingText = trimmed.replace(/^#\s+/, "");
            ensureSpace(18);
            y += 6;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(...brandColor);
            doc.text(headingText, leftMargin, y);
            
            // Underline accent for H1
            y += 2;
            doc.setFillColor(...brandColor);
            doc.rect(leftMargin, y, 30, 1.2, "F");
            y += 8;
            return;
        }

        // 3. H2 Header (e.g. ## Header)
        if (trimmed.startsWith("## ")) {
            const headingText = trimmed.replace(/^##\s+/, "");
            ensureSpace(14);
            y += 5;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(14);
            doc.setTextColor(...brandColor);
            doc.text(headingText, leftMargin, y);
            y += 7;
            return;
        }

        // 4. H3 Header (e.g. ### Header)
        if (trimmed.startsWith("### ")) {
            const headingText = trimmed.replace(/^###\s+/, "");
            ensureSpace(12);
            y += 4;
            doc.setFont("helvetica", "bold");
            doc.setFontSize(11.5);
            doc.setTextColor(...darkColor);
            doc.text(headingText, leftMargin, y);
            y += 6;
            return;
        }

        // 5. Bullet List Item (e.g. * Item or - Item)
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
            const itemContent = trimmed.replace(/^[\*\-\•]\s+/, "");
            
            // Split and wrap the text assuming an indent width of 163 (170 - 7)
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const wrappedLines = doc.splitTextToSize(itemContent, 163);

            ensureSpace(wrappedLines.length * 5 + 3);
            y += 2;

            wrappedLines.forEach((line, lineIndex) => {
                if (lineIndex === 0) {
                    // Draw a premium red square bullet point
                    doc.setFillColor(...brandColor);
                    doc.rect(leftMargin + 2, y - 2.8, 1.8, 1.8, "F");
                }
                
                // Print with inline bolding at x = 27
                doc.setTextColor(...bodyTextColor);
                drawFormattedText(line, leftMargin + 7, y, "normal");
                y += 5;
            });
            return;
        }

        // 6. Numbered List Item (e.g. 1. Item)
        if (/^\d+\.\s+/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+\.)\s+/);
            const numPrefix = numMatch ? numMatch[1] : "1.";
            const itemContent = trimmed.replace(/^\d+\.\s+/, "");

            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            const wrappedLines = doc.splitTextToSize(itemContent, 163);

            ensureSpace(wrappedLines.length * 5 + 3);
            y += 2;

            wrappedLines.forEach((line, lineIndex) => {
                if (lineIndex === 0) {
                    // Draw the list number
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(...brandColor);
                    doc.text(numPrefix, leftMargin + 1, y);
                }
                
                // Print content with inline bolding
                doc.setTextColor(...bodyTextColor);
                drawFormattedText(line, leftMargin + 7, y, "normal");
                y += 5;
            });
            return;
        }

        // 7. Regular Body Paragraph
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const wrappedLines = doc.splitTextToSize(trimmed, printableWidth);

        ensureSpace(wrappedLines.length * 5 + 3);
        y += 1;

        wrappedLines.forEach((line) => {
            doc.setTextColor(...bodyTextColor);
            drawFormattedText(line, leftMargin, y, "normal");
            y += 5;
        });
        y += 2; // Extra paragraph spacing
    });


    // --- PAGE 3: RECOMMENDATIONS TABLE ---
    ensureSpace(60);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...brandColor);
    doc.text("Immediate Recommendations Overview", leftMargin, y);
    y += 6;

    const recData = [
        ["0-30 Days", "CRM & Lead Pipeline Calibration", "High"],
        ["30-90 Days", "AI Content Engine Activation", "Medium-High"],
        ["90+ Days", "Autonomous Growth Scale", "Massive"]
    ];

    doc.autoTable({
        startY: y,
        head: [["Implementation Phase", "Strategic Actions & Integrations", "Potential ROI Impact"]],
        body: recData,
        theme: "striped",
        headStyles: { 
            fillColor: brandColor, 
            textColor: [255, 255, 255], 
            fontStyle: "bold",
            fontSize: 9.5
        },
        styles: { 
            fontSize: 9, 
            cellPadding: 4.5,
            textColor: [40, 40, 40]
        },
        margin: { left: leftMargin, right: rightMargin }
    });

    y = doc.lastAutoTable.finalY + 12;


    // --- PAGE 4: PREMIUM DARK CALL-TO-ACTION PAGE ---
    doc.addPage();
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 297, "F");

    // Bottom glow accent
    doc.setFillColor(259, 115, 22, 0.05); // light orange glow
    doc.circle(105, 240, 80, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(30);
    doc.text("READY TO SCALE?", 105, 75, { align: "center" });

    // Decorative thin red separator
    doc.setFillColor(...brandColor);
    doc.rect(85, 87, 40, 1.5, "F");
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    doc.setTextColor(170, 170, 170);
    const ctaText = "This roadmap is just the foundation. Our growth engineers can implement these custom integrations, CRM systems, and AI workflows to turn your plan into a fully autonomous, 24/7 revenue engine.";
    const ctaLines = doc.splitTextToSize(ctaText, 140);
    doc.text(ctaLines, 105, 102, { align: "center" });

    // Premium Rounded CTA Button
    doc.setFillColor(...brandColor);
    doc.roundedRect(45, 145, 120, 18, 9, 9, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13.5);
    doc.setTextColor(255, 255, 255);
    doc.text("BOOK FREE STRATEGY CALL NOW", 105, 156.5, { align: "center" });

    // Contact Coordinates
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(150, 150, 150);
    doc.text("Secure your session: eyepune.com/Booking", 105, 175, { align: "center" });
    doc.text("Or reach our founders directly at connect@eyepune.com", 105, 182, { align: "center" });

    // --- POST-PASS DECORATIVE LAYOUT PASS ---
    // Apply running headers and footers to all middle pages (exclude Cover and back CTA page)
    const totalPages = doc.getNumberOfPages();
    
    for (let i = 2; i < totalPages; i++) {
        doc.setPage(i);

        // 1. RUNNING HEADER
        // Top Red Accent line
        doc.setFillColor(...brandColor);
        doc.rect(0, 0, 210, 6, "F");

        // Logo/Brand text
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(140, 140, 140);
        doc.text("EyE PunE  |  Growth Transformation Strategy", leftMargin, 16);

        // Small decorative date
        doc.text("CONFIDENTIAL", 210 - rightMargin, 16, { align: "right" });

        // Thin divider line
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.25);
        doc.line(leftMargin, 19, 210 - rightMargin, 19);

        // 2. RUNNING FOOTER
        // Thin divider line
        doc.line(leftMargin, 274, 210 - rightMargin, 274);

        // Copyright info
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("© 2026 EyE PunE  ·  Digital Strategy & Consulting", leftMargin, 281);

        // Center contact
        doc.text("+91 9284712033  ·  eyepune.com", 105, 281, { align: "center" });

        // Dynamic page numbering
        doc.text(`Page ${i} of ${totalPages}`, 210 - rightMargin, 281, { align: "right" });
    }

    return doc.output("arraybuffer");
}
