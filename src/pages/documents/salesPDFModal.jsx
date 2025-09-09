import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react'
import React from 'react'
import SalesOrderPDFTemplate from './pdfTemplate'
import { PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer'

const SalesPDFModal = ({ res, openModal, setOpenModal }) => {
  return (
    <Modal show={openModal} onClose={() => setOpenModal(false)}>
      <ModalHeader>Sales Order PDF</ModalHeader>
      <ModalBody>
        {res && (<PDFViewer height={800} id="salesOrderPDF" showToolbar={false} style={{ width: "100%" }} >
          <SalesOrderPDFTemplate data={res} />
        </PDFViewer>)}
      </ModalBody>

      <ModalFooter>
        <Button onClick={() => setOpenModal(false)}>Close</Button>

        {res && <PDFDownloadLink document={<SalesOrderPDFTemplate data={res} />} fileName={res.order.reference_number}>
          {() =>
            <Button>Download PDF</Button>
          }
        </PDFDownloadLink>}

        {res && <BlobProvider document={<SalesOrderPDFTemplate data={res} />} fileName={res.order.reference_number}>
          {() =>
            <Button onClick={() => {
              const iframe = document.getElementById("salesOrderPDF")
              const iframeWindow = iframe.contentWindow || iframe
              iframeWindow.print()
            }}>Print PDF</Button>
          }
        </BlobProvider>}
      </ModalFooter>
    </Modal>
  )
}

export default SalesPDFModal;
