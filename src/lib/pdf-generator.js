import { jsPDF } from "jspdf";
import "jspdf-autotable";

/**
 * EyE PunE Premium Strategy PDF Generator
 * Generates a high-end, authority-building PDF document for leads.
 */
export async function generateStrategyPDF(data) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const { name, business, score, report, answers } = data;
    const brandColor = [239, 68, 68]; // #ef4444
    const darkColor = [10, 10, 10]; // #0a0a0a

    // --- PAGE 1: COVER PAGE ---
    // Background
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 297, "F");

    // Decorative Red Accent
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 15, "F");

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.text("STRATEGIC", 20, 80);
    doc.text("TRANSFORMATION", 20, 95);
    doc.text("ROADMAP", 20, 110);

    // Subtitle
    doc.setFontSize(18);
    doc.setTextColor(...brandColor);
    doc.text("PREPARED EXCLUSIVELY FOR", 20, 130);
    
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text(`${name.toUpperCase()}`, 20, 145);
    doc.setFontSize(14);
    doc.text(`${business || "Personal Project"}`, 20, 155);

    // Score Circle
    doc.setDrawColor(...brandColor);
    doc.setLineWidth(1);
    doc.circle(105, 220, 30, "D");
    
    doc.setFontSize(12);
    doc.setTextColor(200, 200, 200);
    doc.text("GROWTH MATURITY SCORE", 105, 205, { align: "center" });
    
    doc.setFontSize(48);
    doc.setTextColor(255, 255, 255);
    doc.text(`${score}`, 105, 225, { align: "center" });
    
    doc.setFontSize(14);
    doc.text("/ 100", 105, 235, { align: "center" });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("© 2026 EyE PunE | Elite AI Automation Agency", 105, 280, { align: "center" });
    doc.text("PUNE, MAHARASHTRA", 105, 285, { align: "center" });

    // --- PAGE 2: EXECUTIVE OVERVIEW ---
    doc.addPage();
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, "F");

    // Header Stripe
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 10, "F");

    doc.setTextColor(...darkColor);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Executive Summary", 20, 30);

    // AI Analysis Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);

    // Formatting the report content (handling markdown-like headers)
    const lines = doc.splitTextToSize(report.replace(/#/g, ""), 170);
    
    let y = 45;
    lines.forEach((line, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        // Simple heuristic for headers in the report
        if (line.length < 50 && (line.includes(":") || line.toUpperCase() === line)) {
            doc.setFont("helvetica", "bold");
            doc.setTextColor(...brandColor);
            doc.text(line, 20, y);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(60, 60, 60);
        } else {
            doc.text(line, 20, y);
        }
        y += 6;
    });

    // --- PAGE 3: RECOMMENDATIONS ---
    doc.addPage();
    doc.setTextColor(...darkColor);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Immediate Recommendations", 20, 30);

    const recData = [
        ["Phase", "Strategic Action", "Potential ROI"],
        ["0-30 Days", "CRM & Lead Pipeline Calibration", "High"],
        ["30-90 Days", "AI Content Engine Activation", "Medium-High"],
        ["90+ Days", "Autonomous Growth Scale", "Massive"]
    ];

    doc.autoTable({
        startY: 45,
        head: [recData[0]],
        body: recData.slice(1),
        theme: "striped",
        headStyles: { fillColor: brandColor },
        margin: { left: 20, right: 20 }
    });

    // Final CTA Page
    doc.addPage();
    doc.setFillColor(...darkColor);
    doc.rect(0, 0, 210, 297, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("READY TO IMPLEMENT?", 105, 80, { align: "center" });
    
    doc.setFontSize(14);
    doc.setTextColor(150, 150, 150);
    const ctaText = "This roadmap is just the beginning. Our engineers can turn these recommendations into an autonomous revenue engine for your business.";
    const ctaLines = doc.splitTextToSize(ctaText, 140);
    doc.text(ctaLines, 105, 100, { align: "center" });

    doc.setDrawColor(...brandColor);
    doc.setFillColor(...brandColor);
    doc.roundedRect(60, 130, 90, 15, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text("BOOK IMPLEMENTATION CALL", 105, 139, { align: "center" });

    doc.setFontSize(10);
    doc.text("eyepune.com/Booking", 105, 155, { align: "center" });

    return doc.output("arraybuffer");
}
