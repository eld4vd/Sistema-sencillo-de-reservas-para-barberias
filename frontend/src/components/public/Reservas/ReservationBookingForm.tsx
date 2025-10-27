import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaPhoneAlt,
  FaQuestionCircle,
  FaTimes,
  FaUser,
} from "react-icons/fa";
import { FaMoneyBillWave, FaQrcode, FaScissors } from "react-icons/fa6";
import QRCode from "qrcode";
import type { Servicio } from "../../../models/Servicio";
import type { Peluquero } from "../../../models/Peluquero";
import type { PeluquerosServicio } from "../../../models/Peluquero-Servicio";
import type { Cita } from "../../../models/Cita";
import { serviciosService } from "../../../services/serviciosService";
import { peluquerosService } from "../../../services/peluquerosService";
import { peluqueroServicioService } from "../../../services/peluqueroServicioService";
import { citasService } from "../../../services/citasService";
import type { CreateCitaDto } from "../../../models/Cita";
import { pagosService } from "../../../services/pagosService";
import { fetchCsrfToken, getErrorMessage } from "../../../services/api";
import { logger } from "../../../helpers/logging";

type FormState = {
  serviceId: string;
  barberId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

type FormErrors = Partial<Record<keyof FormState | "general", string>>;

type FetchState = "idle" | "loading" | "ready" | "error";
type SubmitState = "idle" | "submitting" | "success" | "error";
type PaymentMethod = "qr" | "debit";
type PaymentStage =
  | "method"
  | "qr"
  | "card"
  | "processing"
  | "success"
  | "error";
type FormStep = 1 | 2 | 3;

interface PaymentModalState {
  open: boolean;
  stage: PaymentStage;
  method?: PaymentMethod | null;
  citaId?: number;
  serviceName?: string;
  amount?: number;
  transactionId?: string;
  transactionSeed?: string;
  error?: string | null;
}

interface PendingPayment {
  payload: CreateCitaDto;
  amount: number;
  serviceName: string;
}

const BUSINESS_OPEN = 8;
const BUSINESS_CLOSE = 20;
const SLOT_INTERVAL_MINUTES = 30;
const MIN_LEAD_TIME_MINUTES = 30;
const MIN_LEAD_TIME_MS = MIN_LEAD_TIME_MINUTES * 60 * 1000;

const SUCCESS_LOCATION_NAME = "Sunsetz Barber Studio";
const SUCCESS_LOCATION_ADDRESS = "Av. Ballivián 123 · Calacoto, La Paz";
const SUCCESS_CONTACT_PHONE = "+591 700 00000";
const SUCCESS_REMINDERS: string[] = [
  "Llega 10 minutos antes para disfrutar tu bebida de bienvenida.",
  `Si necesitas reprogramar, escríbenos por WhatsApp al ${SUCCESS_CONTACT_PHONE}.`,
  "Guarda el código y muéstralo al llegar a recepción.",
];

const pad = (value: number) => value.toString().padStart(2, "0");

const formatDateForInput = (date: Date) => {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  return `${year}-${month}-${day}`;
};

const timeStringToMinutes = (time: string) => {
  const [hours = 0, minutes = 0] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const buildCuratedTimeSlots = () => {
  const slots: string[] = [];
  for (
    let minutes = BUSINESS_OPEN * 60;
    minutes <= BUSINESS_CLOSE * 60;
    minutes += SLOT_INTERVAL_MINUTES
  ) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    slots.push(`${pad(hours)}:${pad(mins)}`);
  }
  return slots;
};

const curatedTimeSlots = buildCuratedTimeSlots();

// FORM_STEPS removido - ya no se usa el stepper visual

const isoToDateKey = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  return formatDateForInput(date);
};

