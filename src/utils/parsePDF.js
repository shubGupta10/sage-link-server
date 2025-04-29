import PDFParser from "pdf2json"

export async function parsePDF(buffer){
    const pdfParser = new PDFParser(null, true)
  
    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent()
        resolve(text)
      })
  
      pdfParser.on("pdfParser_dataError", (errMsg) => reject(errMsg.parserError))
  
      pdfParser.parseBuffer(buffer)
    })
  }