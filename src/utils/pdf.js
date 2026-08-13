import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const downloadPDF = async () => {
  const input = document.getElementById("resume-template");

  if (!input) {
    console.error("Resume template element not found.");
    return;
  }

  try {
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging:false,
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth =
      pdf.internal.pageSize.getWidth();

    const pdfPageHeight =
      pdf.internal.pageSize.getHeight();

    const pdfHeight =
      (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(
      imgData,
      "PNG",
      0,
      position,
      pdfWidth,
      pdfHeight
    );

    heightLeft -= pdfPageHeight;

    while (heightLeft > 0) {
      position = heightLeft - pdfHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        0,
        position,
        pdfWidth,
        pdfHeight
      );

      heightLeft -= pdfPageHeight;
    }

    pdf.save("StudentAI_Resume.pdf");
  } catch (error) {
    console.error("PDF download error:", error);
  }
};  