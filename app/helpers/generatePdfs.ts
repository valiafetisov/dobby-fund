import { jsPDF } from 'jspdf'
import { format } from 'date-fns'

export const printHocruxPdf = (
  secrets: string[],
  publicAddress: string,
  accountGenerationDate: Date,
  total: number,
  numberToRetrieve: number
) => {
  return secrets.map((secret, index) => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.setFont('Helvetica', 'bold')
    doc.text(`Shared secret ${index + 1} of ${total}`, 10, 20)
    doc.setFont('Helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(`The account was created at: ${format(accountGenerationDate, 'hh:mm dd.mm.yyyy')}`, 10, 30)
    doc.text(`Public address of the account: ${publicAddress}`, 10, 40, { maxWidth: 150 })
    doc.text(`Number of shared secrets required for reconstruction: ${numberToRetrieve}`, 10, 60)
    doc.text(`Total number of generated shared secrets: ${total}`, 10, 70)
    doc.text('The secret:', 10, 80)
    doc.text(secret, 10, 90, { maxWidth: 185 })
    return doc
  })
}

export const printCertificatePdf = (
  publicAddress: string,
  depositedAmount: number,
  totalParts: number,
  numberToRetrieve: number,
  accountGenerationDate: Date
) => {
  const doc = new jsPDF()
  doc.setFontSize(16)
  doc.setFont('Helvetica', 'bold')
  doc.text('Your Dobby Fund', 10, 20)

  doc.setFontSize(20)
  doc.text(`${depositedAmount} sDAI`, 10, 35)

  doc.setFont('Helvetica', 'normal')
  doc.setFontSize(14)
  doc.text(`Public address of the account: ${publicAddress}`, 10, 50, { maxWidth: 150 })
  doc.text(`The account was created at: ${format(accountGenerationDate, 'hh:mm dd.mm.yyyy')}`, 10, 65)
  doc.text(`Number of shared secrets required for reconstruction: ${numberToRetrieve}`, 10, 75)
  doc.text(`Total number of generated shared secrets: ${totalParts}`, 10, 85)
  return doc
}
