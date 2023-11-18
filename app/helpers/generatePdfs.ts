import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export const printHocruxPdf = (
  secrets: string[],
  publicAddress: string,
  accountGenerationDate: Date,
  total: number,
  numberToRetrieve: number
) => {
  // Default export is a4 paper, portrait, using millimeters for units
  return secrets.map((secret, index) => {
    const doc = new jsPDF()
    doc.text(`Shared secret ${index} of ${total}`, 10, 20)
    doc.text(`Account generated at: ${format(accountGenerationDate, 'hh:mm dd.mm.yyyy')}`, 10, 30)
    doc.text(`Public address of the account: ${publicAddress}`, 10, 40, { maxWidth: 150 })
    doc.text(`Number of parts required for reconstruction : ${numberToRetrieve}`, 10, 60)
    doc.text(`Total number of generated parts : ${total}`, 10, 70)
    doc.text('The secret', 10, 80)
    doc.text(secret, 10, 90, { maxWidth: 185 })
    return doc
  })
}
