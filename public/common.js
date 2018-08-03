export const MessageType = {
  SYN: 'syn',
  SYNACK: 'syn-ack',
  ACK: 'ack',
  DATA: 'data',
};

export class Message {
  constructor({type, payload = null}) {
    this.type = type;
    this.payload = payload;
  }
}

export const store = new Vuex.Store({
  state: {
    count: null,
    connected: false,
  },
  mutations: {
    inc(state) { state.count++; },
    dec(state) { state.count--; },
    set(state, count) { state.count = count; },
    connect(state) { state.connected = true; },
    disconnect(state) { state.connected = false; },
  },
});

export const Counter = Vue.component('x-counter', {
  computed: {
    count() { return store.state.count; },
  },
  template: `
    <div>
      <button v-on:click="dec"> - </button>
      <span>{{ count }}</span>
      <button v-on:click="inc"> + </button>
    </div>
  `,
  methods: {
    inc() { store.commit('inc'); },
    dec() { store.commit('dec') },
  },
});

export const Indicator = Vue.component('x-indicator', {
  computed: {
    connected() { return store.state.connected; },
  },
  template: `
    <span class="dot"
          v-bind:class="{ red: !connected, green: connected }"></span>
  `,
});

/**
 * When the store is updated, post a DATA message to other frame.
 * @param {!function(!Message)} post
 */
export function synchronize(post) {
  let last;
  function onUpdate(state) {
    if (typeof state.count !== 'number') {
      return;
    }
    if (state.count === last) {
      return;
    }
    last = state.count;
    post(new Message({
      type: MessageType.DATA,
      payload: state.count,
    }));
  }
  onUpdate(store.state);
  store.subscribe((_, state) => onUpdate(state));
}

/** Listen to updates from the other frame, updating store. */
export function listenForData() {
  window.addEventListener('message', evt => {
    if (evt.data.type !== MessageType.DATA) {
      return;
    }
    store.commit('set', evt.data.payload);
  });
}