// src/module/payment/vnpay.helper.ts
//
// File này KHÔNG phụ thuộc NestJS (chỉ dùng crypto + qs thuần) -> dễ unit test riêng,
// không cần khởi tạo cả app NestJS để test logic tạo URL/verify checksum.

import * as crypto from 'crypto';
import * as qs from 'qs';

/**
 * VNPay yêu cầu sort các param theo alphabet TRƯỚC KHI build query string
 * để tính chữ ký -> sai thứ tự sẽ ra checksum sai (rất dễ debug nhầm chỗ này).
 */
function sortObject(obj) {
  let sorted = {};
  let keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, '+');
  });
  return sorted;
}

export interface CreateVnpayUrlParams {
  vnpTmnCode: string;
  vnpHashSecret: string;
  vnpUrl: string;
  vnpReturnUrl: string;
  txnRef: string; // mã giao dịch unique
  amount: number; // đơn vị VND, CHƯA x100
  orderInfo: string;
  ipAddr: string;
  locale?: 'vn' | 'en';
}

export function createVnpayPaymentUrl(params: CreateVnpayUrlParams): string {
  const createDate = formatVnpayDate(new Date());

  let vnpParams: Record<string, string | number> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: params.vnpTmnCode,
    vnp_Locale: params.locale ?? 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef: params.txnRef,
    vnp_OrderInfo: params.orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: params.amount * 100, // VNPay luôn yêu cầu x100
    vnp_ReturnUrl: params.vnpReturnUrl,
    vnp_IpAddr: params.ipAddr,
    vnp_CreateDate: createDate,
  };

  vnpParams = sortObject(vnpParams);

  const signData = qs.stringify(vnpParams, { encode: false });

  // Tài liệu chính thức VNPay quy định checksum dùng HMAC-SHA512,
  // không phải SHA256 thuần dù dropdown cấu hình ghi "Kiểu mã hóa: SHA256/MD5"
  // (đó là field vnp_SecureHashType, chỉ mang tính mô tả, không phải thuật toán thật)
  const hmac = crypto.createHmac('sha512', params.vnpHashSecret);
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  vnpParams['vnp_SecureHash'] = signed;

  return params.vnpUrl + '?' + qs.stringify(vnpParams, { encode: false });
}

export interface VerifyIpnParams {
  vnpHashSecret: string;
  query: Record<string, string>;
}

export function verifyVnpayChecksum(params: VerifyIpnParams): { isValid: boolean } {
  const { query, vnpHashSecret } = params;
  const secureHash = query['vnp_SecureHash'];

  // QUAN TRỌNG: phải loại 2 field này ra trước khi tính lại hash để so sánh
  const dataToVerify: Record<string, string> = { ...query };
  delete dataToVerify['vnp_SecureHash'];
  delete dataToVerify['vnp_SecureHashType'];

  const sortedParams = sortObject(dataToVerify);
  const signData = qs.stringify(sortedParams, { encode: false });

  const hmac = crypto.createHmac('sha512', vnpHashSecret);
  const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

  return { isValid: secureHash === checkSum };
}

function formatVnpayDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}