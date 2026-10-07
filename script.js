// =========================================================
// BEYOND HEAVEN — Guest Bill / Booking Voucher
// Vanilla JS: live preview, calculations, formatting, printing
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('bill-form');

  // Form fields
  const fields = {
    bookingId: document.getElementById('bookingId'),
    bookingDate: document.getElementById('bookingDate'),
    bookingStatus: document.getElementById('bookingStatus'),
    bookingSource: document.getElementById('bookingSource'),

    guestName: document.getElementById('guestName'),
    guestPhone: document.getElementById('guestPhone'),
    guestEmail: document.getElementById('guestEmail'),

    checkIn: document.getElementById('checkIn'),
    checkOut: document.getElementById('checkOut'),
    nights: document.getElementById('nights'),
    adults: document.getElementById('adults'),
    children: document.getElementById('children'),
    extraBeds: document.getElementById('extraBeds'),

    roomType: document.getElementById('roomType'),
    propertyName: document.getElementById('propertyName'),
    mealPlan: document.getElementById('mealPlan'),
    roomRate: document.getElementById('roomRate'),

    totalAmount: document.getElementById('totalAmount'),
    advancePaid: document.getElementById('advancePaid'),
    balanceDue: document.getElementById('balanceDue'),

    specialNotes: document.getElementById('specialNotes'),
    showSignature: document.getElementById('showSignature'),
  };

  const dateError = document.getElementById('date-error');

  // Meal plan full labels for the printed bill
  const MEAL_PLAN_LABELS = {
    EP: 'EP — Room Only',
    CP: 'CP — Breakfast Included',
    MAP: 'MAP — Breakfast & One Meal',
    AP: 'AP — All Meals Included',
  };

  // ---------------------------------------------------------
  // Indian currency formatter → ₹6,000 / ₹15,000 / ₹1,25,000
  // ---------------------------------------------------------
  function formatINR(amount) {
    const value = Number(amount) || 0;
    return '₹' + value.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  // ---------------------------------------------------------
  // Format a yyyy-mm-dd date input value into a readable date
  // e.g. "12 Sep 2026"
  // ---------------------------------------------------------
  function formatDate(value) {
    if (!value) return '';
    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  // ---------------------------------------------------------
  // Auto-generate a Booking ID like BH-20260912-4821
  // ---------------------------------------------------------
  function generateBookingId() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `BH-${y}${m}${d}-${random}`;
  }

  // ---------------------------------------------------------
  // Calculate number of nights from check-in / check-out
  // ---------------------------------------------------------
  function calculateNights() {
    const inVal = fields.checkIn.value;
    const outVal = fields.checkOut.value;

    if (!inVal || !outVal) {
      fields.nights.value = '';
      return;
    }

    const inDate = new Date(inVal + 'T00:00:00');
    const outDate = new Date(outVal + 'T00:00:00');
    const diffMs = outDate - inDate;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      dateError.hidden = false;
      fields.nights.value = '';
      return;
    }

    dateError.hidden = true;
    fields.nights.value = diffDays;

    // Auto-fill total amount from room rate × nights, if a rate is set
    // and the guest hasn't typed a custom total already.
    autoCalculateTotal(diffDays);
  }

  // ---------------------------------------------------------
  // Auto-calculate total amount = room rate × nights
  // (only fills the field, never overrides a manual entry silently —
  //  it recalculates whenever rate or nights changes)
  // ---------------------------------------------------------
  function autoCalculateTotal(nights) {
    const rate = Number(fields.roomRate.value);
    if (rate > 0 && nights > 0) {
      fields.totalAmount.value = rate * nights;
    }
  }

  // ---------------------------------------------------------
  // Calculate Balance Due = Total Amount - Advance Paid
  // ---------------------------------------------------------
  function calculateBalance() {
    const total = Number(fields.totalAmount.value) || 0;
    const advance = Number(fields.advancePaid.value) || 0;
    const balance = Math.max(total - advance, 0);
    fields.balanceDue.value = formatINR(balance);
    return balance;
  }

  // ---------------------------------------------------------
  // Update the live guest count summary (Adults / Children)
  // ---------------------------------------------------------
  function guestSummary() {
    const adults = Number(fields.adults.value) || 0;
    const children = Number(fields.children.value) || 0;
    const beds = Number(fields.extraBeds.value) || 0;

    let text = `${adults} Adult${adults !== 1 ? 's' : ''}`;
    if (children > 0) {
      text += `, ${children} Child${children !== 1 ? 'ren' : ''}`;
    }
    if (beds > 0) {
      text += `, ${beds} Extra Bed${beds !== 1 ? 's' : ''}`;
    }
    return text;
  }

  // ---------------------------------------------------------
  // Render the live bill preview from current form values
  // ---------------------------------------------------------
  function renderBill() {
    // Booking Information
    document.getElementById('out-bookingId').textContent =
      fields.bookingId.value.trim();
    document.getElementById('out-bookingDate').textContent =
      formatDate(fields.bookingDate.value);
    document.getElementById('out-bookingStatus').textContent =
      fields.bookingStatus.value;
    document.getElementById('out-bookingSource').textContent =
      fields.bookingSource.value;

    // Guest Information
    document.getElementById('out-guestName').textContent =
      fields.guestName.value.trim();
    document.getElementById('out-guestPhone').textContent =
      fields.guestPhone.value.trim();
    document.getElementById('out-guestEmail').textContent =
      fields.guestEmail.value.trim();

    // Stay Details
    document.getElementById('out-checkIn').textContent =
      formatDate(fields.checkIn.value);
    document.getElementById('out-checkOut').textContent =
      formatDate(fields.checkOut.value);
    document.getElementById('out-duration').textContent = fields.nights.value
      ? `${fields.nights.value} Night${fields.nights.value != 1 ? 's' : ''}`
      : '';
    document.getElementById('out-guests').textContent = guestSummary();

    // Accommodation
    document.getElementById('out-roomType').textContent =
      fields.roomType.value.trim();
    document.getElementById('out-propertyName').textContent =
      fields.propertyName.value.trim() || 'Beyond Heaven Resort';
    document.getElementById('out-mealPlan').textContent =
      MEAL_PLAN_LABELS[fields.mealPlan.value] || fields.mealPlan.value;

    // Payment
    const total = Number(fields.totalAmount.value) || 0;
    const advance = Number(fields.advancePaid.value) || 0;
    const balance = calculateBalance();

    document.getElementById('out-totalAmount').textContent = formatINR(total);
    document.getElementById('out-advancePaid').textContent = formatINR(advance);
    document.getElementById('out-balanceDue').textContent = formatINR(balance);

    // Special Notes (hide section if empty)
    const notesSection = document.getElementById('notes-section');
    const notesText = fields.specialNotes.value.trim();
    if (notesText) {
      notesSection.hidden = false;
      document.getElementById('out-specialNotes').textContent = notesText;
    } else {
      notesSection.hidden = true;
    }

    // Guest signature toggle
    document.getElementById('signature-block').style.display =
      fields.showSignature.checked ? '' : 'none';
  }

  function todayISO() {
    return new Date().toISOString().slice(0, 10);
  }

  // ---------------------------------------------------------
  // Simple form validation before generating the bill
  // ---------------------------------------------------------
  function validateForm() {
    let valid = true;
    const requiredFields = [fields.guestName, fields.checkIn, fields.checkOut];

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        field.style.borderColor = '#111111';
        valid = false;
      } else {
        field.style.borderColor = '';
      }
    });

    if (fields.checkIn.value && fields.checkOut.value) {
      const inDate = new Date(fields.checkIn.value + 'T00:00:00');
      const outDate = new Date(fields.checkOut.value + 'T00:00:00');
      if (outDate < inDate) {
        dateError.hidden = false;
        valid = false;
      }
    }

    return valid;
  }

  // ---------------------------------------------------------
  // Event bindings — live preview on every input change
  // ---------------------------------------------------------
  Object.values(fields).forEach((field) => {
    if (!field) return;
    const evt = field.tagName === 'SELECT' || field.type === 'checkbox' ? 'change' : 'input';
    field.addEventListener(evt, () => {
      renderBill();
    });
  });

  fields.checkIn.addEventListener('change', calculateNights);
  fields.checkOut.addEventListener('change', calculateNights);
  fields.roomRate.addEventListener('input', () => {
    autoCalculateTotal(Number(fields.nights.value));
    renderBill();
  });

  // Prevent selecting a check-out date before check-in
  fields.checkIn.addEventListener('change', () => {
    if (fields.checkIn.value) {
      fields.checkOut.min = fields.checkIn.value;
    }
  });

  // ---------------------------------------------------------
  // Generate Bill button
  // ---------------------------------------------------------
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!fields.bookingId.value.trim()) {
      fields.bookingId.value = generateBookingId();
    }
    if (!fields.bookingDate.value) {
      fields.bookingDate.value = todayISO();
    }

    if (!validateForm()) {
      return;
    }

    calculateNights();
    renderBill();

    document.getElementById('bill').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // ---------------------------------------------------------
  // Print Bill button
  // ---------------------------------------------------------
  document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
  });

  // ---------------------------------------------------------
  // Download PDF — reuses the browser's print-to-PDF flow
  // ---------------------------------------------------------
  document.getElementById('pdfBtn').addEventListener('click', () => {
    window.print();
  });

  // ---------------------------------------------------------
  // Clear Form button
  // ---------------------------------------------------------
  document.getElementById('clearBtn').addEventListener('click', () => {
    form.reset();
    dateError.hidden = true;
    Object.values(fields).forEach((field) => {
      if (field) field.style.borderColor = '';
    });
    renderBill();
  });

  // ---------------------------------------------------------
  // Initial state on page load
  // ---------------------------------------------------------
  fields.bookingDate.value = todayISO();
  renderBill();
});
