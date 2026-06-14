document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('mortgageForm');
  const clearBtn = document.getElementById('clearBtn');
  const resultsEmpty = document.getElementById('resultsEmpty');
  const resultsCompleted = document.getElementById('resultsCompleted');
  const monthlyResult = document.getElementById('monthlyResult');
  const totalResult = document.getElementById('totalResult');

  // Elementos de erro
  const amountError = document.getElementById('amountError');
  const termError = document.getElementById('termError');
  const rateError = document.getElementById('rateError');
  const typeError = document.getElementById('typeError');

  // Inputs
  const amountInput = document.getElementById('amount');
  const termInput = document.getElementById('term');
  const rateInput = document.getElementById('rate');
  const typeRadios = document.getElementsByName('type');

  // Função para formatar valor monetário
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  // Função para remover formatação e obter número
  function parseNumberInput(value) {
    // Remove tudo que não for dígito ou ponto
    return value.replace(/[^0-9.]/g, '');
  }

  // Validação do formulário
  function validateForm() {
    let isValid = true;

    // Limpa estados de erro anteriores
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('form-group--error');
    });

    // Valida Amount
    const amountValue = amountInput.value.trim();
    if (amountValue === '' || isNaN(parseFloat(amountValue)) || parseFloat(amountValue) <= 0) {
      amountInput.closest('.form-group').classList.add('form-group--error');
      isValid = false;
    }

    // Valida Term
    const termValue = termInput.value.trim();
    if (termValue === '' || isNaN(parseInt(termValue)) || parseInt(termValue) <= 0) {
      termInput.closest('.form-group').classList.add('form-group--error');
      isValid = false;
    }

    // Valida Rate
    const rateValue = rateInput.value.trim();
    if (rateValue === '' || isNaN(parseFloat(rateValue)) || parseFloat(rateValue) <= 0) {
      rateInput.closest('.form-group').classList.add('form-group--error');
      isValid = false;
    }

    // Valida Mortgage Type
    const typeSelected = document.querySelector('input[name="type"]:checked');
    if (!typeSelected) {
      document.querySelector('.form-group--radio').classList.add('form-group--error');
      isValid = false;
    }

    return isValid;
  }

  // Cálculo das parcelas
  function calculateRepayment(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;

    if (monthlyRate === 0) {
      return principal / numberOfPayments;
    }

    const compounded = Math.pow(1 + monthlyRate, numberOfPayments);
    return (principal * monthlyRate * compounded) / (compounded - 1);
  }

  function calculateInterestOnly(principal, annualRate, years) {
    const monthlyRate = annualRate / 100 / 12;
    const numberOfPayments = years * 12;
    const monthlyInterest = principal * monthlyRate;
    const totalRepayment = monthlyInterest * numberOfPayments + principal;
    return { monthly: monthlyInterest, total: totalRepayment };
  }

  // Exibe resultados
  function showResults(monthly, total) {
    monthlyResult.textContent = formatCurrency(monthly);
    totalResult.textContent = formatCurrency(total);
    resultsEmpty.classList.add('hidden');
    resultsCompleted.classList.remove('hidden');
  }

  // Reseta para estado vazio
  function resetResults() {
    resultsEmpty.classList.remove('hidden');
    resultsCompleted.classList.add('hidden');
  }

  // Limpa todos os campos e resultados
  function clearAll() {
    form.reset();
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('form-group--error');
    });
    resetResults();
  }

  // Evento de submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const principal = parseFloat(amountInput.value.replace(/,/g, ''));
    const years = parseInt(termInput.value);
    const annualRate = parseFloat(rateInput.value);
    const type = document.querySelector('input[name="type"]:checked').value;

    let monthly, total;

    if (type === 'repayment') {
      monthly = calculateRepayment(principal, annualRate, years);
      total = monthly * years * 12;
    } else {
      const result = calculateInterestOnly(principal, annualRate, years);
      monthly = result.monthly;
      total = result.total;
    }

    showResults(monthly, total);
  });

  // Evento do botão Clear All
  clearBtn.addEventListener('click', clearAll);

  // Permite apenas números e ponto nos inputs (filtro básico)
  [amountInput, termInput, rateInput].forEach(input => {
    input.addEventListener('input', (e) => {
      // Para term, permite apenas números inteiros
      if (input === termInput) {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      } else {
        // Para amount e rate, permite números e um ponto decimal
        e.target.value = e.target.value.replace(/[^0-9.]/g, '');
      }
    });
  });

  // Remove erro ao interagir com os campos
  document.querySelectorAll('.form-input, .radio-input').forEach(el => {
    el.addEventListener('input', () => {
      el.closest('.form-group')?.classList.remove('form-group--error');
    });
    el.addEventListener('change', () => {
      el.closest('.form-group')?.classList.remove('form-group--error');
    });
  });
});