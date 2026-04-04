(() => {
  function formatSafeTitle(value, fallback) {
    if (!value) return fallback;
    return value.toString().trim();
  }

  function normalizeDocType(value) {
    if (!value) return 'word';
    const normalized = value.toString().toLowerCase();
    if (normalized.includes('ppt') || normalized.includes('power')) return 'powerpoint';
    if (normalized.includes('xls') || normalized.includes('excel')) return 'excel';
    return 'word';
  }

  async function generateWordBlob(data = {}) {
    const docxLib = window.docx;
    if (!docxLib) throw new Error('La librería docx no está cargada.');

    const {
      Document,
      Packer,
      Paragraph,
      TextRun,
      HeadingLevel,
      AlignmentType,
      Header,
      Footer,
      PageNumber
    } = docxLib;

    const children = [];

    children.push(
      new Paragraph({
        text: formatSafeTitle(data.title, 'DevCenterX Documento'),
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 }
      })
    );

    if (data.subtitle) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          children: [
            new TextRun({
              text: data.subtitle,
              color: '64748B',
              italics: true,
              size: 28
            })
          ]
        })
      );
    }

    const sections = Array.isArray(data.sections) ? data.sections : [];
    sections.forEach((section) => {
      if (!section) return;
      children.push(
        new Paragraph({
          text: section.heading || 'Sección',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          border: {
            bottom: { color: '3B82F6', space: 1, style: 'single', size: 12 }
          }
        })
      );

      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 300, line: 360 },
          children: [
            new TextRun({
              text: section.content || '',
              size: 24,
              font: 'Calibri',
              color: '334155'
            })
          ]
        })
      );
    });

    const doc = new Document({
      styles: {
        paragraphStyles: [
          {
            id: 'Title',
            name: 'Title',
            basedOn: 'Normal',
            next: 'Normal',
            run: { color: '1E3A8A', size: 64, bold: true, font: 'Arial' }
          },
          {
            id: 'Heading1',
            name: 'Heading 1',
            basedOn: 'Normal',
            next: 'Normal',
            run: { color: '0F172A', size: 32, bold: true, font: 'Arial' }
          }
        ]
      },
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: 'Generado por ', color: '94A3B8', size: 20 }),
                    new TextRun({
                      text: 'DevCenterX Agent',
                      color: '3B82F6',
                      bold: true,
                      size: 20
                    })
                  ]
                })
              ]
            })
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: 'Página ', color: '94A3B8', size: 20 }),
                    new TextRun({ children: [PageNumber.CURRENT], color: '94A3B8', size: 20 }),
                    new TextRun({ text: ' de ', color: '94A3B8', size: 20 }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], color: '94A3B8', size: 20 })
                  ]
                })
              ]
            })
          },
          children
        }
      ]
    });

    return Packer.toBlob(doc);
  }

  async function generatePptxBlob(data = {}) {
    const PptxGenJS = window.PptxGenJS;
    if (!PptxGenJS) throw new Error('La librería PptxGenJS no está disponible.');

    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_16x9';

    pptx.defineSlideMaster({
      title: 'TEMA_CORP',
      background: { color: 'F8FAFC' },
      objects: [
        { rect: { x: 0, y: 0, w: '100%', h: 0.05, fill: { color: '1D4ED8' } } },
        { rect: { x: 0.5, y: 1.1, w: '90%', h: 0.02, fill: { color: 'E2E8F0' } } },
        {
          text: {
            text: 'DevCenterX Enterprise',
            options: { x: 0.5, y: '94%', w: 3, h: 0.3, color: '94A3B8', fontSize: 9 }
          }
        }
      ],
      slideNumber: { x: '95%', y: '94%', color: '64748B', fontSize: 10, bold: true }
    });

    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: '0B132B' };
    titleSlide.transition = { type: 'fade', speed: 'medium' };
    titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.1, fill: { color: '3B82F6' } });
    titleSlide.addShape(pptx.ShapeType.rect, { x: 0, y: '96%', w: '100%', h: 0.2, fill: { color: '3B82F6' } });
    titleSlide.addText('DEVCENTERX AGENT', {
      x: 0.5,
      y: 0.5,
      w: 3,
      h: 0.5,
      color: '475569',
      fontSize: 10,
      bold: true,
      charSpacing: 2
    });
    titleSlide.addText(formatSafeTitle(data.title, 'Presentación Ejecutiva'), {
      x: 0.5,
      y: '35%',
      w: '90%',
      h: 1.5,
      fontSize: 54,
      bold: true,
      color: 'FFFFFF',
      align: 'left'
    });
    if (data.subtitle) {
      titleSlide.addText(data.subtitle, {
        x: 0.5,
        y: '55%',
        w: '90%',
        h: 1,
        fontSize: 24,
        color: '94A3B8',
        align: 'left'
      });
    }

    const slides = Array.isArray(data.slides) ? data.slides : [];
    if (slides.length === 0) {
      slides.push({ title: 'Resumen', bullets: [data.summary || 'Resumen automático DevCenterX Agent.'] });
    }

    slides.forEach((slideData) => {
      const slide = pptx.addSlide({ masterName: 'TEMA_CORP' });
      slide.transition = { type: 'cover', direction: 'left', speed: 'fast' };
      slide.addText(slideData.title || 'Slide DevCenterX', {
        x: 0.5,
        y: 0.3,
        w: '90%',
        h: 0.8,
        fontSize: 32,
        bold: true,
        color: '0F172A'
      });
      if (Array.isArray(slideData.bullets) && slideData.bullets.length > 0) {
        const bulletText = slideData.bullets.map((text) => ({
          text: text || '',
          options: { bullet: { color: '3B82F6' } }
        }));
        slide.addText(bulletText, {
          x: 0.5,
          y: 1.4,
          w: '90%',
          h: 3.8,
          fontSize: 20,
          color: '334155',
          valign: 'top',
          margin: 10,
          lineSpacing: 32
        });
      }
    });

    const closingSlide = pptx.addSlide();
    closingSlide.background = { color: '0B132B' };
    closingSlide.transition = { type: 'fade', speed: 'medium' };
    closingSlide.addText('Gracias por su atención', {
      x: 0.5,
      y: '40%',
      w: '90%',
      h: 1,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });
    closingSlide.addText('Generado por DevCenterX Agent', {
      x: 0.5,
      y: '55%',
      w: '90%',
      h: 0.5,
      fontSize: 18,
      color: '94A3B8',
      align: 'center'
    });

    return pptx.write('blob');
  }

  async function generateExcelBlob(data = {}) {
    const ExcelJS = window.ExcelJS;
    if (!ExcelJS) throw new Error('La librería ExcelJS no está cargada.');

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'DevCenterX Agent';
    const worksheet = workbook.addWorksheet('Datos DevCenterX');

    const columns = Array.isArray(data.columns) ? data.columns : [];
    const rows = Array.isArray(data.rows) ? data.rows : [];
    if (columns.length === 0 || rows.length === 0) {
      throw new Error('Los datos de Excel están incompletos.');
    }

    const headerRow = worksheet.addRow(columns);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A8A' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    rows.forEach((row, index) => {
      const newRow = worksheet.addRow(row);
      const isEven = index % 2 === 0;
      newRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: isEven ? 'FFF8FAFC' : 'FFE2E8F0' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          left: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          right: { style: 'thin', color: { argb: 'FFCBD5E1' } }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
      });
    });

    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const length = cell.value ? cell.value.toString().length : 10;
        if (length > maxLength) maxLength = length;
      });
      column.width = maxLength < 15 ? 15 : maxLength + 5;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  function downloadBlob(blob, filename) {
    if (!blob || !filename) return;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  window.DevCenterXDocGenerator = {
    generateWordBlob,
    generatePptxBlob,
    generateExcelBlob,
    downloadBlob,
    normalizeDocType
  };
})();
