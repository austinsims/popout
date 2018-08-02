import {
  Counter,
  Indicator,
  Message,
  MessageType,
  listenForData,
  store,
  synchronize,
} from './common.js';

const vue = new Vue({ el: '#root' });

listenForData();

// Initiate three way handshake to child.
const child = new Promise((resolve, reject) => {
  const iframe = document.querySelector('iframe');

  function post(message) {
    iframe.contentWindow.postMessage(message, '*');
  }

  const interval = setInterval(() => {
    post(new Message({type: MessageType.SYN}));
  }, 100);

  window.addEventListener('message', evt => {
    if (evt.data.type !== MessageType.SYNACK) {
      return;
    }
    clearInterval(interval);
    post(new Message({type: MessageType.ACK}));
    resolve(post);
  });
});

child.then(() => store.commit('connect'));

child.then(post => {
  synchronize(post);

  // Load initial data from server.
  fetch('/data')
    .then(response => response.json())
    .then(json => {
      store.commit('set', json.count);
    });
});

