import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ApplicationsApiError,
  confirmApplication,
  getProgram,
  listPrograms,
  requestApplicationOtp
} from './applications-api.js';
import './applications.css';

const EMPTY_FORM = {
  applicantFullName: '',
  memberNumber: '',
  email: '',
  mobilePhone: '',
  birthDate: '',
  citizenCardNumber: '',
  taxNumber: '',
  guardianName: '',
  guardianTaxNumber: '',
  guardianEmail: '',
  address: '',
  postalCode: '',
  locality: '',
  academicInstitution: '',
  course: '',
  gradeAverage: ''
};

const FIELD_LIMITS = {
  applicantFullName: 200,
  memberNumber: 50,
  email: 200,
  mobilePhone: 30,
  citizenCardNumber: 30,
  taxNumber: 20,
  guardianName: 200,
  guardianTaxNumber: 20,
  guardianEmail: 200,
  address: 300,
  locality: 120,
  academicInstitution: 200,
  course: 200
};

function isMinor(birthDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsedDate = new Date(year, month - 1, day);
  if (
    parsedDate.getFullYear() !== year
    || parsedDate.getMonth() !== month - 1
    || parsedDate.getDate() !== day
  ) return false;

  const today = new Date();
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age < 18;
}

function getMessages(error) {
  if (error instanceof ApplicationsApiError) return error.messages;
  return ['Ocorreu um erro inesperado. Tenta novamente.'];
}

