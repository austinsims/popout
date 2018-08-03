import {
  Counter,
  Indicator,
  Message,
  MessageType,
  listenForData,
  store,
  synchronize,
} from './common.js';

/**
 * @param {!Window} w
 * @return {!Promise<!function(!Message)>}
 */
function ack(w) {
  const promise = new Promise((resolve, reject) => {
    function post(message) {
      w.postMessage(message, '*');
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
      store.commit('connect')
      synchronize(post);
      resolve(post);
    });
  });
  return promise;
}

const vue = new Vue({ el: '#root' });

listenForData();

const parent = ack(window.opener || window.parent);
