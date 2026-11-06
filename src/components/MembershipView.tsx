"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  IconButton,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { startPayment } from "@/lib/pay-client";
import {
  SCENARIO_KEYS,
  SCENARIO_LABELS,
  type ScenarioKey,
} from "@/lib/scenarios";

// Only what the request form needs
type Consultant = {
  id: number;
  name: string;
  field: string;
  scenario: string | null;
};

type AppointmentRow = {
  id: number;
  scenario: string;
  problem: string | null;
  createdAt: string; // ISO
  consultant: {
    name: string;
    field: string;
    phone: string;
    email: string | null;
  };
};

export type MembershipViewProps = {
  name: string;
  status: "ACTIVE" | "PENDING" | "EXPIRED";
  startDate: string | null;
  expiryDate: string | null;
  daysLeft: number | null;
  canPay: boolean;
  payLabel: string;
  consultants: Consultant[];
  appointments: AppointmentRow[];
};

type Popup = { type: "success" | "error"; title: string; text: string };

const PAGE_SIZE = 5; // requests per page in the history table
const MAX_PROBLEM_LENGTH = 2000;

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      })
    : "—";

const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });

const scenarioLabel = (key: string) =>
  SCENARIO_LABELS[key as ScenarioKey] ?? key;

const cardSx = {
  bgcolor: "var(--white)",
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  boxShadow: "0 10px 30px rgba(22, 163, 74, 0.08)",
  p: { xs: 2.5, md: 3.5 },
};

const headCellSx = {
  fontWeight: 700,
  bgcolor: "var(--primary-light)",
  whiteSpace: "nowrap",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    bgcolor: "#f8faf9",
    transition: "box-shadow 0.2s, background-color 0.2s",
    "& fieldset": { borderColor: "#e2e8e4" },
    "&:hover fieldset": { borderColor: "var(--primary)" },
    "&.Mui-focused": {
      bgcolor: "var(--white)",
      boxShadow: "0 0 0 4px rgba(22, 163, 74, 0.15)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--primary)",
      borderWidth: 1.5,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "var(--primary)" },
  "& .MuiFormHelperText-root": { ml: 0.5 },
};

const buttonSx = {
  background: "linear-gradient(90deg, var(--primary), #22c55e)",
  borderRadius: "14px",
  px: 4,
  py: 1.3,
  fontWeight: 600,
  boxShadow: "0 8px 20px rgba(22, 163, 74, 0.35)",
  "&.Mui-disabled": { color: "var(--white)", opacity: 0.7 },
};

const dialogPaperSx = { borderRadius: 4, p: { xs: 1, sm: 2 } };

const statusUi = {
  ACTIVE: { label: "Active", color: "#16a34a", bg: "rgba(22, 163, 74, 0.12)" },
  PENDING: {
    label: "Not activated",
    color: "#b45309",
    bg: "rgba(245, 158, 11, 0.15)",
  },
  EXPIRED: { label: "Expired", color: "#dc2626", bg: "rgba(220, 38, 38, 0.1)" },
};

