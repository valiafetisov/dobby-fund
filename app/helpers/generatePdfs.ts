import { jsPDF } from 'jspdf'

const printPdf = () => {
  // Default export is a4 paper, portrait, using millimeters for units
  const doc = new jsPDF()

  doc.text('Hello world!', 10, 10)
  doc.save('a4.pdf')

  // @ts-expect-error ts doesn't know fetch return type
  const url = useObjectUrl(data.value)
  if (!url.value) {
    // notification.error({ title: 'Dateien konnten nicht geladen werden', description: 'Download-URL invalide', duration: 5000 })
    // isLoading.value = false
    return
  }

  // 2. Construct hidden element to trigger click + open for end-user
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.href = url.value
  a.target = '_blank'

  // 3. Trigger open for end-user
  a.click()

  // 4. Cleanup: revoke url & remove the hidden element
  window.URL.revokeObjectURL(`${url.value}.pdf`)
  a.remove()

  // isLoading.value = false
}
