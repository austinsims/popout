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
function syn(w) {
  const promise = new Promise((resolve, reject) => {
    function post(message) { 
      w.postMessage(message, '*');
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
      store.commit('connect');
      synchronize(post);
      resolve(post);
    });
  });
  return promise;
}

let child = null;
let win = null;

const vue = new Vue({
  el: '#root',
  data: {
    popped: false,
  },
  methods: {
    handlePopoutClick() {
      store.commit('disconnect');
      if (this.popped) {
        store.commit('disconnect');
        win.close();
        child = null;
        win = null;
        this.popped = false;
        // Allow Vue to re-render the iframe, then pop back into it.
        setTimeout(() => {
          win = document.querySelector('iframe').contentWindow;
          child = syn(win);
        }, 0);
      } else {
        store.commit('disconnect');
        child = null;
        win = window.open('./popout.html');
        child = syn(win);
        this.popped = true;
      }
    },
  },
});

listenForData();

child = syn(document.querySelector('iframe').contentWindow);

child.then(post => {
  // Load initial data from server.
  fetch('/data')
    .then(response => response.json())
    .then(json => {
      store.commit('set', json.count);
    });
});
