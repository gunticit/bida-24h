export const printInvoice = (invoiceContent: string) => {
  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(invoiceContent)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }
}
