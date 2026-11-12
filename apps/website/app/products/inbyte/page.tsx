import type { Metadata } from 'next';
import React from 'react';
import InBytePageClient from '../../../components/inbyte/InBytePageClient';

export const metadata: Metadata = {
  title: 'Innbites — Smart Restaurant QR Ordering & Operations Platform | ORBYT',
  description:
    'Turn every table into a smart ordering experience. Let customers scan, explore digital menus, customize orders, and pay directly from their phones with innbites.',
};

export default function InByteProductPage() {
  return <InBytePageClient />;
}