function scrollToTop() {
  try {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch {
    // A navegação deve continuar mesmo que o browser não suporte scroll suave.
  }
}

function formatDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('pt-PT', { dateStyle: 'long' }).format(date);
}

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.ceil(bytes / 1024)} KB`;
}

function validateFile(file, requirement) {
  if (file.size > requirement.maxSizeBytes) {
    return `${requirement.name}: o ficheiro excede ${formatBytes(requirement.maxSizeBytes)}.`;
  }

  const allowedTypes = requirement.allowedMimeTypes || [];
  if (allowedTypes.length && (!file.type || !allowedTypes.some((type) => type.toLowerCase() === file.type.toLowerCase()))) {
    return `${requirement.name}: seleciona um formato de ficheiro permitido.`;
  }

  return null;
}

function validateForm(form, program, documents, accessConditionsAccepted) {
  const messages = [];
  const requiredFields = [
    ['applicantFullName', 'Indica o nome completo.'],
    ['email', 'Indica o email.'],
    ['mobilePhone', 'Indica o contacto telefónico.'],
    ['birthDate', 'Indica a data de nascimento.'],
    ['citizenCardNumber', 'Indica o número do Cartão de Cidadão.'],
    ['address', 'Indica a morada.'],
    ['postalCode', 'Indica o código postal.'],
    ['locality', 'Indica a localidade.'],
    ['academicInstitution', 'Indica o estabelecimento de ensino.'],
    ['course', 'Indica o ano de frequência.'],
    ['gradeAverage', 'Indica a média.']
  ];

  requiredFields.forEach(([field, message]) => {
    if (!String(form[field]).trim()) messages.push(message);
  });

  Object.entries(FIELD_LIMITS).forEach(([field, limit]) => {
    if (String(form[field]).length > limit) messages.push(`O campo ${field} excede o limite permitido.`);
  });

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    messages.push('Indica um endereço de email válido.');
  }
  if (form.guardianEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.guardianEmail)) {
    messages.push('Indica um endereço de email válido para o encarregado de educação.');
  }
  if (form.postalCode && !/^\d{4}-\d{3}$/.test(form.postalCode)) {
    messages.push('O código postal deve ter o formato 0000-000.');
  }
  if (form.birthDate && form.birthDate > new Date().toISOString().slice(0, 10)) {
    messages.push('A data de nascimento não pode ser futura.');
  }
  if (isMinor(form.birthDate)) {
    if (!form.guardianName.trim()) messages.push('Indica o nome do encarregado de educação.');
    if (!form.guardianTaxNumber.trim()) messages.push('Indica o NIF do encarregado de educação.');
    if (!form.guardianEmail.trim()) messages.push('Indica o email do encarregado de educação.');
  }
  const gradeAverage = form.gradeAverage === '' ? null : Number(form.gradeAverage);
  if (gradeAverage !== null && (!Number.isFinite(gradeAverage) || gradeAverage < 0 || gradeAverage > 20)) {
    messages.push('A média deve estar entre 0 e 20 valores.');
  }
  if (program.accessConditions?.trim() && !accessConditionsAccepted) {
    messages.push('Confirma que leste e aceitas as condições de candidatura.');
  }

  (program.documentRequirements || []).filter((item) => item.active).forEach((requirement) => {
    const file = documents[requirement.id];
    if (requirement.required && !file) messages.push(`Adiciona o documento “${requirement.name}”.`);
    if (file) {
      const fileError = validateFile(file, requirement);
      if (fileError) messages.push(fileError);
    }
  });

  return [...new Set(messages)];
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('file-read-error'));
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const comma = dataUrl.indexOf(',');
      if (comma < 0) reject(new Error('file-read-error'));
      else resolve(dataUrl.slice(comma + 1));
    };
    reader.readAsDataURL(file);
  });
}

function Field({ label, name, required = false, hint, children, ...inputProps }) {
  const inputId = `application-${name}`;
  return (
    <div className="application-field">
      <label htmlFor={inputId}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children || <input id={inputId} name={name} required={required} {...inputProps} />}
      {hint && <small>{hint}</small>}
    </div>
  );
}

function StatusPanel({ icon, title, children, action }) {
  return (
    <div className="applications-status" role="status">
      <span className="applications-status__icon" aria-hidden="true">{icon}</span>
      <h2>{title}</h2>
      <div>{children}</div>
      {action}
    </div>
  );
}

function ProgramCard({ program, onSelect }) {
  const from = formatDate(program.openFrom);
  const until = formatDate(program.openUntil);
  return (
    <article className="application-program-card">
      <div className="application-program-card__topline">
        <span>Candidaturas abertas</span>
      </div>
      <h2>{program.name}</h2>
      {program.description && <p>{program.description}</p>}
      {(from || until) && (
        <p className="application-program-card__dates">
          <strong>Período:</strong>{' '}
          {from && until ? `${from} a ${until}` : until ? `até ${until}` : `desde ${from}`}
        </p>
      )}
      <button type="button" className="applications-primary" onClick={() => onSelect(program.id)}>
        Apresentar candidatura <span aria-hidden="true">→</span>
      </button>
    </article>
  );
}

export default function ApplicationsPage() {
  const [programsState, setProgramsState] = useState({ status: 'loading', items: [], messages: [] });
  const [programState, setProgramState] = useState({ status: 'idle', item: null, messages: [] });
  const [form, setForm] = useState(EMPTY_FORM);
  const [documents, setDocuments] = useState({});
  const [accessConditionsAccepted, setAccessConditionsAccepted] = useState(false);
  const [screen, setScreen] = useState('programs');
  const [operation, setOperation] = useState('idle');
  const [messages, setMessages] = useState([]);
  const [otp, setOtp] = useState('');
  const [otpMinutes, setOtpMinutes] = useState(10);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submission, setSubmission] = useState(null);
  const errorRef = useRef(null);
  const activeRequirements = useMemo(
    () => (programState.item?.documentRequirements || []).filter((item) => item.active),
    [programState.item]
  );

  useEffect(() => {
    document.title = 'Candidaturas — Universo Leça FC';
    document.documentElement.lang = 'pt';
    document.body.dataset.designMode = 'institutional';
    document.body.dataset.page = 'applications';

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap';
    font.dataset.applicationsHead = 'true';
    document.head.appendChild(font);

    return () => {
      font.remove();
      delete document.body.dataset.designMode;
      delete document.body.dataset.page;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    listPrograms()
      .then((result) => {
        if (!cancelled) setProgramsState({ status: 'ready', items: result?.content || [], messages: [] });
      })
      .catch((error) => {
        if (!cancelled) setProgramsState({ status: 'error', items: [], messages: getMessages(error) });
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!resendSeconds) return undefined;
    const timer = window.setInterval(() => {
      setResendSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendSeconds]);

  useEffect(() => {
    if (messages.length) errorRef.current?.focus();
  }, [messages]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const updated = { ...current, [name]: value };
      if (name === 'birthDate' && !isMinor(value)) {
        updated.guardianName = '';
        updated.guardianTaxNumber = '';
        updated.guardianEmail = '';
      }
      return updated;
    });
  }

  async function selectProgram(programId) {
    setProgramState({ status: 'loading', item: null, messages: [] });
    setScreen('form');
    setMessages([]);
    setAccessConditionsAccepted(false);
    scrollToTop();
    try {
      const result = await getProgram(programId);
      setProgramState({ status: 'ready', item: result.content, messages: [] });
    } catch (error) {
      setProgramState({ status: 'error', item: null, messages: getMessages(error) });
    }
  }

  async function refreshProgram() {
    if (!programState.item?.id) return;
    try {
      const result = await getProgram(programState.item.id);
      setProgramState((current) => ({ ...current, item: result.content }));
    } catch {
      // Mantém o formulário e a mensagem original quando a atualização falha.
    }
  }

  function returnToPrograms() {
    setScreen('programs');
    setProgramState({ status: 'idle', item: null, messages: [] });
    setForm(EMPTY_FORM);
    setDocuments({});
    setAccessConditionsAccepted(false);
    setMessages([]);
    setOtp('');
    setOperation('idle');
  }

  async function sendOtp(event) {
    event.preventDefault();
    const validationMessages = validateForm(form, programState.item, documents, accessConditionsAccepted);
    if (validationMessages.length) {
      setMessages(validationMessages);
      return;
    }

    setMessages([]);
    setOperation('submitting');
    try {
      const result = await requestApplicationOtp({
        programId: programState.item.id,
        email: form.email.trim(),
        recipientName: form.applicantFullName.trim()
      });
      setOtpMinutes(result?.content?.expiresInMinutes || 10);
      setResendSeconds(60);
      setOtp('');
      setScreen('otp');
      scrollToTop();
    } catch (error) {
      setMessages(getMessages(error));
    } finally {
      setOperation('idle');
    }
  }

  async function resendOtp() {
    if (resendSeconds || operation !== 'idle') return;
    setMessages([]);
    setOperation('submitting');
    try {
      const result = await requestApplicationOtp({
        programId: programState.item.id,
        email: form.email.trim(),
        recipientName: form.applicantFullName.trim()
      });
      setOtpMinutes(result?.content?.expiresInMinutes || 10);
      setResendSeconds(60);
      setOtp('');
    } catch (error) {
      setMessages(getMessages(error));
    } finally {
      setOperation('idle');
    }
  }

  async function submitApplication(event) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setMessages(['Introduz o código de seis algarismos recebido por email.']);
      return;
    }

    const validationMessages = validateForm(form, programState.item, documents, accessConditionsAccepted);
    if (validationMessages.length) {
      setMessages(validationMessages);
      setScreen('form');
      return;
    }

    setMessages([]);
    setOperation('encoding');
    try {
      const encodedDocuments = await Promise.all(activeRequirements
        .filter((requirement) => documents[requirement.id])
        .map(async (requirement) => {
          const file = documents[requirement.id];
          return {
            type: requirement.documentType,
            fileName: file.name,
            mimeType: file.type,
            contentBase64: await fileToBase64(file)
          };
        }));

      setOperation('submitting');
      const payload = {
        programId: programState.item.id,
        applicantFullName: form.applicantFullName.trim(),
        memberNumber: form.memberNumber.trim() || null,
        email: form.email.trim(),
        mobilePhone: form.mobilePhone.trim(),
        birthDate: form.birthDate,
        citizenCardNumber: form.citizenCardNumber.trim(),
        taxNumber: form.taxNumber.trim() || null,
        guardianName: isMinor(form.birthDate) ? form.guardianName.trim() : null,
        guardianTaxNumber: isMinor(form.birthDate) ? form.guardianTaxNumber.trim() : null,
        guardianEmail: isMinor(form.birthDate) ? form.guardianEmail.trim() : null,
        address: form.address.trim(),
        postalCode: form.postalCode.trim(),
        locality: form.locality.trim(),
        academicInstitution: form.academicInstitution.trim(),
        course: form.course.trim(),
        gradeAverage: Number(form.gradeAverage),
        additionalDataJson: null,
        documents: encodedDocuments,
        otpEmail: form.email.trim(),
        otp
      };
      const result = await confirmApplication(payload);
      setSubmission(result.content);
      setForm(EMPTY_FORM);
      setDocuments({});
      setAccessConditionsAccepted(false);
      setOtp('');
      setScreen('success');
      scrollToTop();
    } catch (error) {
      setMessages(getMessages(error));
      if (error instanceof ApplicationsApiError && error.status === 400) refreshProgram();
    } finally {
      setOperation('idle');
    }
  }

  const busy = operation !== 'idle';
  const today = new Date().toISOString().slice(0, 10);
  const applicantIsMinor = isMinor(form.birthDate);

  return (
    <main className="applications-page">
      <header className="applications-header">
        <a href="/" className="applications-brand" aria-label="Voltar ao Universo Leça FC">
          <img src="/images/leca.png" alt="Leça FC" />
        </a>
        <div>
          <p className="applications-eyebrow">Leça Futebol Clube</p>
          <h1>Candidaturas</h1>
          <p>Oportunidades para reconhecer mérito, apoiar talento e construir o futuro do clube.</p>
        </div>
      </header>

      <section className="applications-shell" aria-live="polite">
        {messages.length > 0 && (
          <div className="applications-alert applications-alert--error" ref={errorRef} tabIndex="-1" role="alert">
            <strong>Revê a informação indicada:</strong>
            <ul>{messages.map((message) => <li key={message}>{message}</li>)}</ul>
          </div>
        )}

        {screen === 'programs' && programsState.status === 'loading' && (
          <StatusPanel icon="…" title="A carregar candidaturas">
            <p>Estamos a consultar as oportunidades disponíveis.</p>
          </StatusPanel>
        )}

        {screen === 'programs' && programsState.status === 'error' && (
          <StatusPanel
            icon="!"
            title="Não foi possível carregar as candidaturas"
            action={<button type="button" className="applications-secondary" onClick={() => window.location.reload()}>Tentar novamente</button>}
          >
            <p>{programsState.messages[0]}</p>
          </StatusPanel>
        )}

        {screen === 'programs' && programsState.status === 'ready' && programsState.items.length === 0 && (
          <StatusPanel icon="○" title="Não existem candidaturas abertas">
            <p>Quando estiver disponível uma nova oportunidade, será publicada nesta página.</p>
          </StatusPanel>
        )}

        {screen === 'programs' && programsState.status === 'ready' && programsState.items.length > 0 && (
          <div className="applications-programs">
            <div className="applications-section-heading">
              <p>Programas disponíveis</p>
              <h2>Escolhe a candidatura que pretendes apresentar</h2>
            </div>
            <div className="applications-program-grid">
              {programsState.items.map((program) => (
                <ProgramCard key={program.id} program={program} onSelect={selectProgram} />
              ))}
            </div>
          </div>
        )}

        {screen === 'form' && programState.status === 'loading' && (
          <StatusPanel icon="…" title="A preparar o formulário">
            <p>Estamos a obter os requisitos atualizados desta candidatura.</p>
          </StatusPanel>
        )}

        {screen === 'form' && programState.status === 'error' && (
          <StatusPanel icon="!" title="Não foi possível abrir esta candidatura" action={<button type="button" className="applications-secondary" onClick={returnToPrograms}>Voltar às candidaturas</button>}>
            <p>{programState.messages[0]}</p>
          </StatusPanel>
        )}

        {screen === 'form' && programState.status === 'ready' && (
          <form className="application-form" onSubmit={sendOtp} noValidate>
            <div className="application-form__intro">
              <button type="button" className="applications-back" onClick={returnToPrograms}>← Todas as candidaturas</button>
              <p>Candidatura a</p>
              <h2>{programState.item.name}</h2>
              {programState.item.description && <p>{programState.item.description}</p>}
              <span>Os campos assinalados com * são obrigatórios.</span>
            </div>

            {programState.item.accessConditions?.trim() && (
              <section className="application-access-conditions" aria-labelledby="application-access-conditions-title">
                <p className="applications-eyebrow">Informação importante</p>
                <h3 id="application-access-conditions-title">Condições de candidatura</h3>
                <div className="application-access-conditions__content">
                  {programState.item.accessConditions}
                </div>
                <label className="application-access-conditions__acceptance">
                  <input
                    type="checkbox"
                    checked={accessConditionsAccepted}
                    onChange={(event) => setAccessConditionsAccepted(event.target.checked)}
                    required
                    disabled={busy}
                  />
                  <span>Li e aceito as condições de candidatura apresentadas acima.</span>
                </label>
              </section>
            )}

            <fieldset disabled={busy}>
              <legend>Dados pessoais</legend>
              <div className="application-form__grid">
                <Field label="Nome completo" name="applicantFullName" required value={form.applicantFullName} onChange={updateField} maxLength="200" autoComplete="name" />
                <Field label="Número de sócio" name="memberNumber" value={form.memberNumber} onChange={updateField} maxLength="50" autoComplete="off" />
                <Field label="Email" name="email" required type="email" value={form.email} onChange={updateField} maxLength="200" autoComplete="email" />
                <Field label="Contacto telefónico" name="mobilePhone" required type="tel" value={form.mobilePhone} onChange={updateField} maxLength="30" autoComplete="tel" />
                <Field label="Data de nascimento" name="birthDate" required type="date" value={form.birthDate} onChange={updateField} max={today} autoComplete="bday" />
                <Field label="Cartão de Cidadão" name="citizenCardNumber" required value={form.citizenCardNumber} onChange={updateField} maxLength="30" autoComplete="off" />
                <Field label="NIF" name="taxNumber" value={form.taxNumber} onChange={updateField} maxLength="20" inputMode="numeric" autoComplete="off" />
                <Field label="Morada" name="address" required value={form.address} onChange={updateField} maxLength="300" autoComplete="street-address" />
                <Field label="Código postal" name="postalCode" required value={form.postalCode} onChange={updateField} maxLength="8" placeholder="0000-000" inputMode="numeric" autoComplete="postal-code" />
                <Field label="Localidade" name="locality" required value={form.locality} onChange={updateField} maxLength="120" autoComplete="address-level2" />
              </div>
            </fieldset>

            {applicantIsMinor && (
              <fieldset className="application-guardian" disabled={busy}>
                <legend>Encarregado de educação</legend>
                <p className="application-form__section-help">Como o candidato é menor de idade, estes dados são obrigatórios.</p>
                <div className="application-form__grid">
                  <Field label="Nome do encarregado de educação" name="guardianName" required value={form.guardianName} onChange={updateField} maxLength="200" autoComplete="name" />
                  <Field label="NIF do encarregado de educação" name="guardianTaxNumber" required value={form.guardianTaxNumber} onChange={updateField} maxLength="20" inputMode="numeric" autoComplete="off" />
                  <Field label="Email do encarregado de educação" name="guardianEmail" required type="email" value={form.guardianEmail} onChange={updateField} maxLength="200" autoComplete="email" />
                </div>
              </fieldset>
            )}

            <fieldset disabled={busy}>
              <legend>Percurso académico</legend>
              <div className="application-form__grid">
                <Field label="Estabelecimento de ensino" name="academicInstitution" required value={form.academicInstitution} onChange={updateField} maxLength="200" />
                <Field label="Ano de frequência" name="course" required value={form.course} onChange={updateField} maxLength="200" placeholder="Ex.: 3.º ano" />
                <Field label="Média" name="gradeAverage" required type="number" value={form.gradeAverage} onChange={updateField} min="0" max="20" step="0.01" inputMode="decimal" hint="Valor entre 0 e 20." />
              </div>
            </fieldset>

            {activeRequirements.length > 0 && (
              <fieldset disabled={busy}>
                <legend>Documentos</legend>
                <p className="application-form__section-help">Os ficheiros são usados apenas para submeter a candidatura e não ficam guardados neste dispositivo.</p>
                <div className="application-documents">
                  {activeRequirements.map((requirement) => (
                    <div className="application-document" key={requirement.id}>
                      <label htmlFor={`document-${requirement.id}`} className="application-document__title">
                        {requirement.name}{requirement.required && <span aria-hidden="true"> *</span>}
                      </label>
                      {requirement.description && <p>{requirement.description}</p>}
                      <small id={`document-help-${requirement.id}`}>Máximo: {formatBytes(requirement.maxSizeBytes)}</small>
                      <input
                        id={`document-${requirement.id}`}
                        className="application-document__input"
                        type="file"
                        required={requirement.required}
                        accept={(requirement.allowedMimeTypes || []).join(',') || undefined}
                        aria-describedby={`document-help-${requirement.id}`}
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          setDocuments((current) => ({ ...current, [requirement.id]: file }));
                        }}
                      />
                      <div className="application-document__picker">
                        <label htmlFor={`document-${requirement.id}`} className="application-document__button">
                          {documents[requirement.id] ? 'Substituir ficheiro' : 'Selecionar ficheiro'}
                        </label>
                        <span title={documents[requirement.id]?.name || undefined}>
                          {documents[requirement.id]?.name || 'Nenhum ficheiro selecionado'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            )}

            <div className="application-privacy-note">
              <strong>Privacidade</strong>
              <p>Os dados pessoais e documentos serão enviados ao Leça Futebol Clube para análise desta candidatura. Não os guardamos no navegador.</p>
            </div>

            <button type="submit" className="applications-primary applications-primary--wide" disabled={busy}>
              {busy ? 'A enviar código…' : 'Validar email e continuar'}
            </button>
          </form>
        )}

        {screen === 'otp' && (
          <form className="applications-otp" onSubmit={submitApplication} noValidate>
            <span className="applications-status__icon" aria-hidden="true">✉</span>
            <p className="applications-eyebrow">Último passo</p>
            <h2>Confirma o teu email</h2>
            <p>Enviámos um código de seis algarismos para <strong>{form.email}</strong>. O código é válido durante {otpMinutes} minutos.</p>
            <label htmlFor="application-otp">Código de confirmação</label>
            <input
              id="application-otp"
              className="applications-otp__input"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength="6"
              autoFocus
              disabled={busy}
            />
            <button type="submit" className="applications-primary applications-primary--wide" disabled={busy || otp.length !== 6}>
              {operation === 'encoding' ? 'A preparar documentos…' : operation === 'submitting' ? 'A submeter candidatura…' : 'Submeter candidatura'}
            </button>
            <div className="applications-otp__actions">
              <button type="button" className="applications-link" onClick={() => { setScreen('form'); setMessages([]); }} disabled={busy}>Corrigir dados</button>
              <button type="button" className="applications-link" onClick={resendOtp} disabled={busy || resendSeconds > 0}>
                {resendSeconds > 0 ? `Reenviar em ${resendSeconds}s` : 'Reenviar código'}
              </button>
            </div>
          </form>
        )}

        {screen === 'success' && (
          <StatusPanel icon="✓" title="Candidatura submetida">
            <p>A candidatura foi recebida e encontra-se com o estado <strong>Submetida</strong>.</p>
            <div className="applications-reference">
              <span>Referência da candidatura</span>
              <strong>{submission?.referenceCode}</strong>
            </div>
            <p>Guarda esta referência. Não existe consulta pública do estado da candidatura.</p>
          </StatusPanel>
        )}
      </section>

      <div className="applications-home-link">
        <a href="/">← Voltar ao início</a>
      </div>

      <footer className="applications-footer">
        <p>Vive a paixão do Leça FC.</p>
        <p>Contacta: <a href="mailto:geral@lecafc.pt">geral@lecafc.pt</a></p>
        <p>© {new Date().getFullYear()} Leça Futebol Clube — Candidaturas.</p>
      </footer>
    </main>
  );
}