const isoToTime = (isoString: string) => {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const isSlotWithinBusinessHours = (slot: string) => {
  const [hours] = slot.split(":").map(Number);
  return hours >= BUSINESS_OPEN && hours <= BUSINESS_CLOSE;
};

const buildTransactionSeed = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase();

const formatTransactionId = (seed?: string, citaId?: number) => {
  if (!seed) return "SUNQR";
  if (typeof citaId === "number") {
    return `SUNQR-${citaId}-${seed}`;
  }
  return `SUNQR-PRE-${seed}`;
};

const getPeluqueroId = (
  peluquero: Peluquero | { id: number } | null | undefined
) => {
  if (!peluquero) return null;
  if (typeof peluquero === "object" && "id" in peluquero) {
    return peluquero.id;
  }
  return null;
};

const getBarberInitials = (nombre: string) => {
  if (!nombre || nombre.trim().length === 0) return "??";
  const words = nombre.trim().split(/\s+/);
  if (words.length === 1) {
    return nombre.slice(0, 2).toUpperCase();
  }
  return (words[0][0] + words[1][0]).toUpperCase();
};

const getInitialDateTime = () => {
  const now = new Date();
  const today = formatDateForInput(now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const nextSlot = curatedTimeSlots.find(
    (slot) => timeStringToMinutes(slot) >= nowMinutes + MIN_LEAD_TIME_MINUTES
  );

  if (nextSlot) {
    return { date: today, time: nextSlot };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  return { date: formatDateForInput(tomorrow), time: curatedTimeSlots[0] };
};

interface ReservationBookingFormProps {
  hasNavbar?: boolean;
}

const ReservationBookingForm = ({
  hasNavbar = true,
}: ReservationBookingFormProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [services, setServices] = useState<Servicio[]>([]);
  const [barbers, setBarbers] = useState<Peluquero[]>([]);
  const [matrix, setMatrix] = useState<PeluquerosServicio[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>("idle");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [appointments, setAppointments] = useState<Cita[]>([]);
  const [form, setForm] = useState<FormState>(() => {
    const initial = getInitialDateTime();
    return {
      serviceId: "",
      barberId: "",
      date: initial.date,
      time: initial.time,
      name: "",
      email: "",
      phone: "",
      notes: "",
    };
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [successId, setSuccessId] = useState<number | null>(null);
  const [fetchErrorMessage, setFetchErrorMessage] = useState<string | null>(
    null
  );
  const [infoOpen, setInfoOpen] = useState(false);
  const infoTimeoutRef = useRef<number | null>(null);
  const [paymentModal, setPaymentModal] = useState<PaymentModalState>({
    open: false,
    stage: "method",
    method: null,
    error: null,
  });
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<boolean>(false);
  const [availabilityCheck, setAvailabilityCheck] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string | null;
  }>({
    checking: false,
    available: null,
    message: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      setFetchState("loading");
      try {
        const [servicesResponse, barbersResponse, appointmentsResponse] =
          await Promise.all([
            serviciosService.list(),
            peluquerosService.list(),
            citasService.list(),
          ]);

        let relationships: PeluquerosServicio[] = [];
        try {
          relationships = await peluqueroServicioService.list();
        } catch (error) {
          console.warn(
            "No se pudo obtener el mapeo peluqueros-servicios",
            error
          );
        }

        if (!cancelled) {
          const sortedServices = [...servicesResponse].sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          );
          const sortedBarbers = [...barbersResponse].sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          );

          setServices(sortedServices);
          setBarbers(sortedBarbers);
          setMatrix(relationships);
          setAppointments(appointmentsResponse);
          setFetchState("ready");
          setFetchErrorMessage(null);
        }
      } catch (error) {
        if (!cancelled) {
          setFetchState("error");
          setFetchErrorMessage(getErrorMessage(error));
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, []);

  const preferredBarberIds = useMemo(() => {
    if (!form.serviceId || matrix.length === 0) {
      return new Set<number>();
    }
    const serviceId = Number(form.serviceId);
    return new Set(
      matrix
        .filter((item) => item.servicio_id === serviceId)
        .map((item) => item.peluquero_id)
    );
  }, [form.serviceId, matrix]);

  const filteredBarbers = useMemo(() => {
    if (!form.serviceId) {
      return [];
    }
    if (preferredBarberIds.size === 0) {
      return [];
    }
    return barbers.filter((barber) =>
      preferredBarberIds.has(barber.id)
    );
  }, [barbers, form.serviceId, preferredBarberIds]);

  const displayedBarbers = useMemo(() => {
    if (!form.serviceId) return [] as Peluquero[];
    return filteredBarbers;
  }, [form.serviceId, filteredBarbers]);

  useEffect(() => {
    if (!form.serviceId) {
      if (form.barberId) {
        setForm((prev) => ({ ...prev, barberId: "" }));
      }
      return;
    }

    if (displayedBarbers.length === 0) {
      if (form.barberId) {
        setForm((prev) => ({ ...prev, barberId: "" }));
      }
      return;
    }

    if (!form.barberId) {
      setForm((prev) => ({
        ...prev,
        barberId: String(displayedBarbers[0].id),
      }));
      return;
    }

    if (!displayedBarbers.some((barber) => barber.id === Number(form.barberId))) {
      setForm((prev) => ({
        ...prev,
        barberId: String(displayedBarbers[0].id),
      }));
    }
  }, [displayedBarbers, form.barberId, form.serviceId]);

  const busySlots = useMemo(() => {
    if (!form.date) return new Set<string>();
    const selectedBarberId = Number(form.barberId) || null;
    const relevant = appointments.filter((appointment) => {
      if (appointment.estado === "Cancelada") return false;
      if (isoToDateKey(appointment.fechaHora) !== form.date) return false;
      if (selectedBarberId) {
        const appointmentBarberId = getPeluqueroId(appointment.peluquero);
        if (appointmentBarberId && appointmentBarberId !== selectedBarberId) {
          return false;
        }
      }
      return true;
    });

    return new Set(
      relevant
        .map((appointment) => isoToTime(appointment.fechaHora))
        .filter((slot): slot is string => Boolean(slot))
        .filter((slot) => isSlotWithinBusinessHours(slot))
    );
  }, [appointments, form.date, form.barberId]);

  const now = Date.now();
  const todayValue = formatDateForInput(new Date());

  const availableTimeSlots = useMemo(() => {
    const base = curatedTimeSlots.filter(
      (slot) => isSlotWithinBusinessHours(slot) && !busySlots.has(slot)
    );

    if (!form.date) {
      return base;
    }

    if (form.date === todayValue) {
      return base.filter((slot) => {
        const candidate = new Date(`${form.date}T${slot}:00`).getTime();
        return !Number.isNaN(candidate) && candidate >= now + MIN_LEAD_TIME_MS;
      });
    }

    return base;
  }, [busySlots, form.date, now, todayValue]);

  useEffect(() => {
    if (!form.date) return;

    if (availableTimeSlots.length === 0) {
      if (form.time !== "") {
        setForm((prev) => ({ ...prev, time: "" }));
      }
      return;
    }

    if (!form.time || !availableTimeSlots.includes(form.time)) {
      setForm((prev) => ({ ...prev, time: availableTimeSlots[0] }));
    }
  }, [availableTimeSlots, form.date, form.time]);

  useEffect(() => {
    return () => {
      if (infoTimeoutRef.current) {
        window.clearTimeout(infoTimeoutRef.current);
        infoTimeoutRef.current = null;
      }
    };
  }, []);

  const dayFullyBooked = useMemo(() => {
    if (!form.date) return false;
    return availableTimeSlots.length === 0;
  }, [availableTimeSlots, form.date]);

  const { barberId, date, time } = form;

  // Validar disponibilidad de horario en tiempo real
  const checkAvailability = useCallback(async () => {
    if (!barberId || !date || !time) {
      return;
    }

    setAvailabilityCheck({ checking: true, available: null, message: null });

    try {
      const appointmentDate = new Date(`${date}T${time}:00`);
      const targetIso = appointmentDate.toISOString();

      // Verificar si ya existe una cita en ese horario para ese peluquero
      const conflictingAppointment = appointments.find((appt) => {
        const apptPeluqueroId =
          typeof appt.peluquero === "object" ? appt.peluquero.id : null;
        if (apptPeluqueroId !== Number(barberId)) return false;
        if (appt.estado === "Cancelada") return false;

        const apptDate = new Date(appt.fechaHora);
        const apptIso = apptDate.toISOString();

        return apptIso === targetIso;
      });

      if (conflictingAppointment) {
        setAvailabilityCheck({
          checking: false,
          available: false,
          message:
            "Este horario ya está ocupado. Por favor, selecciona otro horario.",
        });
      } else {
        setAvailabilityCheck({
          checking: false,
          available: true,
          message: "✓ Horario disponible",
        });
      }
    } catch (error) {
      logger.warn("[Reservas] No se pudo verificar disponibilidad:", error);
      setAvailabilityCheck({
        checking: false,
        available: null,
        message: "No se pudo verificar disponibilidad",
      });
    }
  }, [appointments, barberId, date, time]);

  // Validar disponibilidad cuando cambie fecha, hora o peluquero
  useEffect(() => {
    if (date && time && barberId) {
      const timeoutId = setTimeout(() => {
        checkAvailability();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [barberId, date, time, checkAvailability]);

  useEffect(() => {
    let cancelled = false;
    if (!paymentModal.open || paymentModal.stage !== "qr") {
      setQrDataUrl(null);
      return () => {
        cancelled = true;
      };
    }

    const reference =
      paymentModal.transactionId ??
      formatTransactionId(paymentModal.transactionSeed, paymentModal.citaId);
    if (!reference) {
      setQrDataUrl(null);
      return () => {
        cancelled = true;
      };
    }

    const descriptor = [
      `SUNSETZ-${reference}`,
      paymentModal.serviceName ? `SERVICIO:${paymentModal.serviceName}` : null,
      typeof paymentModal.amount === "number"
        ? `MONTO:${paymentModal.amount.toFixed(2)}`
        : null,
    ]
      .filter(Boolean)
      .join("|");

    QRCode.toDataURL(descriptor || reference, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 280,
      color: {
        dark: "#2B2B28",
        light: "#FFFFFF",
      },
    })
      .then((url) => {
        if (!cancelled) {
          setQrDataUrl(url);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    paymentModal.open,
    paymentModal.stage,
    paymentModal.transactionId,
    paymentModal.transactionSeed,
    paymentModal.citaId,
    paymentModal.serviceName,
    paymentModal.amount,
  ]);

  const selectedService = useMemo(
    () =>
      services.find((service) => service.id === Number(form.serviceId)) ?? null,
    [services, form.serviceId]
  );
  const selectedBarber = useMemo(
    () => barbers.find((barber) => barber.id === Number(form.barberId)) ?? null,
    [barbers, form.barberId]
  );

  const handleChange = <K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
    if (submitState === "success" || submitState === "error") {
      setSubmitState("idle");
    }
  };

  const validate = (): FormErrors => {
    const errors: FormErrors = {};

    if (!form.serviceId) errors.serviceId = "Selecciona un servicio";
    
    if (form.serviceId && displayedBarbers.length === 0) {
      errors.barberId = "Este servicio no tiene barberos asignados. Contáctanos para coordinar.";
    }
    
    if (displayedBarbers.length > 0 && !form.barberId) {
      errors.barberId = "Selecciona un barbero";
    }

    if (!form.date) {
      errors.date = "Indica una fecha";
    }
    if (!form.time) {
      errors.time = "Selecciona horario";
    }

    if (form.date && form.time) {
      const candidate = new Date(`${form.date}T${form.time}:00`);
      if (Number.isNaN(candidate.getTime())) {
        errors.time = "Horario inválido";
      } else if (candidate.getTime() < Date.now() + MIN_LEAD_TIME_MS) {
        errors.time = `Reservas con ${MIN_LEAD_TIME_MINUTES} minutos de anticipación`;
      } else if (!isSlotWithinBusinessHours(form.time)) {
        errors.time = "Horario fuera del rango 08:00 - 20:00";
      } else if (busySlots.has(form.time)) {
        errors.time = "Ese horario ya fue reservado";
      }
    }

    if (!form.name.trim()) {
      errors.name = "Ingresa tu nombre";
    }

    if (!form.email.trim()) {
      errors.email = "Correo obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Correo inválido";
    }

    if (form.phone && !/^\+?[0-9\s-]{7,15}$/.test(form.phone.trim())) {
      errors.phone = "Teléfono inválido";
    }

    return errors;
  };

  const stepFieldMap: Record<FormStep, Array<keyof FormState>> = {
    1: ["serviceId", "barberId", "date", "time"],
    2: ["name", "email", "phone"],
    3: ["serviceId", "barberId", "date", "time", "name", "email", "phone"],
  };

  const ensureStepValid = (step: FormStep) => {
    const errors = validate();
    const relevant = stepFieldMap[step];
    const filtered: FormErrors = {};

    relevant.forEach((key) => {
      if (errors[key]) {
        filtered[key] = errors[key];
      }
    });

    if (errors.general) {
      filtered.general = errors.general;
    }

    setFormErrors(filtered);
    return relevant.every((key) => !errors[key]);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!ensureStepValid(1)) return;
      setCurrentStep(2);
      return;
    }

    if (currentStep === 2) {
      if (!ensureStepValid(2)) return;
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    setFormErrors({});
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as FormStep) : prev));
  };

  const resetForm = () => {
    const initialDateTime = getInitialDateTime();
    setForm({
      serviceId: "",
      barberId: "",
      date: initialDateTime.date,
      time: initialDateTime.time,
      name: "",
      email: "",
      phone: "",
      notes: "",
    });
    setFormErrors({});
    setCurrentStep(1);
  };

  const handleSuccessExit = () => {
    setSubmitState("idle");
    setSuccessId(null);
    navigate("/home");
  };

  const refreshAppointments = async () => {
    try {
      const data = await citasService.list();
      setAppointments(data);
    } catch (error) {
      logger.warn("[Reservas] Error al refrescar citas:", error);
    }
  };

  const handleInfoEnter = () => {
    if (infoTimeoutRef.current) {
      window.clearTimeout(infoTimeoutRef.current);
      infoTimeoutRef.current = null;
    }
    setInfoOpen(true);
  };

  const handleInfoLeave = () => {
    if (infoTimeoutRef.current) {
      window.clearTimeout(infoTimeoutRef.current);
    }
    infoTimeoutRef.current = window.setTimeout(() => {
      setInfoOpen(false);
      infoTimeoutRef.current = null;
    }, 120);
  };

  const closeInfoPopoverImmediately = () => {
    if (infoTimeoutRef.current) {
      window.clearTimeout(infoTimeoutRef.current);
      infoTimeoutRef.current = null;
    }
    setInfoOpen(false);
  };

  const closePaymentModal = () => {
    setPaymentModal({
      open: false,
      stage: "method",
      method: null,
      error: null,
    });
    setPendingPayment(null);
    setQrDataUrl(null);
    if (submitState === "submitting") {
      setSubmitState("idle");
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (!pendingPayment) return;
    const seed = paymentModal.transactionSeed ?? buildTransactionSeed();
    const transactionId = formatTransactionId(seed, paymentModal.citaId);
    setPaymentModal((prev) => ({
      ...prev,
      method,
      stage: method === "qr" ? "qr" : "card",
      transactionSeed: seed,
      transactionId,
      error: null,
    }));
  };

  const handleChangeMethod = () => {
    setPaymentModal((prev) => ({
      ...prev,
      stage: "method",
      method: null,
      error: null,
    }));
    setQrDataUrl(null);
  };

  const finalizePayment = async () => {
    if (!pendingPayment || !paymentModal.method) return;

    const seed = paymentModal.transactionSeed ?? buildTransactionSeed();
    setPaymentModal((prev) => ({
      ...prev,
      stage: "processing",
      transactionSeed: seed,
      transactionId: formatTransactionId(seed, prev.citaId),
      error: null,
    }));

    try {
      const { csrfToken } = await fetchCsrfToken();
      const response = await citasService.create(
        pendingPayment.payload,
        csrfToken
      );
      const citaId = response.id;
      const finalTransactionId = formatTransactionId(seed, citaId);

      setPaymentModal((prev) => ({
        ...prev,
        citaId,
        transactionId: finalTransactionId,
        transactionSeed: seed,
      }));

      if (pendingPayment.amount > 0) {
        await pagosService.create(
          {
            citaId,
            monto: pendingPayment.amount,
            metodoPago:
              paymentModal.method === "qr"
                ? "QR Sunsetz"
                : "Tarjeta débito Sunsetz",
            transaccionId: finalTransactionId,
            estado: "Completado",
          },
          csrfToken
        );
      }

      await citasService.update(
        citaId,
        {
          estado: "Pagada",
        },
        csrfToken
      );

      await refreshAppointments();
      setPaymentModal((prev) => ({
        ...prev,
        stage: "success",
        citaId,
        transactionId: finalTransactionId,
      }));
      setSuccessId(citaId);
      setSubmitState("success");
      resetForm();
      setPendingPayment(null);
    } catch (error) {
      const message = getErrorMessage(error);
      setPaymentModal((prev) => ({ ...prev, stage: "error", error: message }));
      setSubmitState("error");
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState === "submitting") return;

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Si estamos en paso 3, abrir modal de confirmación en lugar de proceder directamente
    if (currentStep === 3) {
      setConfirmationModal(true);
      return;
    }

    setFormErrors({});

    const appointmentDate = new Date(`${form.date}T${form.time}:00`);
    const payload: CreateCitaDto = {
      fechaHora: appointmentDate.toISOString(),
      clienteNombre: form.name.trim(),
      clienteEmail: form.email.trim(),
      clienteTelefono: form.phone.trim() ? form.phone.trim() : null,
      notas: form.notes.trim() ? form.notes.trim() : null,
      servicioId: Number(form.serviceId),
      peluqueroId: Number(form.barberId),
    };

    const amount = selectedService?.precio ?? 0;
    const serviceName = selectedService?.nombre ?? "Servicio Sunsetz";

    setPendingPayment({ payload, amount, serviceName });
    setPaymentModal({
      open: true,
      stage: "method",
      method: null,
      serviceName,
      amount,
      transactionId: undefined,
      transactionSeed: undefined,
      error: null,
    });
    setSubmitState("idle");
  };

  // Función que se ejecuta cuando el usuario confirma en el modal de confirmación
  const handleConfirmAndProceed = async () => {
    setConfirmationModal(false);
    setFormErrors({});

    // Verificar disponibilidad una última vez antes de proceder
    await checkAvailability();

    if (availabilityCheck.available === false) {
      // Si no está disponible, mostrar error y no proceder
      setFormErrors({
        time: "El horario seleccionado ya no está disponible. Por favor, selecciona otro.",
      });
      setCurrentStep(1); // Volver al paso 1 para cambiar horario
      return;
    }

    setSubmitState("submitting");

    const appointmentDate = new Date(`${form.date}T${form.time}:00`);
    const payload: CreateCitaDto = {
      fechaHora: appointmentDate.toISOString(),
      clienteNombre: form.name.trim(),
      clienteEmail: form.email.trim(),
      clienteTelefono: form.phone.trim() ? form.phone.trim() : null,
      notas: form.notes.trim() ? form.notes.trim() : null,
      servicioId: Number(form.serviceId),
      peluqueroId: Number(form.barberId),
    };

    const amount = selectedService?.precio ?? 0;
    const serviceName = selectedService?.nombre ?? "Servicio Sunsetz";

    setPendingPayment({ payload, amount, serviceName });
    setPaymentModal({
      open: true,
      stage: "method",
      method: null,
      serviceName,
      amount,
      transactionId: undefined,
      transactionSeed: undefined,
      error: null,
    });
    setSubmitState("idle");
  };

  const isLoading = fetchState === "loading" || fetchState === "idle";
  const isDisabled = submitState === "submitting";
  const canRetryPayment = Boolean(pendingPayment && paymentModal.method);
  const transactionReference =
    paymentModal.transactionId ??
    formatTransactionId(paymentModal.transactionSeed, paymentModal.citaId);
  const processingCopy =
    paymentModal.method === "debit"
      ? "Procesando el débito simulado desde tu tarjeta Sunsetz..."
      : "Validando tu pago QR con el equipo Sunsetz...";
  const isPaymentProcessing = paymentModal.stage === "processing";
  const sectionTopPadding = hasNavbar
    ? "pt-20 sm:pt-24 lg:pt-28"
    : "pt-12 sm:pt-16 lg:pt-20";

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (currentStep < 3) {
      event.preventDefault();
      handleNextStep();
      return;
    }

    handleSubmit(event);
  };

  return (
    <>
      <AnimatePresence>
        {paymentModal.open ? (
          <motion.div
            key="qr-modal"
            className="fixed inset-0 z-[120] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-[#1C1B1A]/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 24, opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 160, damping: 22 }}
              className="relative z-10 w-full max-w-xl rounded-[28px] border border-[#E7D9C4] bg-white p-8 shadow-[0_32px_90px_rgba(35,25,15,0.28)]"
            >
              <button
                type="button"
                onClick={closePaymentModal}
                className="absolute right-4 top-4 rounded-full border border-[#E3D5BF] bg-white p-2 text-[#6C6B68] transition hover:text-[#AF7B3B]"
                aria-label="Cerrar ventana de pago"
              >
                <FaTimes />
              </button>
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4E8D6] text-[#AF7B3B]">
                  <FaQrcode className="text-xl" />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.32em] text-[#7C786F]">
                    Pago seguro
                  </p>
                  <h3 className="text-2xl tracking-[0.08em] text-[#1F1C16]">
                    Escanea para confirmar tu cita
                  </h3>
                </div>
              </div>

              <div className="rounded-3xl border border-[#E7D9C4] bg-[#FDF9F1] p-6 text-sm text-[#4B4A48]">
                <p>
                  Servicio:{" "}
                  <span className="font-semibold text-[#1F1C16]">
                    {paymentModal.serviceName ?? "Servicio Sunsetz"}
                  </span>
                </p>
                <p className="mt-2">
                  Total a pagar:{" "}
                  <span className="font-semibold text-[#1F1C16]">
                    Bs.{" "}
                    {typeof paymentModal.amount === "number"
                      ? paymentModal.amount.toFixed(2)
                      : "0.00"}
                  </span>
                </p>
                <p className="mt-2">
                  Transacción:{" "}
                  <span className="font-mono text-[#AF7B3B]">
                    {transactionReference}
                  </span>
                </p>
              </div>

              <div className="mt-6 text-sm text-[#4B4A48]">
                {paymentModal.stage === "method" ? (
                  <div className="flex flex-col gap-5">
                    <p className="text-sm text-[#4B4A48]">
                      Elige cómo deseas simular tu pago. Tras confirmar,
                      registraremos tu cita automáticamente.
                    </p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodSelect("qr")}
                        className="flex flex-col items-start gap-3 rounded-3xl border border-[#E7D9C4] bg-white p-5 text-left transition hover:border-[#C79955]"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F4E8D6] text-[#AF7B3B]">
                          <FaQrcode className="text-xl" />
                        </span>
                        <div>
                          <p className="text-base font-semibold text-[#1F1C16]">
                            Pago con QR
                          </p>
                          <p className="mt-1 text-xs text-[#7C786F]">
                            Generamos un código QR simulado. Tras escanear,
                            presiona “Confirmar pago”.
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaymentMethodSelect("debit")}
                        className="flex flex-col items-start gap-3 rounded-3xl border border-[#E7D9C4] bg-white p-5 text-left transition hover:border-[#C79955]"
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F0F8] text-[#3C6FA3]">
                          <FaMoneyBillWave className="text-xl" />
                        </span>
                        <div>
                          <p className="text-base font-semibold text-[#1F1C16]">
                            Tarjeta débito
                          </p>
                          <p className="mt-1 text-xs text-[#7C786F]">
                            Simulamos un débito presencial. Confirma para
                            registrar la cita pagada.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                ) : null}

                {paymentModal.stage === "qr" ? (
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex h-60 w-60 items-center justify-center rounded-3xl border border-[#E7D9C4] bg-white p-4 shadow-inner">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Código QR de pago Sunsetz"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-[#7C786F]">
                          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#E5D5BC] border-t-[#C79955]" />
                          <span className="text-xs uppercase tracking-[0.28em]">
                            Generando QR...
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="max-w-sm text-center text-xs text-[#6C786F]">
                      Abre tu app bancaria, selecciona “Pagar con QR” y apunta
                      hacia la pantalla. Confirmamos automáticamente en menos de
                      5 segundos.
                    </p>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={finalizePayment}
                        className="rounded-full bg-[#AF7B3B] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isDisabled || isPaymentProcessing}
                      >
                        Confirmar pago
                      </button>
                      <button
                        type="button"
                        onClick={handleChangeMethod}
                        className="text-[11px] uppercase tracking-[0.28em] text-[#7C786F] underline decoration-dotted"
                      >
                        Elegir otro método
                      </button>
                    </div>
                  </div>
                ) : null}

                {paymentModal.stage === "card" ? (
                  <div className="flex flex-col gap-5">
                    <div className="rounded-3xl border border-[#D4DEE8] bg-gradient-to-br from-[#F7FBFF] to-[#E8F0F8] p-6 text-[#2D3A4A] shadow-inner">
                      <p className="text-xs uppercase tracking-[0.32em] text-[#3C6FA3]">
                        Terminal Sunsetz
                      </p>
                      <div className="mt-4 space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">**** 4321</span>
                          <span>Banco Andino</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#5A6B7C]">
                          <span>Cliente</span>
                          <span>{form.name || "Invitado Sunsetz"}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-[#5A6B7C]">
                          <span>Monto</span>
                          <span>
                            Bs.{" "}
                            {typeof paymentModal.amount === "number"
                              ? paymentModal.amount.toFixed(2)
                              : "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                      <button
                        type="button"
                        onClick={finalizePayment}
                        className="rounded-full bg-[#3C6FA3] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isDisabled || isPaymentProcessing}
                      >
                        Confirmar débito
                      </button>
                      <button
                        type="button"
                        onClick={handleChangeMethod}
                        className="text-[11px] uppercase tracking-[0.28em] text-[#7C786F] underline decoration-dotted"
                      >
                        Elegir otro método
                      </button>
                    </div>
                  </div>
                ) : null}

                {paymentModal.stage === "processing" ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#E5D5BC] border-t-[#C79955]" />
                    <p className="text-sm text-[#4B4A48]">{processingCopy}</p>
                    <p className="text-xs text-[#7C786F]">
                      No cierres esta ventana, estamos confirmando tu cita.
                    </p>
                  </div>
                ) : null}

                {paymentModal.stage === "success" ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4E8D6] text-[#AF7B3B]">
                      <FaCheckCircle className="text-2xl" />
                    </div>
                    <p className="text-base font-semibold text-[#1F1C16]">
                      Pago confirmado
                    </p>
                    <p className="text-xs text-[#6C6B68]">
                      Te enviamos un correo con los detalles de la reserva.
                      También aparecerá como “Pagada” en el panel
                      administrativo.
                    </p>
                    <button
                      type="button"
                      onClick={closePaymentModal}
                      className="rounded-full bg-[#AF7B3B] px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-sm"
                    >
                      Entendido
                    </button>
                  </div>
                ) : null}

                {paymentModal.stage === "error" ? (
                  <div className="flex flex-col items-center gap-4 py-6 text-center text-[#8A4B3A]">
                    <FaExclamationTriangle className="text-2xl" />
                    <p className="text-sm font-semibold">
                      No se pudo confirmar el pago
                    </p>
                    <p className="text-xs text-[#A36855]">
                      {paymentModal.error ??
                        "Intenta nuevamente o escríbenos por WhatsApp y validaremos manualmente tu turno."}
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={closePaymentModal}
                        className="rounded-full border border-[#A36855] px-4 py-2 text-xs uppercase tracking-[0.25em] text-[#A36855]"
                      >
                        Cerrar
                      </button>
                      {canRetryPayment ? (
                        <button
                          type="button"
                          onClick={finalizePayment}
                          className="rounded-full bg-[#AF7B3B] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white"
                        >
                          Reintentar
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>

              <p className="mt-6 text-center text-[10px] uppercase tracking-[0.32em] text-[#B1A799]">
                Sunsetz Barber Studio · Seguridad QR certificada
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <section
        className={`${sectionTopPadding} pb-20 bg-gradient-to-br from-[#13100B] via-[#19140F] to-[#231C13] text-[#F7EDDC]`}
      >
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          {fetchErrorMessage ? (
            <div className="mb-8 rounded-lg border border-red-500/30 bg-red-900/35 p-6 text-sm text-red-100 shadow-lg">
              <p className="font-semibold uppercase tracking-[0.2em]">
                Servicio temporalmente fuera de línea
              </p>
              <p className="mt-3 text-red-100/80">
                {fetchErrorMessage}. Puedes agendar llamando al{" "}
                <a
                  className="font-semibold text-red-100 underline decoration-dotted"
                  href="tel:+59170000000"
                >
                  +591 700 00000
                </a>{" "}
                o escribirnos por{" "}
                <a
                  className="font-semibold text-red-100 underline decoration-dotted"
                  href="https://wa.me/59170000000"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
                .
              </p>
            </div>
          ) : null}

          <div className="grid items-start gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-5 lg:sticky lg:top-28">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-md border border-[#5E472B] bg-[#2B2419] px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#EED9AF] shadow-sm">
                  Reserva inmediata
                </span>
                <div
                  className="relative"
                  onMouseEnter={handleInfoEnter}
                  onMouseLeave={handleInfoLeave}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (infoOpen) {
                        closeInfoPopoverImmediately();
                      } else {
                        handleInfoEnter();
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-md border border-[#5E472B] bg-[#2B2419] text-[#EED9AF] shadow-sm transition hover:border-[#C79B55] hover:text-[#C79B55]"
                    aria-label="Ver detalles de la experiencia"
                  >
                    <FaQuestionCircle />
                  </button>
                  <AnimatePresence>
                    {infoOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-30 mt-3 w-72 rounded-lg border border-[#3D2E1E] bg-[#1B1610] p-5 text-sm text-[#E8D8BA] shadow-[0_20px_50px_rgba(0,0,0,0.45)]"
                      >
                        <div className="flex items-center gap-2 text-[#C79B55]">
                          <FaInfoCircle /> Equipo Sunsetz
                        </div>
                        <p className="mt-3 text-xs text-[#CEC0A5]">
                          Confirmamos tu cita en minutos y preparamos tu experiencia personalizada.
                        </p>
                        <ul className="mt-4 space-y-3 text-xs text-[#CEC0A5]">
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C79B55]" />
                            Recordatorio 2 horas antes de tu cita.
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C79B55]" />
                            Reprograma hasta 6 horas antes sin costo.
                          </li>
                        </ul>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
              <h2 className="max-w-2xl text-3xl font-semibold leading-snug tracking-[0.02em] text-[#F7EDDC] sm:text-[2.25rem]">
                Solicita tu cita y recibe una confirmación personalizada en
                minutos
              </h2>
              <p className="max-w-xl text-sm text-[#CDC1AC]">
                Agenda en tres pasos simples: elige tu servicio, selecciona al
                barbero y confirma el horario disponible.
              </p>
              <ul className="space-y-3 text-sm text-[#D3C4A9]">
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C79B55]"
                    aria-hidden
                  />
                  Si no encuentras a tu barbero preferido, selecciona “Asignar
                  disponible” y coordinamos el ajuste por WhatsApp.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C79B55]"
                    aria-hidden
                  />
                  Puedes reprogramar hasta 6 horas antes sin penalización.
                </li>
                <li className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full bg-[#C79B55]"
                    aria-hidden
                  />
                  Cuando confirmemos tu cita recibirás el mapa del studio y tips
                  personalizados.
                </li>
              </ul>
            </div>

            <div className="relative">
              <div
                className="pointer-events-none absolute inset-x-6 -top-6 bottom-6 rounded-[36px] bg-[#C79B55]/25 blur-3xl"
                aria-hidden
              />
              <motion.form
                onSubmit={handleFormSubmit}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="relative rounded-xl border border-[#E5D7C0] bg-[#FDF8EE] p-5 text-[#1C1B1A] shadow-[0_20px_55px_rgba(0,0,0,0.25)] sm:p-6"
              >
                <div className="relative space-y-6">
                  <AnimatePresence mode="wait">
                    {currentStep === 1 ? (
                      <motion.div
                        key="step-1"
                        initial={{ opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -32 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-5 lg:grid-cols-2">
                          <label className="flex flex-col gap-2 text-sm">
                            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                              <FaScissors className="text-[#AF7B3B]" /> Servicio
                            </span>
                            <select
                              value={form.serviceId}
                              onChange={(event) =>
                                handleChange("serviceId", event.target.value)
                              }
                              className={`rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                                formErrors.serviceId
                                  ? "border-red-300"
                                  : "border-[#E2DBCF]"
                              }`}
                              disabled={isLoading || isDisabled}
                            >
                              <option value="" disabled>
                                Selecciona servicio
                              </option>
                              {services.map((service) => (
                                <option key={service.id} value={service.id}>
                                  {service.nombre} · Bs.{" "}
                                  {service.precio.toFixed(2)}
                                </option>
                              ))}
                            </select>
                            {formErrors.serviceId ? (
                              <span className="text-xs text-red-500">
                                {formErrors.serviceId}
                              </span>
                            ) : null}
                          </label>
                        </div>

                        {/* Sección de barberos disponibles - Se muestra automáticamente al seleccionar servicio */}
                        {form.serviceId && displayedBarbers.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                                <FaUser className="inline text-[#AF7B3B] mr-2" />
                                Barberos disponibles
                              </span>
                              <span className="rounded-full bg-[#AF7B3B] px-2 py-0.5 text-[10px] font-semibold text-white">
                                {displayedBarbers.length}
                              </span>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              {displayedBarbers.map((barber) => {
                                const isSelected = form.barberId === String(barber.id);
                                const isRecommended = preferredBarberIds.has(barber.id);
                                
                                return (
                                  <button
                                    key={barber.id}
                                    type="button"
                                    onClick={() => handleChange("barberId", String(barber.id))}
                                    disabled={isLoading || isDisabled}
                                    className={`group relative flex flex-col items-center gap-3 rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                                      isSelected
                                        ? "border-[#AF7B3B] bg-gradient-to-br from-[#FDF5E8] to-[#F9F0E0] shadow-[0_8px_24px_rgba(175,123,59,0.25)]"
                                        : "border-[#E7D9C4] bg-white hover:border-[#C79955] hover:shadow-[0_4px_16px_rgba(175,123,59,0.15)]"
                                    } disabled:cursor-not-allowed disabled:opacity-60`}
                                  >
                                    {/* Badge de recomendado */}
                                    {isRecommended && (
                                      <div className="absolute -right-2 -top-2 rounded-full bg-[#AF7B3B] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-md">
                                        ★ Top
                                      </div>
                                    )}

                                    {/* Indicador de selección */}
                                    {isSelected && (
                                      <div className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#AF7B3B] text-white shadow-md">
                                        <FaCheckCircle className="text-sm" />
                                      </div>
                                    )}

                                    {/* Foto o iniciales del barbero */}
                                    <div className={`relative h-20 w-20 overflow-hidden rounded-full border-4 transition-all ${
                                      isSelected 
                                        ? "border-[#AF7B3B] shadow-[0_0_20px_rgba(175,123,59,0.3)]" 
                                        : "border-[#E7D9C4] group-hover:border-[#C79955]"
                                    }`}>
                                      {barber.fotoUrl ? (
                                        <img
                                          src={barber.fotoUrl}
                                          alt={barber.nombre}
                                          className="h-full w-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display = "none";
                                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = "flex";
                                          }}
                                        />
                                      ) : null}
                                      <div
                                        className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-[#AF7B3B] to-[#8B6230] text-2xl font-bold text-white ${
                                          barber.fotoUrl ? "hidden" : "flex"
                                        }`}
                                      >
                                        {getBarberInitials(barber.nombre)}
                                      </div>
                                    </div>

                                    {/* Nombre del barbero */}
                                    <div className="w-full space-y-1">
                                      <p className={`text-sm font-semibold leading-tight transition-colors ${
                                        isSelected ? "text-[#AF7B3B]" : "text-[#1F1C16] group-hover:text-[#AF7B3B]"
                                      }`}>
                                        {barber.nombre}
                                      </p>
                                      
                                      {/* Especialidad si está disponible */}
                                      {barber.especialidad && (
                                        <p className="text-[10px] uppercase tracking-[0.15em] text-[#7C786F]">
                                          {barber.especialidad}
                                        </p>
                                      )}
                                    </div>

                                    {/* Indicador visual de hover */}
                                    <div className={`absolute inset-0 rounded-2xl transition-opacity ${
                                      isSelected 
                                        ? "opacity-0" 
                                        : "opacity-0 group-hover:opacity-100"
                                    } bg-gradient-to-t from-[#AF7B3B]/5 to-transparent pointer-events-none`} />
                                  </button>
                                );
                              })}
                            </div>

                            {formErrors.barberId && (
                              <span className="text-xs text-red-500">
                                {formErrors.barberId}
                              </span>
                            )}

                            {displayedBarbers.length === 0 && form.serviceId && (
                              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                                <FaExclamationTriangle className="mx-auto mb-2 text-2xl text-amber-600" />
                                <p className="text-sm font-semibold text-amber-900">
                                  Sin barberos asignados
                                </p>
                                <p className="mt-2 text-xs text-amber-800">
                                  Este servicio aún no tiene barberos disponibles. Por favor, contáctanos por WhatsApp o elige otro servicio.
                                </p>
                              </div>
                            )}
                          </motion.div>
                        )}

                        {!form.serviceId && (
                          <div className="rounded-xl border border-[#E7D9C4] bg-[#FDF9F1] p-4 text-center">
                            <p className="text-sm text-[#7C786F]">
                              👆 Selecciona un servicio para ver los barberos disponibles
                            </p>
                          </div>
                        )}

                        <div className="grid gap-5 lg:grid-cols-[1fr_0.6fr]">
                          <label className="flex flex-col gap-2 text-sm">
                            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                              <FaCalendarAlt className="text-[#AF7B3B]" /> Fecha
                            </span>
                            <input
                              type="date"
                              value={form.date}
                              onChange={(event) =>
                                handleChange("date", event.target.value)
                              }
                              min={formatDateForInput(new Date())}
                              className={`rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                                formErrors.date
                                  ? "border-red-300"
                                  : "border-[#E2DBCF]"
                              }`}
                              disabled={isDisabled}
                            />
                            {formErrors.date ? (
                              <span className="text-xs text-red-500">
                                {formErrors.date}
                              </span>
                            ) : null}
                          </label>

                          <label className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                              <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                                <FaClock className="text-[#AF7B3B]" /> Horario
                              </span>
                              <button
                                type="button"
                                onClick={() => setInfoOpen(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-[#D8CBB3] bg-white px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-[#AF7B3B] transition hover:border-[#AF7B3B] hover:bg-[#F8EFE3]"
                              >
                                Ver disponibilidad
                              </button>
                            </div>
                            <div className="relative">
                              <select
                                value={form.time}
                                onChange={(event) =>
                                  handleChange("time", event.target.value)
                                }
                                className={`w-full rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                                  formErrors.time
                                    ? "border-red-300"
                                    : "border-[#E2DBCF]"
                                }`}
                                disabled={
                                  isDisabled || availableTimeSlots.length === 0
                                }
                              >
                                {availableTimeSlots.length === 0 ? (
                                  <option value="" disabled>
                                    {form.date
                                      ? "Sin horarios disponibles"
                                      : "Selecciona una fecha"}
                                  </option>
                                ) : (
                                  availableTimeSlots.map((slot) => (
                                    <option key={slot} value={slot}>
                                      {slot} hrs
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            {formErrors.time ? (
                              <span className="text-xs text-red-500">
                                {formErrors.time}
                              </span>
                            ) : null}

                            {/* Indicador de disponibilidad en tiempo real */}
                            {availabilityCheck.checking && (
                              <div className="flex items-center gap-2 rounded-lg border border-[#E7D9C4] bg-[#FDF9F1] px-3 py-2 text-xs">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E5D5BC] border-t-[#AF7B3B]" />
                                <span className="text-[#7C786F]">
                                  Verificando disponibilidad...
                                </span>
                              </div>
                            )}

                            {!availabilityCheck.checking &&
                              availabilityCheck.available === true && (
                                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-xs">
                                  <FaCheckCircle className="text-green-600" />
                                  <span className="font-semibold text-green-700">
                                    {availabilityCheck.message}
                                  </span>
                                </div>
                              )}

                            {!availabilityCheck.checking &&
                              availabilityCheck.available === false && (
                                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs">
                                  <FaExclamationTriangle className="text-red-600" />
                                  <span className="font-semibold text-red-700">
                                    {availabilityCheck.message}
                                  </span>
                                </div>
                              )}

                            {dayFullyBooked ? (
                              <span className="text-[11px] text-red-500">
                                Agenda llena para este día. Selecciona otra
                                fecha o contáctanos para acomodarte.
                              </span>
                            ) : null}
                            <span className="text-[11px] text-[#7C786F]">
                              * Si necesitas otro horario déjanos una nota.
                              Confirmamos por WhatsApp.
                            </span>
                          </label>
                        </div>
                      </motion.div>
                    ) : null}

                    {currentStep === 2 ? (
                      <motion.div
                        key="step-2"
                        initial={{ opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -32 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6"
                      >
                        <div className="grid gap-5 lg:grid-cols-2">
                          <label className="flex flex-col gap-2 text-sm">
                            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                              <FaUser className="text-[#AF7B3B]" /> Nombre
                              completo
                            </span>
                            <input
                              type="text"
                              value={form.name}
                              onChange={(event) =>
                                handleChange("name", event.target.value)
                              }
                              placeholder="Ej. Eduardo Salvatierra"
                              className={`rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                                formErrors.name
                                  ? "border-red-300"
                                  : "border-[#E2DBCF]"
                              }`}
                              disabled={isDisabled}
                            />
                            {formErrors.name ? (
                              <span className="text-xs text-red-500">
                                {formErrors.name}
                              </span>
                            ) : null}
                          </label>

                          <label className="flex flex-col gap-2 text-sm">
                            <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                              <FaEnvelope className="text-[#AF7B3B]" /> Correo
                              electrónico
                            </span>
                            <input
                              type="email"
                              value={form.email}
                              onChange={(event) =>
                                handleChange("email", event.target.value)
                              }
                              placeholder="ejemplo@email.com"
                              className={`rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                                formErrors.email
                                  ? "border-red-300"
                                  : "border-[#E2DBCF]"
                              }`}
                              disabled={isDisabled}
                            />
                            {formErrors.email ? (
                              <span className="text-xs text-red-500">
                                {formErrors.email}
                              </span>
                            ) : null}
                          </label>
                        </div>

                        <label className="flex flex-col gap-2 text-sm">
                          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                            <FaPhoneAlt className="text-[#AF7B3B]" /> WhatsApp
                            de contacto (opcional)
                          </span>
                          <input
                            type="tel"
                            value={form.phone}
                            onChange={(event) =>
                              handleChange("phone", event.target.value)
                            }
                            placeholder="+591 7 867 4454"
                            className={`rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none ${
                              formErrors.phone
                                ? "border-red-300"
                                : "border-[#E2DBCF]"
                            }`}
                            disabled={isDisabled}
                          />
                          {formErrors.phone ? (
                            <span className="text-xs text-red-500">
                              {formErrors.phone}
                            </span>
                          ) : null}
                        </label>

                        <label className="flex flex-col gap-2 text-sm">
                          <span className="flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[#5B564F]">
                            <FaCalendarAlt className="text-[#AF7B3B]" /> Notas
                            especiales (opcional)
                          </span>
                          <textarea
                            value={form.notes}
                            onChange={(event) =>
                              handleChange("notes", event.target.value)
                            }
                            placeholder="Cuéntanos si deseas un acabado específico, referencias de estilo o necesidades logísticas."
                            rows={4}
                            className="resize-none rounded-lg border border-[#D9D3C9] bg-white px-4 py-3 text-sm text-[#1C1B1A] transition-colors focus:border-[#AF7B3B] focus:outline-none"
                            disabled={isDisabled}
                          />
                        </label>
                      </motion.div>
                    ) : null}

                    {currentStep === 3 ? (
                      <motion.div
                        key="step-3"
                        initial={{ opacity: 0, x: 32 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -32 }}
                        transition={{ duration: 0.35 }}
                        className="space-y-6"
                      >
                        <div className="rounded-3xl border border-[#E0D8C8] bg-[#FDF9F1] p-5 text-sm text-[#4B4A48] shadow-sm">
                          <p className="text-xs uppercase tracking-[0.32em] text-[#AF7B3B]">
                            Resumen de tu servicio
                          </p>
                          <div className="mt-4 space-y-3">
                            <div>
                              <p className="text-xs text-[#7C786F]">Servicio</p>
                              <p className="text-base font-semibold text-[#1F1C16]">
                                {selectedService
                                  ? selectedService.nombre
                                  : "Selecciona un servicio"}
                              </p>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#7C786F]">
                              <span>Duración estimada</span>
                              <span>
                                {selectedService
                                  ? `${selectedService.duracion} min`
                                  : "--"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#7C786F]">
                              <span>Inversión</span>
                              <span>
                                Bs.{" "}
                                {selectedService
                                  ? selectedService.precio.toFixed(2)
                                  : "0.00"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-[#E0D8C8] bg-white p-5 text-sm text-[#4B4A48] shadow-sm">
                          <p className="text-xs uppercase tracking-[0.32em] text-[#AF7B3B]">
                            Agenda propuesta
                          </p>
                          <div className="mt-4 space-y-2 text-xs text-[#6F6A63]">
                            <p>
                              Fecha:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {form.date
                                  ? new Date(
                                      `${form.date}T00:00:00`
                                    ).toLocaleDateString()
                                  : "--"}
                              </span>
                            </p>
                            <p>
                              Horario:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {form.time ? `${form.time} hrs` : "--"}
                              </span>
                            </p>
                            <p>
                              Barbero:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {selectedBarber
                                  ? selectedBarber.nombre
                                  : "Asignación del equipo"}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-[#E0D8C8] bg-white p-5 text-sm text-[#4B4A48] shadow-sm">
                          <p className="text-xs uppercase tracking-[0.32em] text-[#AF7B3B]">
                            Contacto
                          </p>
                          <div className="mt-4 space-y-2 text-xs text-[#6F6A63]">
                            <p>
                              Invitado:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {form.name || "---"}
                              </span>
                            </p>
                            <p>
                              Correo:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {form.email || "---"}
                              </span>
                            </p>
                            <p>
                              WhatsApp:{" "}
                              <span className="font-semibold text-[#1F1C16]">
                                {form.phone || "No indicado"}
                              </span>
                            </p>
                          </div>
                          <p className="mt-3 text-[11px] text-[#7C786F]">
                            Revisa que tus datos estén correctos. Usaremos este
                            contacto para confirmarte y enviarte recordatorios.
                          </p>
                        </div>

                        <p className="text-xs text-[#6F6A63]">
                          Al continuar abriremos la ventana de pago simulado
                          Sunsetz. Si prefieres confirmar manualmente,
                          escríbenos por WhatsApp con el resumen.
                        </p>

                        {currentStep === 3 &&
                          Object.keys(formErrors).length > 0 && (
                            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                              <p className="font-semibold uppercase tracking-[0.25em]">
                                Revisa los datos
                              </p>
                              <p className="mt-2 text-amber-700">
                                Hay campos incompletos o inválidos. Usa "Paso
                                anterior" para corregirlos.
                              </p>
                              <ul className="mt-3 space-y-1 text-xs text-amber-600">
                                {Object.entries(formErrors).map(
                                  ([key, message]) => (
                                    <li key={key}>• {message}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  {formErrors.general ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                      <p className="font-semibold uppercase tracking-[0.25em]">
                        No se pudo enviar
                      </p>
                      <p className="mt-2 text-red-600/80">
                        {formErrors.general}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#7C786F]">
                      {currentStep === 1
                        ? "Confirmamos vía correo en minutos tras validar disponibilidad."
                        : currentStep === 2
                        ? "Tus datos permanecen privados y solo se usan para coordinar la cita."
                        : "Podrás simular el pago por QR o débito al confirmar la solicitud."}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {currentStep > 1 ? (
                        <button
                          type="button"
                          onClick={handlePreviousStep}
                          className="rounded-lg border border-[#D8CBB3] px-5 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#7C786F] transition hover:border-[#AF7B3B] hover:text-[#AF7B3B]"
                          disabled={isDisabled}
                        >
                          Paso anterior
                        </button>
                      ) : null}
                      <button
                        type="submit"
                        disabled={submitState === "submitting"}
                        className={`inline-flex items-center gap-3 rounded-lg px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(175,123,59,0.22)] transition-transform ${
                          currentStep === 3
                            ? "bg-[#AF7B3B] hover:-translate-y-0.5"
                            : "bg-[#1F1C16] hover:-translate-y-0.5"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      >
                        {currentStep === 3
                          ? submitState === "submitting"
                            ? "Iniciando pago..."
                            : "Solicitar y pagar"
                          : "Continuar"}
                      </button>
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
                    <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#E5D5BC] border-t-[#C79955]" />
                  </div>
                ) : null}
              </motion.form>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Confirmación - Verificar datos antes de proceder */}
      <AnimatePresence>
        {confirmationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onClick={() => setConfirmationModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-[32px] border border-[#E7D9C4] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.25)]"
            >
              {/* Header de advertencia */}
              <div className="border-b border-[#E7D9C4] bg-gradient-to-br from-[#FDF9F1] to-[#F9F6F1] px-8 py-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#AF7B3B]/10">
                    <FaExclamationTriangle className="text-2xl text-[#AF7B3B]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl tracking-[0.08em] text-[#1F1C16]">
                      Confirma tu Reserva
                    </h3>
                    <p className="mt-1 text-sm text-[#6F6A63]">
                      Por favor, verifica que todos los datos estén correctos
                      antes de proceder al pago
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido - Resumen de la reserva */}
              <div className="max-h-[60vh] space-y-5 overflow-y-auto p-8">
                <div className="rounded-2xl border border-[#E7D9C4] bg-[#FDF9F1] p-5">
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.35em] text-[#AF7B3B]">
                    Resumen de tu Reserva
                  </p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <FaScissors className="mt-1 text-[#AF7B3B]" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9B9388]">Servicio</p>
                        <p className="font-semibold text-[#1F1C16]">
                          {selectedService?.nombre || "--"}
                        </p>
                        <p className="text-sm text-[#6F6A63]">
                          {selectedService?.duracion} min · Bs.{" "}
                          {selectedService?.precio.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaUser className="mt-1 text-[#AF7B3B]" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9B9388]">Barbero</p>
                        <p className="font-semibold text-[#1F1C16]">
                          {selectedBarber?.nombre || "Asignación automática"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaCalendarAlt className="mt-1 text-[#AF7B3B]" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9B9388]">Fecha y Hora</p>
                        <p className="font-semibold text-[#1F1C16]">
                          {form.date
                            ? new Date(
                                `${form.date}T00:00:00`
                              ).toLocaleDateString("es-BO", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                            : "--"}
                        </p>
                        <p className="text-sm text-[#6F6A63]">
                          {form.time} hrs
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaUser className="mt-1 text-[#AF7B3B]" />
                      <div className="flex-1">
                        <p className="text-xs text-[#9B9388]">
                          Datos de contacto
                        </p>
                        <p className="font-semibold text-[#1F1C16]">
                          {form.name}
                        </p>
                        <p className="text-sm text-[#6F6A63]">{form.email}</p>
                        <p className="text-sm text-[#6F6A63]">{form.phone}</p>
                      </div>
                    </div>

                    {form.notes && (
                      <div className="flex items-start gap-3">
                        <FaInfoCircle className="mt-1 text-[#AF7B3B]" />
                        <div className="flex-1">
                          <p className="text-xs text-[#9B9388]">
                            Notas adicionales
                          </p>
                          <p className="text-sm text-[#6F6A63]">{form.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Advertencias importantes */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <FaInfoCircle className="mt-0.5 text-amber-600" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-amber-900">
                        Importante
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        Al confirmar, se verificará la disponibilidad del
                        horario y se procederá al pago.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                    <FaCheckCircle className="mt-0.5 text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-blue-900">
                        Confirmación
                      </p>
                      <p className="mt-1 text-xs text-blue-800">
                        Recibirás un correo de confirmación y te contactaremos
                        en menos de 15 minutos hábiles.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 border-t border-[#E7D9C4] bg-[#FDF9F1] px-8 py-6">
                <button
                  onClick={() => setConfirmationModal(false)}
                  className="flex-1 rounded-full border-2 border-[#DED1BC] px-6 py-3 text-sm font-semibold uppercase tracking-[0.28em] text-[#7C786F] transition hover:border-[#AF7B3B] hover:bg-white hover:text-[#AF7B3B]"
                >
                  Revisar
                </button>
                <button
                  onClick={handleConfirmAndProceed}
                  className="flex-1 rounded-full bg-gradient-to-r from-[#AF7B3B] to-[#C79955] px-6 py-3 text-sm font-bold uppercase tracking-[0.28em] text-white shadow-[0_12px_32px_rgba(175,123,59,0.4)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(175,123,59,0.5)]"
                >
                  Confirmar y Pagar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Boleto - Confirmación de cita exitosa */}
      <AnimatePresence>
        {submitState === "success" && successId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-4 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md my-auto overflow-hidden rounded-[32px] border border-[#E7D9C4] bg-white shadow-[0_32px_90px_rgba(0,0,0,0.25)]"
            >
              {/* Header con gradiente - MÁS COMPACTO */}
              <div className="relative bg-gradient-to-br from-[#AF7B3B] to-[#8B6230] px-6 py-6 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.1),transparent_70%)]" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur"
                >
                  <FaCheckCircle className="text-4xl text-white" />
                </motion.div>
                <h2 className="text-2xl text-white">¡Cita Confirmada!</h2>
                <p className="mt-1 text-sm text-white/85">
                  Tu experiencia Sunsetz está reservada
                </p>
              </div>

              {/* Contenido del boleto - MÁS COMPACTO */}
              <div className="space-y-4 p-6">
                {/* Código de reserva */}
                <div className="rounded-2xl border-2 border-dashed border-[#E7D9C4] bg-[#FDF9F1] p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#AF7B3B]">
                    Código de reserva
                  </p>
                  <p className="mt-2 text-3xl text-[#1F1C16]">
                    #{String(successId).padStart(4, "0")}
                  </p>
                  <p className="mt-1 text-xs text-[#7C786F]">
                    Guarda este código para tu seguimiento
                  </p>
                </div>

                {/* Detalles esenciales */}
                <div className="rounded-2xl border border-[#E7D9C4] bg-[#FDF9F1] p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#AF7B3B]/10 text-[#AF7B3B]">
                      <FaMapMarkerAlt />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-xs uppercase tracking-[0.25em] text-[#9B9388]">
                        Tu experiencia te espera en
                      </p>
                      <p className="mt-1 text-lg font-semibold text-[#1F1C16]">
                        {SUCCESS_LOCATION_NAME}
                      </p>
                      <p className="mt-1 text-xs text-[#6F6A63]">
                        {SUCCESS_LOCATION_ADDRESS}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recordatorios y avisos */}
                <div className="space-y-3 rounded-xl border border-[#E7D9C4] bg-gradient-to-br from-[#FDF9F1] to-[#F9F6F1] p-4 text-left">
                  <p className="text-xs uppercase tracking-[0.25em] text-[#AF7B3B]">
                    Antes de llegar
                  </p>
                  <ul className="space-y-2 text-sm leading-relaxed text-[#4B4A48]">
                    {SUCCESS_REMINDERS.map((reminder) => (
                      <li key={reminder} className="flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#AF7B3B]" />
                        <span>{reminder}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-[#6F6A63]">
                    Nuestro equipo te confirmará el horario por correo y
                    WhatsApp en menos de{" "}
                    <span className="font-semibold text-[#AF7B3B]">
                      15 minutos hábiles
                    </span>
                    .
                  </p>
                  <p className="text-xs font-semibold text-[#7C786F]">
                    Para cerrar este aviso usa únicamente el botón{" "}
                    <span className="uppercase tracking-[0.18em]">
                      “Volver al inicio”
                    </span>
                    .
                  </p>
                </div>

                {/* Botón para volver */}
                <button
                  onClick={handleSuccessExit}
                  className="w-full rounded-full bg-gradient-to-r from-[#AF7B3B] to-[#C79955] px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white shadow-[0_20px_45px_rgba(175,123,59,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(175,123,59,0.5)]"
                >
                  Volver al inicio
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReservationBookingForm;
