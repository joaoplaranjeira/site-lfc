(function () {
  'use strict';

  var API_BASE_URL = 'https://otw-clevvo-api-members-89a7e45743a6.herokuapp.com/api';
  var MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;
  var state = { districts: [], municipalities: [], athleticsSportId: null, otpEmail: '', document: null };

  function byId(id) { return document.getElementById(id); }

  function setFormLoading(isLoading) {
    byId('registration-loading').classList.toggle('hidden', !isLoading);
    byId('registration-content').classList.toggle('hidden', isLoading);
  }

  function showPageError(message) {
    byId('registration-error-text').textContent = message;
    byId('registration-error').classList.remove('hidden');
    byId('registration-loading').classList.add('hidden');
    byId('registration-content').classList.add('hidden');
  }

  function setError(id, message) {
    var box = byId(id);
    box.textContent = message || '';
    box.classList.toggle('hidden', !message);
  }

  function setButtonLoading(id, loading, label) {
    var button = byId(id);
    if (!button.dataset.originalHtml) button.dataset.originalHtml = button.innerHTML;
    button.disabled = loading;
    button.classList.toggle('opacity-70', loading);
    button.classList.toggle('cursor-not-allowed', loading);
    button.innerHTML = loading ? '<i class="fa-solid fa-spinner fa-spin"></i> ' + label : button.dataset.originalHtml;
  }

  function selectedValue(name) {
    var selected = document.querySelector('input[name="' + name + '"]:checked');
    return selected ? selected.value : null;
  }

  function openOtpModal() {
    byId('otp-modal').classList.remove('hidden');
    byId('otpCode').focus();
  }

  function closeOtpModal() {
    byId('otp-modal').classList.add('hidden');
    byId('request-otp-btn').focus();
  }

  function updateRegistrationReadiness() {
    var form = byId('athlete-registration-form');
    var dataAccepted = selectedValue('confirmsDataAccuracy') === 'true';
    var regulationAccepted = selectedValue('acceptsAthleticsRegulation') === 'true';
    var dataDeclined = selectedValue('confirmsDataAccuracy') === 'false';
    var regulationDeclined = selectedValue('acceptsAthleticsRegulation') === 'false';

    byId('data-accuracy-message').classList.toggle('hidden', !dataDeclined);
    byId('regulation-message').classList.toggle('hidden', !regulationDeclined);
    byId('request-otp-btn').disabled = !form.checkValidity() || !dataAccepted || !regulationAccepted;
  }

  function getErrorMessage(payload, fallback) {
    if (!payload) return fallback;
    if (typeof payload === 'string') return payload;
    if (payload.message) return payload.message;
    if (Array.isArray(payload.validationMessages) && payload.validationMessages.length) return payload.validationMessages.map(function (item) { return item.message || item; }).join(' ');
    if (Array.isArray(payload.errors) && payload.errors.length) return payload.errors.join(' ');
    return fallback;
  }

  async function apiRequest(path, options) {
    var response;
    try {
      response = await fetch(API_BASE_URL + path, options);
    } catch (error) {
      throw new Error('Não foi possível contactar o serviço de inscrições. Tenta novamente mais tarde.');
    }
    var payload = await response.json().catch(function () { return null; });
    if (!response.ok || !payload || payload.success === false) throw new Error(getErrorMessage(payload, 'Não foi possível processar o pedido.'));
    return payload;
  }

  function addOptions(select, values, placeholder) {
    select.replaceChildren();
    var firstOption = document.createElement('option');
    firstOption.value = '';
    firstOption.textContent = placeholder;
    select.appendChild(firstOption);
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = String(value.id);
      option.textContent = value.name;
      select.appendChild(option);
    });
  }

  function loadMunicipalityOptions(selectId, districtId) {
    var select = byId(selectId);
    var items = state.municipalities.filter(function (item) { return String(item.districtId) === String(districtId); });
    addOptions(select, items, items.length ? 'Seleciona o concelho' : 'Sem concelhos disponíveis');
    select.disabled = !districtId || !items.length;
  }

  function setGuardianFieldsEnabled(enabled) {
    byId('guardian-fields').querySelectorAll('input, select').forEach(function (field) {
      field.disabled = !enabled;
      field.required = enabled;
    });
    if (enabled) loadMunicipalityOptions('guardianMunicipalityId', byId('guardianDistrictId').value);
  }

  function getAge(birthDate) {
    if (!birthDate) return false;
    var birth = new Date(birthDate + 'T00:00:00');
    if (Number.isNaN(birth.getTime())) return null;
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var anniversary = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (today < anniversary) age -= 1;
    return age;
  }

  function setBirthDateLimit() {
    var latest = new Date();
    latest.setFullYear(latest.getFullYear() - 6);
    byId('birthDate').max = latest.toISOString().slice(0, 10);
  }

  function validateBirthDate() {
    var input = byId('birthDate');
    var age = getAge(input.value);
    var isTooYoung = age !== false && age !== null && age <= 5;
    input.setCustomValidity(isTooYoung ? 'A inscrição é válida apenas para atletas com idade superior a 5 anos.' : '');
    byId('birth-date-error').classList.toggle('hidden', !isTooYoung);
    return !isTooYoung;
  }

  function formatPostalCode(input) {
    var digits = input.value.replace(/\D/g, '').slice(0, 7);
    input.value = digits.length > 4 ? digits.slice(0, 4) + '-' + digits.slice(4) : digits;
  }

  function isMinor(birthDate) {
    var age = getAge(birthDate);
    return age !== false && age !== null && age < 18;
  }

  function updateGuardianSection() {
    validateBirthDate();
    var applies = isMinor(byId('birthDate').value);
    byId('guardian-section').classList.toggle('hidden', !applies);
    setGuardianFieldsEnabled(applies);
    updateRegistrationReadiness();
  }

  function importGuardianValue(sourceId, targetId) {
    var source = byId(sourceId);
    var target = byId(targetId);
    if (!source || !target) return;

    if (sourceId === 'municipalityId') {
      byId('guardianDistrictId').value = byId('districtId').value;
      loadMunicipalityOptions('guardianMunicipalityId', byId('districtId').value);
    }

    target.value = source.value;
    if (sourceId === 'districtId') loadMunicipalityOptions('guardianMunicipalityId', source.value);
    updateRegistrationReadiness();
  }

  function importGuardianAddress() {
    ['address', 'postalCode', 'locality'].forEach(function (id) {
      byId('guardian' + id.charAt(0).toUpperCase() + id.slice(1)).value = byId(id).value;
    });
    byId('guardianDistrictId').value = byId('districtId').value;
    loadMunicipalityOptions('guardianMunicipalityId', byId('districtId').value);
    byId('guardianMunicipalityId').value = byId('municipalityId').value;
    updateRegistrationReadiness();
  }

  function normalise(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  async function loadReferences() {
    try {
      var results = await Promise.all([
        apiRequest('/athletes/reference/sports'),
        apiRequest('/athletes/reference/districts'),
        apiRequest('/athletes/reference/municipalities')
      ]);
      var sports = results[0].content || [];
      state.districts = results[1].content || [];
      state.municipalities = results[2].content || [];
      var athletics = sports.find(function (sport) { return normalise(sport.name) === 'atletismo'; });
      if (!athletics) throw new Error('A modalidade de Atletismo não está disponível para inscrição neste momento.');
      state.athleticsSportId = athletics.id;
      addOptions(byId('districtId'), state.districts, 'Seleciona o distrito');
      addOptions(byId('guardianDistrictId'), state.districts, 'Seleciona o distrito');
      setFormLoading(false);
    } catch (error) {
      showPageError(error.message || 'Não foi possível preparar o formulário de inscrição.');
    }
  }

  function readDocument(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('Não foi possível ler o documento selecionado.')); };
      reader.onload = function () {
        var result = String(reader.result || '');
        resolve(result.slice(result.indexOf(',') + 1));
      };
      reader.readAsDataURL(file);
    });
  }

  async function getDocumentPayload() {
    var file = byId('citizenCardDocument').files[0];
    if (!file) throw new Error('Anexa o Cartão de Cidadão.');
    if (file.size > MAX_DOCUMENT_BYTES) throw new Error('O documento não pode exceder 10 MB.');
    if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) throw new Error('O documento deve estar em PDF, JPG ou PNG.');
    if (!state.document || state.document.file !== file) state.document = { file: file, contentBase64: await readDocument(file) };
    return { type: 1, fileName: file.name, mimeType: file.type, contentBase64: state.document.contentBase64 };
  }

  async function buildRegistrationPayload() {
    var guardianOpen = !byId('guardian-section').classList.contains('hidden');
    var documents = [await getDocumentPayload()];
    var payload = {
      fullName: byId('fullName').value.trim(), address: byId('address').value.trim(), postalCode: byId('postalCode').value.trim(), locality: byId('locality').value.trim(),
      districtId: Number(byId('districtId').value), municipalityId: Number(byId('municipalityId').value), mobilePhone: byId('mobilePhone').value.trim(), email: byId('email').value.trim(),
      citizenCardNumber: byId('citizenCardNumber').value.trim(), birthDate: byId('birthDate').value, taxNumber: byId('taxNumber').value.trim(), sportIds: [state.athleticsSportId], documents: documents, guardians: [],
      acceptsImageUsage: selectedValue('acceptsImageUsage') === 'true',
      acceptsInternalCommunications: selectedValue('acceptsInternalCommunications') === 'true'
    };
    if (guardianOpen) {
      payload.guardians.push({
        fullName: byId('guardianFullName').value.trim(), address: byId('guardianAddress').value.trim(), postalCode: byId('guardianPostalCode').value.trim(), locality: byId('guardianLocality').value.trim(),
        districtId: Number(byId('guardianDistrictId').value), municipalityId: Number(byId('guardianMunicipalityId').value), mobilePhone: byId('guardianMobilePhone').value.trim(), email: byId('guardianEmail').value.trim(), citizenCardNumber: byId('guardianCitizenCardNumber').value.trim()
      });
    }
    return payload;
  }

  async function handleRequestOtp(event) {
    event.preventDefault();
    setError('step1-error', '');
    updateRegistrationReadiness();
    if (byId('request-otp-btn').disabled) {
      setError('step1-error', 'Preenche todos os campos obrigatórios e confirma os consentimentos necessários para avançar.');
      return;
    }
    if (!event.currentTarget.reportValidity()) return;
    setButtonLoading('request-otp-btn', true, 'A enviar...');
    try {
      await getDocumentPayload();
      var email = byId('email').value.trim();
      await apiRequest('/public/athlete-registration/request-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email, recipientName: byId('fullName').value.trim() }) });
      state.otpEmail = email;
      byId('otp-info').textContent = 'Enviámos um código de 6 dígitos para ' + email + '.';
      byId('otpCode').value = '';
      setError('step2-error', '');
      openOtpModal();
    } catch (error) {
      setError('step1-error', error.message || 'Não foi possível pedir o código.');
    } finally {
      setButtonLoading('request-otp-btn', false, 'A enviar...');
      updateRegistrationReadiness();
    }
  }

  async function handleConfirmOtp(event) {
    event.preventDefault();
    setError('step2-error', '');
    if (!state.otpEmail || !event.currentTarget.reportValidity()) return;
    if (!byId('athlete-registration-form').reportValidity()) return;
    updateRegistrationReadiness();
    if (byId('request-otp-btn').disabled) {
      setError('step2-error', 'Confirma os consentimentos necessários para concluir a inscrição.');
      return;
    }
    setButtonLoading('confirm-otp-btn', true, 'A confirmar...');
    try {
      var payload = await buildRegistrationPayload();
      payload.otpEmail = state.otpEmail;
      payload.otp = byId('otpCode').value.trim();
      var response = await apiRequest('/public/athlete-registration/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (response.content && response.content.existing === true) {
        throw new Error('Não foi possível processar o pedido. Verifique os seus dados.');
      }
      byId('athlete-registration-form').classList.add('hidden');
      byId('otp-modal').classList.add('hidden');
      byId('registration-success').classList.remove('hidden');
    } catch (error) {
      setError('step2-error', error.message || 'Não foi possível confirmar a inscrição.');
    } finally {
      setButtonLoading('confirm-otp-btn', false, 'A confirmar...');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.form-input').forEach(function (element) { element.classList.add('w-full', 'rounded-lg', 'border', 'border-gray-300', 'px-3', 'py-2', 'text-sm', 'focus:outline-none', 'focus:ring-2', 'focus:ring-emerald-600', 'focus:border-emerald-600'); });
    byId('districtId').addEventListener('change', function () { loadMunicipalityOptions('municipalityId', this.value); });
    byId('guardianDistrictId').addEventListener('change', function () { loadMunicipalityOptions('guardianMunicipalityId', this.value); });
    byId('birthDate').addEventListener('input', updateGuardianSection);
    byId('birthDate').addEventListener('change', updateGuardianSection);
    ['postalCode', 'guardianPostalCode'].forEach(function (id) {
      byId(id).addEventListener('input', function () {
        formatPostalCode(this);
        updateRegistrationReadiness();
      });
    });
    document.querySelectorAll('.guardian-import[data-source]').forEach(function (button) {
      button.addEventListener('click', function () {
        importGuardianValue(this.dataset.source, this.dataset.target);
      });
    });
    byId('guardian-address-import').addEventListener('click', importGuardianAddress);
    document.querySelectorAll('.regulation-link[aria-disabled="true"]').forEach(function (link) {
      link.addEventListener('click', function (event) { event.preventDefault(); });
    });
    byId('citizenCardDocument').addEventListener('change', function () { state.document = null; });
    byId('athlete-registration-form').addEventListener('submit', handleRequestOtp);
    byId('otp-form').addEventListener('submit', handleConfirmOtp);
    document.querySelectorAll('[data-close-otp-modal]').forEach(function (button) {
      button.addEventListener('click', closeOtpModal);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !byId('otp-modal').classList.contains('hidden')) closeOtpModal();
    });
    byId('athlete-registration-form').addEventListener('input', updateRegistrationReadiness);
    byId('athlete-registration-form').addEventListener('change', updateRegistrationReadiness);
    setBirthDateLimit();
    updateGuardianSection();
    loadReferences();
  });
})();
