const numeroLimite = 10;
let listaDeNumerosSorteados = [];
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1;

// ELEMENTOS
const campoChute = document.getElementById('campoChute');
const botaoChutar = document.getElementById('btnChutar');
const botaoReiniciar = document.getElementById('reiniciar');
const tentativasSpan = document.getElementById('tentativasAtual');
const melhorResultadoSpan = document.getElementById('melhorResultado');
const historicoLista = document.getElementById('historicoChutes');
const historyCount = document.getElementById('historyCount');
const hintText = document.getElementById('hintText');
const mensagemPrincipal = document.getElementById('mensagemPrincipal');
const feedbackSecundario = document.getElementById('feedbackSecundario');

// TEXTO + VOZ
function exibirTextoNaTela(tagSelector, texto) {
  const campo = document.querySelector(tagSelector);
  if (!campo) return;

  campo.innerHTML = texto;

  if (window.responsiveVoice && responsiveVoice.speak) {
    responsiveVoice.speak(texto, 'Brazilian Portuguese Female', { rate: 1.12 });
  }
}

function exibirMensagemInicial() {
  exibirTextoNaTela('h1', 'Adivinhe o <span class="card-highlight">número secreto</span>');
  mensagemPrincipal.textContent = `Escolha um número entre 1 e ${numeroLimite}`;
  feedbackSecundario.textContent = '';
  hintText.textContent = 'Você ainda não chutou. Comece o jogo!';
}

// NÚMERO ALEATÓRIO SEM REPETIÇÃO ATÉ PERCORRER TODOS
function gerarNumeroAleatorio() {
  const quantidadeDeElementosNaLista = listaDeNumerosSorteados.length;

  if (quantidadeDeElementosNaLista === numeroLimite) {
    listaDeNumerosSorteados = [];
  }

  const numeroEscolhido = parseInt(Math.random() * numeroLimite + 1, 10);

  if (listaDeNumerosSorteados.includes(numeroEscolhido)) {
    return gerarNumeroAleatorio();
  } else {
    listaDeNumerosSorteados.push(numeroEscolhido);
    return numeroEscolhido;
  }
}

// STATUS / HISTÓRICO

function atualizarTentativas() {
  tentativasSpan.textContent = tentativas;
  historyCount.textContent = `${tentativas - 1} tentativa${tentativas - 1 === 1 ? '' : 's'}`;
}

function carregarMelhorResultado() {
  const melhor = localStorage.getItem('melhorResultadoNumeroSecreto');
  if (melhor) {
    melhorResultadoSpan.textContent = `${melhor} tentativa${melhor === '1' ? '' : 's'}`;
  } else {
    melhorResultadoSpan.textContent = '—';
  }
}

function salvarMelhorResultado() {
  const melhorAtual = localStorage.getItem('melhorResultadoNumeroSecreto');
  if (!melhorAtual || tentativas < parseInt(melhorAtual, 10)) {
    localStorage.setItem('melhorResultadoNumeroSecreto', tentativas.toString());
    carregarMelhorResultado();
  }
}

function limparHistorico() {
  historicoLista.innerHTML = '<li class="history-empty">Nenhum chute ainda.</li>';
  historyCount.textContent = '0 tentativas';
}

function adicionarChuteAoHistorico(chute, tipo) {
  if (historicoLista.querySelector('.history-empty')) {
    historicoLista.innerHTML = '';
  }

  const li = document.createElement('li');
  let dicaTexto = '';

  if (tipo === 'maior') {
    dicaTexto = 'O número secreto é maior.';
    li.classList.add('history-item-maior');
  } else if (tipo === 'menor') {
    dicaTexto = 'O número secreto é menor.';
    li.classList.add('history-item-menor');
  } else if (tipo === 'acertou') {
    dicaTexto = 'Você acertou!';
    li.classList.add('history-item-acertou');
  }

  li.innerHTML = `
    <span>${chute}</span>
    <small>${dicaTexto}</small>
  `;

  // Novo chute vai para o topo
  historicoLista.prepend(li);
}

// DICA QUENTE/FRIO SIMPLES
function atualizarDicaTemperatura(chute) {
  const diff = Math.abs(chute - numeroSecreto);

  if (diff === 0) {
    hintText.textContent = 'Perfeito! Você encontrou o número secreto. 🏆';
    return;
  }

  if (diff === 1) {
    hintText.textContent = 'Quase lá! Você está MUITO perto. 🔥';
  } else if (diff <= 3) {
    hintText.textContent = 'Você está quente, continue tentando! ♨️';
  } else {
    hintText.textContent = 'Você ainda está longe. Ajuste bem seu próximo chute. ❄️';
  }
}

// LÓGICA PRINCIPAL

function verificarChute() {
  const valor = campoChute.value.trim();
  const chute = Number(valor);

  if (!valor || Number.isNaN(chute)) {
    feedbackSecundario.textContent = 'Digite um número válido.';
    return;
  }

  if (chute < 1 || chute > numeroLimite) {
    feedbackSecundario.textContent = `O número deve estar entre 1 e ${numeroLimite}.`;
    return;
  }

  feedbackSecundario.textContent = '';

  if (chute === numeroSecreto) {
    exibirTextoNaTela('h1', 'Acertou! 🏆');
    const palavraTentativa = tentativas > 1 ? 'tentativas' : 'tentativa';
    mensagemPrincipal.textContent = `Você descobriu o número secreto com ${tentativas} ${palavraTentativa}.`;
    adicionarChuteAoHistorico(chute, 'acertou');
    atualizarDicaTemperatura(chute);
    salvarMelhorResultado();
    botaoReiniciar.disabled = false;
    botaoChutar.disabled = true;
  } else {
    if (chute > numeroSecreto) {
      mensagemPrincipal.textContent = 'O número secreto é menor.';
      adicionarChuteAoHistorico(chute, 'menor');
    } else {
      mensagemPrincipal.textContent = 'O número secreto é maior.';
      adicionarChuteAoHistorico(chute, 'maior');
    }

    atualizarDicaTemperatura(chute);

    tentativas++;
    atualizarTentativas();
    limparCampo();
  }
}

function limparCampo() {
  campoChute.value = '';
  campoChute.focus();
}

function reiniciarJogo() {
  numeroSecreto = gerarNumeroAleatorio();
  tentativas = 1;
  atualizarTentativas();
  exibirMensagemInicial();
  limparCampo();
  limparHistorico();
  botaoReiniciar.disabled = true;
  botaoChutar.disabled = false;
}

// EVENTOS

botaoChutar.addEventListener('click', verificarChute);
botaoReiniciar.addEventListener('click', reiniciarJogo);

campoChute.addEventListener('keyup', (evento) => {
  if (evento.key === 'Enter') {
    verificarChute();
  }
});

// INICIALIZAÇÃO

exibirMensagemInicial();
carregarMelhorResultado();
atualizarTentativas();
limparHistorico();
campoChute.focus();