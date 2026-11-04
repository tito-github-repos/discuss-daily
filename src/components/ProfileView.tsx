'use client';

import {
  Box,
  Chip,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

type PaymentRow = {
  id: number;
  amount: number; // paise
  paidAt: string | null;
  paymentId: string | null;
  orderId: string;
};

type Props = {
  name: string;
  email: string;
  mobile: string;
  registeredOn: string;
  payments: PaymentRow[];
};

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
      })
    : '—';

const cardSx = {
  bgcolor: 'var(--white)',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
  boxShadow: '0 10px 30px rgba(22, 163, 74, 0.08)',
  p: { xs: 2.5, md: 3.5 },
};

const headCellSx = {
  fontWeight: 700,
  bgcolor: 'var(--primary-light)',
  whiteSpace: 'nowrap',
};

export default function ProfileView({ name, email, mobile, registeredOn, payments }: Props) {
  return (
    <Box
      component="main"
      sx={{
        background: 'linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)',
        minHeight: 'calc(100vh - 72px)',
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography component="h1" sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' }, fontWeight: 700 }}>
          My{' '}
          <Box component="span" sx={{ color: 'var(--primary)' }}>
            Profile
          </Box>
        </Typography>
        <Typography sx={{ mt: 0.5, color: 'text.secondary' }}>
          Your account details and payment history.
        </Typography>

        {/* Your details */}
        <Box sx={{ ...cardSx, mt: 4 }}>
          <Typography component="h2" sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>
            Your details
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
              gap: 2.5,
            }}
          >
            <Info label="Name" value={name} />
            <Info label="Email" value={email} />
            <Info label="Mobile" value={`+91 ${mobile}`} />
            <Info label="Registered on" value={formatDate(registeredOn)} />
          </Box>
        </Box>

        {/* Payment history */}
        <Box sx={{ ...cardSx, mt: 3 }}>
          <Typography component="h2" sx={{ fontSize: '1.2rem', fontWeight: 700, mb: 2 }}>
            Payment history
          </Typography>

          {payments.length === 0 ? (
            <Typography sx={{ color: 'text.secondary' }}>No payments yet.</Typography>
          ) : (
            <TableContainer sx={{  borderColor: 'divider' }}>
              <Table size="small" sx={{ minWidth: 620 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={headCellSx}>S.No</TableCell>
                    <TableCell sx={headCellSx}>Date</TableCell>
                    <TableCell sx={headCellSx}>Description</TableCell>
                    <TableCell sx={headCellSx}>Payment ID</TableCell>
                    <TableCell sx={headCellSx} align="right">
                      Amount
                    </TableCell>
                    <TableCell sx={headCellSx} align="center">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((p, index) => (
                    <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDate(p.paidAt)}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>1 year membership</TableCell>
                      <TableCell sx={{ wordBreak: 'break-all', fontSize: '0.82rem' }}>
                        {p.paymentId ?? '—'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        ₹{(p.amount / 100).toLocaleString('en-IN')}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Paid"
                          size="small"
                          sx={{
                            bgcolor: 'rgba(22, 163, 74, 0.12)',
                            color: '#16a34a',
                            fontWeight: 700,
                            borderRadius: 999,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Container>
    </Box>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 600, wordBreak: 'break-word' }}>{value}</Typography>
    </Box>
  );
}