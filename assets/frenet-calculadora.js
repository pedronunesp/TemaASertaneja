document.addEventListener('DOMContentLoaded', function () {
  console.log('DOM totalmente carregado.');
  const button = document.getElementById('calculate-freight-btn');
  const resultsContainer = document.querySelector('.results-grid');
  const cepDisplay = document.getElementById('cep-display');
  const loadingSpinner = document.querySelector('.loading-spinner');
  const quantityInput = document.getElementById('number');

  if (!button) {
    console.error('Botão "Calcular Frete" não encontrado.');
    return;
  }

  button.addEventListener('click', async function () {
    const cepInput = document.getElementById('cep-input').value.replace(/\D/g, '');

    if (cepInput.length !== 8) {
      showError('CEP inválido. Digite 8 números.');
      return;
    }

    const quantity = parseInt(quantityInput.value) || 1;

    toggleLoading(true);

    try {
      const requestData = {
        SellerCEP: parseFloat(window.productData.sellercep) || 35500006,
        RecipientCEP: cepInput,
        ShipmentInvoiceValue: parseFloat(window.productData.price),
        ShippingItemArray: [{
          Height: parseFloat(window.productData.height) || 10,
          Length: parseFloat(window.productData.length) || 20,
          Quantity: quantity,
          Weight: parseFloat(window.productData.weight) || 1,
          Width: parseFloat(window.productData.width) || 15
        }]
      };

      console.log('Dados enviados para a API:', requestData);

      const response = await fetch('https://serverfrnt.vercel.app/api/frenet-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      
      if (response.ok && data.ShippingSevicesArray?.length > 0) {
        const validServices = data.ShippingSevicesArray.filter(service => {
          const price = Number(service.ShippingPrice);
          return !isNaN(price) && price > 0;
        });

        if (validServices.length > 0) {
          displayResults(validServices, cepInput, data.City);
        } else {
          showError('Nenhuma opção de frete disponível para o CEP informado.');
        }
      } else {
        showError('Nenhuma opção de frete disponível para o CEP informado.');
      }

    } catch (error) {
      console.error('Erro ao calcular o frete:', error);
      showError('Ocorreu um erro ao calcular o frete. Tente novamente mais tarde.');
    } finally {
      toggleLoading(false);
    }
  });

  function displayResults(services, cep, city) {
    resultsContainer.innerHTML = '';
    
    resultsContainer.innerHTML += `<div class="cep-info-highlight"><span class="cep-highlight">${cep} - ${city}</span></div>`;

    services.forEach((service, index) => {
      const option = document.createElement('div');
      option.className = 'shipping-option';
      
      const shippingPrice = Number(service.ShippingPrice).toFixed(2);

      option.innerHTML = `
        <div class="shipping-icon" data-carrier="${service.Carrier}">${getCarrierIcon(service.Carrier)}</div>
        <div class="option-details">
          <div class="shipping-method">${service.ServiceDescription}</div>
          <div class="shipping-info">
            <span>🕒 ${service.DeliveryTime} dias úteis</span>
            <span>📦 ${service.Carrier}</span>
          </div>
        </div>
        <div class="shipping-price">R$ ${shippingPrice}</div>
      `;

      resultsContainer.appendChild(option);
    });

    document.getElementById('freight-results').style.display = 'block';
  }

  function toggleLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
  }

  function showError(message) {
    resultsContainer.innerHTML = `<div class="shipping-error">${message}</div>`;
    document.getElementById('freight-results').style.display = 'block';
  }

  function getCarrierIcon(carrier) {
    const icons = {
      'Correios': '🚚',
      'Azul': '✈️',
      'Jadlog': '📮',
      'DHL': '📦',
      'Default': '🚛'
    };
    return icons[carrier] || icons.Default;
  }
});