export default function MembershipView(props: MembershipViewProps) {
  const {
    name,
    status,
    startDate,
    expiryDate,
    daysLeft,
    canPay,
    payLabel,
    consultants,
  } = props;
  const router = useRouter();

  const [paying, setPaying] = useState(false);

  // One popup for every result message (payment and requests)
  const [popup, setPopup] = useState<Popup | null>(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const showPopup = (p: Popup) => {
    setPopup(p);
    setPopupOpen(true);
  };

  // Consultation requests
  const [appointments, setAppointments] = useState<AppointmentRow[]>(
    props.appointments,
  );
  const [scenario, setScenario] = useState<ScenarioKey | "">("");
  const [consultantId, setConsultantId] = useState("");
  const [problem, setProblem] = useState("");
  const [sending, setSending] = useState(false);
  const [formErrors, setFormErrors] = useState<{
    scenario?: string;
    consultant?: string;
  }>({});

  // History table
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<AppointmentRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const firstName = name.split(" ")[0];
  const ui = statusUi[status];

  // Only the consultants of the chosen scenario
  const scenarioConsultants = scenario
    ? consultants.filter((c) => c.scenario === scenario)
    : [];

  const pageRows = appointments.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE,
  );

  const showRequest = status === "ACTIVE";
  const showHistory = status === "ACTIVE" || appointments.length > 0;

  const handlePay = () => {
    setPaying(true);
    startPayment({
      onSuccess: (expiry) => {
        showPopup({
          type: "success",
          title: "Payment successful",
          text: expiry
            ? `Your membership is active until ${formatDate(expiry)}.`
            : "Your membership is now active.",
        });
        router.refresh(); // reload the page data from the server
      },
      onFailed: (text) =>
        showPopup({ type: "error", title: "Payment not completed", text }),
      onDone: () => setPaying(false),
    });
  };

  const sendRequest = async (e: FormEvent) => {
    e.preventDefault();

    const errors: { scenario?: string; consultant?: string } = {};
    if (!scenario) errors.scenario = "Please choose a scenario.";
    if (scenario && !consultantId)
      errors.consultant = "Please choose a consultant.";
    setFormErrors(errors);
    if (errors.scenario || errors.consultant) return;

    setSending(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          consultantId: Number(consultantId),
          problem,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.appointment) {
        setAppointments((prev) => [data.appointment, ...prev]);
        setPage(0); // the newest request is on the first page
        setScenario("");
        setConsultantId("");
        setProblem("");
        showPopup({
          type: "success",
          title: "Request sent",
          text: `Your request has been sent to ${data.appointment.consultant.name}. They will contact you to fix a 1-hour time.`,
        });
      } else {
        showPopup({
          type: "error",
          title: "Request not sent",
          text: data.error || "Could not send your request. Please try again.",
        });
      }
    } catch {
      showPopup({
        type: "error",
        title: "Request not sent",
        text: "Network error. Please check your connection and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  const payButton = (
    <Button
      variant="contained"
      size="large"
      disabled={paying}
      onClick={handlePay}
      sx={buttonSx}
    >
      {paying ? <CircularProgress size={24} color="inherit" /> : payLabel}
    </Button>
  );

  return (
    <Box
      component="main"
      sx={{
        background:
          "linear-gradient(135deg, var(--primary-light) 0%, #ffffff 100%)",
        minHeight: "calc(100vh - 72px)",
      }}
    >
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 7 } }}>
        <Typography
          component="h1"
          sx={{ fontSize: { xs: "1.8rem", md: "2.3rem" }, fontWeight: 700 }}
        >
          Welcome,{" "}
          <Box component="span" sx={{ color: "var(--primary)" }}>
            {firstName}
          </Box>
        </Typography>
        <Typography sx={{ mt: 0.5, color: "text.secondary" }}>
          Your Discuss Daily membership details are below.
        </Typography>

        <Stack spacing={3} sx={{ mt: 4 }}>
          {/* Membership card */}
          <Box sx={cardSx}>
            <Stack
              direction="row"
              sx={{
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography
                component="h2"
                sx={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Membership
              </Typography>
              <Chip
                label={ui.label}
                sx={{
                  bgcolor: ui.bg,
                  color: ui.color,
                  fontWeight: 700,
                  borderRadius: 999,
                }}
              />
            </Stack>

            <Box
              sx={{
                mt: 2.5,
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" },
                gap: 2,
              }}
            >
              <Info label="Plan" value="1 year · ₹365" />
              <Info label="Start date" value={formatDate(startDate)} />
              <Info label="Expiry date" value={formatDate(expiryDate)} />
              <Info
                label="Days left"
                value={status === "PENDING" ? "—" : String(daysLeft ?? 0)}
              />
            </Box>

            {status === "ACTIVE" && daysLeft !== null && (
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (daysLeft / 365) * 100)}
                sx={{
                  mt: 2.5,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(22, 163, 74, 0.12)",
                }}
              />
            )}

            {status === "PENDING" && (
              <Typography sx={{ mt: 2.5, color: "text.secondary" }}>
                Pay ₹365 to activate your 1-year membership and request
                consultations.
              </Typography>
            )}
            {status === "EXPIRED" && (
              <Typography sx={{ mt: 2.5, color: "text.secondary" }}>
                Your membership has expired. Renew for ₹365 to get 1 more year
                of access.
              </Typography>
            )}

            {canPay && (
              <Box sx={{ mt: 2.5 }}>
                {payButton}
                <Typography
                  sx={{ mt: 1, fontSize: "0.78rem", color: "text.secondary" }}
                >
                  The membership fee is non-refundable.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Request a consultation (active members only) */}
          {showRequest && (
            <Box component="section" sx={cardSx}>
              <Typography
                component="h2"
                sx={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Request a consultation
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  mb: 2.5,
                  color: "text.secondary",
                  fontSize: "0.92rem",
                }}
              >
                Choose a scenario and a consultant. The consultant will contact
                you to fix a 1-hour time.
              </Typography>

              <Box component="form" onSubmit={sendRequest} noValidate>
                <Stack spacing={2.5}>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2.5,
                    }}
                  >
                    <TextField
                      select
                      label="1. Choose a scenario"
                      value={scenario}
                      onChange={(e) => {
                        setScenario(e.target.value as ScenarioKey | "");
                        setConsultantId("");
                        setFormErrors({});
                      }}
                      error={Boolean(formErrors.scenario)}
                      helperText={formErrors.scenario}
                      disabled={sending}
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      sx={fieldSx}
                      fullWidth
                    >
                      <option value="">Select a scenario</option>
                      {SCENARIO_KEYS.map((key) => (
                        <option key={key} value={key}>
                          {SCENARIO_LABELS[key]}
                        </option>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="2. Choose a consultant"
                      value={consultantId}
                      onChange={(e) => {
                        setConsultantId(e.target.value);
                        setFormErrors({});
                      }}
                      error={Boolean(formErrors.consultant)}
                      disabled={
                        sending || !scenario || scenarioConsultants.length === 0
                      }
                      helperText={
                        formErrors.consultant ??
                        (scenario && scenarioConsultants.length === 0
                          ? "No consultants are available for this scenario yet."
                          : undefined)
                      }
                      slotProps={{
                        select: { native: true },
                        inputLabel: { shrink: true },
                      }}
                      sx={fieldSx}
                      fullWidth
                    >
                      <option value="">
                        {scenario
                          ? "Select a consultant"
                          : "Choose a scenario first"}
                      </option>
                      {scenarioConsultants.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} · {c.field}
                        </option>
                      ))}
                    </TextField>
                  </Box>

                  <TextField
                    label="3. Problem statement (optional)"
                    placeholder="Describe your problem in a few lines, or leave this empty"
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    disabled={sending}
                    multiline
                    minRows={4}
                    helperText={`${problem.length}/${MAX_PROBLEM_LENGTH}`}
                    slotProps={{
                      htmlInput: { maxLength: MAX_PROBLEM_LENGTH },
                      inputLabel: { shrink: true },
                    }}
                    sx={fieldSx}
                    fullWidth
                  />

                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={sending}
                      endIcon={!sending && <SendIcon />}
                      sx={buttonSx}
                    >
                      {sending ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        "Send request"
                      )}
                    </Button>
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: "0.78rem",
                        color: "text.secondary",
                      }}
                    >
                      Consultation fees are paid directly to the consultant.
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          )}

          {/* Request history: a table, 5 requests per page */}
          {showHistory && (
            <Box component="section" sx={cardSx}>
              <Typography
                component="h2"
                sx={{ fontSize: "1.2rem", fontWeight: 700 }}
              >
                Your requests
              </Typography>

              {appointments.length === 0 ? (
                <Typography sx={{ mt: 1.5, color: "text.secondary" }}>
                  No requests yet.
                </Typography>
              ) : (
                <>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small" sx={{ minWidth: 720 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={headCellSx}>S.No</TableCell>
                          <TableCell sx={headCellSx}>Date</TableCell>
                          <TableCell sx={headCellSx}>Scenario</TableCell>
                          <TableCell sx={headCellSx}>Consultant</TableCell>
                          <TableCell sx={headCellSx}>Problem</TableCell>
                          <TableCell sx={headCellSx} align="center">
                            View
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pageRows.map((a, index) => (
                          <TableRow
                            key={a.id}
                            hover
                            sx={{ "&:last-child td": { borderBottom: 0 } }}
                          >
                            <TableCell>{page * PAGE_SIZE + index + 1}</TableCell>
                            <TableCell sx={{ whiteSpace: "nowrap" }}>
                              {formatDate(a.createdAt)}
                            </TableCell>
                            <TableCell sx={{ minWidth: 170, maxWidth: 220 }}>
                              {scenarioLabel(a.scenario)}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>
                              {a.consultant.name}
                            </TableCell>
                            <TableCell sx={{ minWidth: 160, maxWidth: 240 }}>
                              <Typography
                                sx={{
                                  fontSize: "0.875rem",
                                  color: "text.secondary",
                                  fontStyle: a.problem ? "normal" : "italic",
                                  wordBreak: "break-word",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {a.problem ?? "Not added"}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Tooltip title="View details">
                                <IconButton
                                  size="small"
                                  aria-label="View request details"
                                  onClick={() => {
                                    setDetail(a);
                                    setDetailOpen(true);
                                  }}
                                  sx={{ color: "var(--primary)" }}
                                >
                                  <VisibilityOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {appointments.length > PAGE_SIZE && (
                    <TablePagination
                      component="div"
                      count={appointments.length}
                      page={page}
                      rowsPerPage={PAGE_SIZE}
                      rowsPerPageOptions={[PAGE_SIZE]}
                      onPageChange={(_, newPage) => setPage(newPage)}
                    />
                  )}
                </>
              )}
            </Box>
          )}
        </Stack>
      </Container>

      {/* Result popup (payment and requests) */}
      <NoticeDialog
        open={popupOpen}
        popup={popup}
        onClose={() => setPopupOpen(false)}
      />

      {/* Request details popup */}
      <DetailsDialog
        open={detailOpen}
        a={detail}
        onClose={() => setDetailOpen(false)}
      />
    </Box>
  );
}

function NoticeDialog({
  open,
  popup,
  onClose,
}: {
  open: boolean;
  popup: Popup | null;
  onClose: () => void;
}) {
  if (!popup) return null;
  const ok = popup.type === "success";
  const Icon = ok ? CheckCircleIcon : ErrorIcon;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: dialogPaperSx } }}
    >
      <DialogContent>
        <Stack spacing={2} sx={{ alignItems: "center", textAlign: "center" }}>
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: ok ? "rgba(22, 163, 74, 0.12)" : "rgba(220, 38, 38, 0.1)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon
              sx={{ fontSize: 56, color: ok ? "var(--primary)" : "#dc2626" }}
            />
          </Box>

          <Typography component="h2" sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
            {popup.title}
          </Typography>

          <Typography sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            {popup.text}
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={onClose}
            sx={{ ...buttonSx, width: "100%", mt: 1 }}
          >
            OK
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function DetailsDialog({
  open,
  a,
  onClose,
}: {
  open: boolean;
  a: AppointmentRow | null;
  onClose: () => void;
}) {
  if (!a) return null;
  const digits = a.consultant.phone.replace(/\D/g, "");
  const linkSx = {
    display: "inline-flex",
    alignItems: "center",
    gap: 1,
    color: "text.primary",
    textDecoration: "none",
    "&:hover": { color: "var(--primary)" },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { sx: dialogPaperSx } }}
    >
      <IconButton
        aria-label="Close"
        onClick={onClose}
        sx={{ position: "absolute", top: 10, right: 10, color: "text.secondary" }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent>
        <Typography component="h2" sx={{ fontSize: "1.4rem", fontWeight: 700 }}>
          Request details
        </Typography>

        <Box
          sx={{
            mt: 2.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 2,
          }}
        >
          <Info label="Consultant" value={a.consultant.name} />
          <Info label="Expertise" value={a.consultant.field} />
          <Info label="Scenario" value={scenarioLabel(a.scenario)} />
          <Info label="Sent on" value={formatDateTime(a.createdAt)} />
        </Box>

        <Typography sx={{ mt: 2.5, fontSize: "0.8rem", color: "text.secondary" }}>
          Problem statement
        </Typography>
        <Typography
          sx={{
            mt: 0.5,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontStyle: a.problem ? "normal" : "italic",
            color: a.problem ? "text.primary" : "text.secondary",
          }}
        >
          {a.problem ?? "No problem statement added"}
        </Typography>

        {/* The member and the consultant fix the time themselves */}
        <Typography sx={{ mt: 2.5, fontSize: "0.8rem", color: "text.secondary" }}>
          Contact the consultant to fix a 1-hour time
        </Typography>
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Box
            component="a"
            href={`tel:${a.consultant.phone.replace(/\s/g, "")}`}
            sx={linkSx}
          >
            <PhoneOutlinedIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
            {a.consultant.phone}
          </Box>
          {digits && (
            <Box
              component="a"
              href={`https://wa.me/${digits}`}
              target="_blank"
              rel="noopener noreferrer"
              sx={linkSx}
            >
              <WhatsAppIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
              WhatsApp
            </Box>
          )}
          {a.consultant.email && (
            <Box
              component="a"
              href={`mailto:${a.consultant.email}`}
              sx={{ ...linkSx, wordBreak: "break-all" }}
            >
              <EmailOutlinedIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
              {a.consultant.email}
            </Box>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>
        {value}
      </Typography>
    </Box>
  );
}