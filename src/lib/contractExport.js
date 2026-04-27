// src/lib/contractExport.js
//
// Captura o componente <ContractPreview> renderizado (DOM) e gera um PDF
// preservando as cores do diff (cinza/azul/amarelo/laranja).
//
// Estratégia:
//   1) html2canvas captura o nó como imagem em alta resolução
//   2) jsPDF recebe a imagem e quebra em páginas A4
//
// Esta função é chamada pelo botão "Gerar Contrato" no header.

export async function exportContractAsPdf(elementId = "contract-preview") {
  const node = document.getElementById(elementId);
  if (!node) {
    alert("Elemento do contrato não encontrado. Renderize o preview antes de exportar.");
    return;
  }

  // Imports dinâmicos (mantém bundle inicial pequeno)
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  // Captura em escala 2x para qualidade
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.95);

  // PDF A4 portrait
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
    orientation: "portrait"
  });

  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  // Calcula altura proporcional da imagem para a largura da página
  const imgW = pageW;
  const imgH = (canvas.height * imgW) / canvas.width;

  let heightLeft = imgH;
  let position = 0;

  pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
  heightLeft -= pageH;

  while (heightLeft > 0) {
    position = heightLeft - imgH;
    pdf.addPage();
    pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
    heightLeft -= pageH;
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  pdf.save(`contrato-cit-camilla-${stamp}.pdf`);
}
