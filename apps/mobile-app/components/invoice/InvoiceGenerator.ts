import { numberToWords } from '../../utils/numberToWords';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export interface InvoiceItem {
  description: string;
  hsnSacCode: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuedAt: string;
  status: string;
  companyName: string;
  companyAddress: string;
  companyGstin: string;
  companyPan: string;
  companyCin: string;
  companyEmail: string;
  companyPhone: string;
  companyBankName: string;
  companyBankAccount: string;
  companyBankIfsc: string;
  companyUpiId: string;
  subscriberName: string;
  subscriberAddress: string;
  placeOfSupply: string;
  items: InvoiceItem[];
  baseAmount: number;
  discountAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number;
  totalAmount: number;
  paymentMethod?: string;
  transactionId?: string;
  paymentStatus?: string;
  gatewayName?: string;
}

export const generateInvoicePDF = async (data: InvoiceData) => {
  const itemsHtml = data.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.description}</td>
      <td>${item.hsnSacCode}</td>
      <td>${item.quantity}</td>
      <td>₹${item.unitPrice.toFixed(2)}</td>
      <td>${item.taxRate}%</td>
      <td>₹${item.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Tax Invoice - ${data.invoiceNumber}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          line-height: 1.4;
          margin: 0;
          padding: 20px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .company-details h1 {
          margin: 0 0 5px 0;
          font-size: 24px;
        }
        .company-details p {
          margin: 2px 0;
          font-size: 12px;
        }
        .invoice-title h2 {
          margin: 0 0 5px 0;
          font-size: 28px;
          text-align: right;
          text-transform: uppercase;
        }
        .invoice-title p {
          margin: 2px 0;
          font-size: 12px;
          text-align: right;
        }
        .billing-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .billing-section > div {
          width: 48%;
        }
        .billing-section h3 {
          margin: 0 0 10px 0;
          font-size: 14px;
          border-bottom: 1px solid #ccc;
          padding-bottom: 5px;
        }
        .billing-section p {
          margin: 2px 0;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .totals-section {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .totals-table {
          width: 50%;
        }
        .totals-table td {
          text-align: right;
        }
        .totals-table .bold td {
          font-weight: bold;
          border-top: 2px solid #333;
        }
        .amount-words {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 20px;
        }
        .footer-details {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 40px;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        .bank-details p, .auth-sign p {
          margin: 2px 0;
        }
        .auth-sign {
          text-align: right;
        }
        .signature-line {
          margin-top: 40px;
          border-top: 1px solid #333;
          display: inline-block;
          width: 150px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-details">
          <h1>${data.companyName}</h1>
          <p>${data.companyAddress}</p>
          <p><strong>GSTIN:</strong> ${data.companyGstin}</p>
          <p><strong>PAN:</strong> ${data.companyPan}</p>
          <p><strong>CIN:</strong> ${data.companyCin}</p>
          <p><strong>Email:</strong> ${data.companyEmail}</p>
          <p><strong>Phone:</strong> ${data.companyPhone}</p>
        </div>
        <div class="invoice-title">
          <h2>TAX INVOICE</h2>
          <p><strong>Invoice No:</strong> ${data.invoiceNumber}</p>
          <p><strong>Date:</strong> ${new Date(data.issuedAt).toLocaleDateString('en-IN')}</p>
          <p><strong>Status:</strong> ${data.status}</p>
        </div>
      </div>

      <div class="billing-section">
        <div class="billed-to">
          <h3>Billed To</h3>
          <p><strong>${data.subscriberName}</strong></p>
          <p>${data.subscriberAddress}</p>
        </div>
        <div class="supply-details">
          <h3>Supply Details</h3>
          <p><strong>Place of Supply:</strong> ${data.placeOfSupply}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Description of Services</th>
            <th>HSN/SAC</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div class="totals-section">
        <table class="totals-table">
          <tr>
            <td>Base Amount</td>
            <td>₹${data.baseAmount.toFixed(2)}</td>
          </tr>
          ${data.discountAmount > 0 ? `
          <tr>
            <td>Discount</td>
            <td>-₹${data.discountAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${data.cgstAmount > 0 ? `
          <tr>
            <td>CGST</td>
            <td>₹${data.cgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td>SGST</td>
            <td>₹${data.sgstAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${data.igstAmount > 0 ? `
          <tr>
            <td>IGST</td>
            <td>₹${data.igstAmount.toFixed(2)}</td>
          </tr>
          ` : ''}
          <tr class="bold">
            <td>Grand Total</td>
            <td>₹${data.totalAmount.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <div class="amount-words">
        Total Amount (in words): ${numberToWords(Math.round(data.totalAmount))} Rupees Only
      </div>

      <div class="footer-details">
        <div class="bank-details">
          ${data.transactionId ? `
            <p><strong>Payment Details</strong></p>
            <p>Mode: ${data.paymentMethod || 'Online'}</p>
            ${data.gatewayName ? `<p>Gateway: ${data.gatewayName}</p>` : ''}
            <p>Transaction ID: ${data.transactionId}</p>
            <p>Status: ${(data.paymentStatus || 'SUCCESS').toUpperCase()}</p>
          ` : `
            <p><strong>Bank Details</strong></p>
            <p>Bank Name: ${data.companyBankName}</p>
            <p>Account No: ${data.companyBankAccount}</p>
            <p>IFSC: ${data.companyBankIfsc}</p>
            <p>UPI ID: ${data.companyUpiId}</p>
          `}
        </div>
        <div class="auth-sign">
          <p>For ${data.companyName}</p>
          <div class="signature-line"></div>
          <p>Authorised Signatory</p>
        </div>
      </div>
      
      <p style="text-align: center; font-size: 10px; margin-top: 20px; color: #777;">This is a computer generated invoice and does not require a physical signature.</p>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });
    
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Invoice',
      UTI: 'com.adobe.pdf'
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
