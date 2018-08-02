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

// Respond to three way handshake from parent.
const parent = new Promise((resolve, reject) => {
  function post(message) {
    window.parent.postMessage(message, '*');
  }

  window.addEventListener('message', evt => {
    if (evt.data.type !== MessageType.SYN) {
      return;
    }
    post(new Message({type: MessageType.SYNACK}));
  });

  window.addEventListener('message', evt => {
    if (evt.data.type !== MessageType.ACK) {
      return;
    }
    resolve(post);
  });
});

parent.then(() => store.commit('connect'));
parent.then(post => synchronize(post));