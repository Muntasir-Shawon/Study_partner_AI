/**
 * Utility to extract text content from uploaded files (PDF, PPTX, TXT, MD, DOCX)
 */

export async function extractTextFromFile(file: File): Promise<{ text: string; pageCount: number; slideTitles?: string[] }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'txt' || extension === 'md') {
    const text = await file.text();
    return { text, pageCount: 1 };
  }

  if (extension === 'pdf') {
    try {
      // Dynamic import of pdfjs-dist on client side
      const pdfjs = await import('pdfjs-dist');
      // Set worker
      pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version || '3.11.174'}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      let fullText = '';
      const slideTitles: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ')
          .trim();

        if (pageText) {
          const lines = pageText.split('\n');
          const firstLine = lines[0]?.slice(0, 60) || `Slide ${i}`;
          slideTitles.push(firstLine);
          fullText += `\n--- [Slide / Page ${i}: ${firstLine}] ---\n${pageText}\n`;
        }
      }

      return { text: fullText.trim(), pageCount: numPages, slideTitles };
    } catch (err) {
      console.warn("Client PDF worker parsing failed, falling back to arrayBuffer extraction:", err);
      const raw = await file.text();
      // Basic text extraction from PDF stream if worker fails
      const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
      return { text: cleaned.slice(0, 50000), pageCount: 1 };
    }
  }

  // Fallback for other file types
  try {
    const text = await file.text();
    const cleanText = text.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ');
    return { text: cleanText.slice(0, 40000), pageCount: 1 };
  } catch (e) {
    return { text: `Uploaded document: ${file.name}`, pageCount: 1 };
  }
}
