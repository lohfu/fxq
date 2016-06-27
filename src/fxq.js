import isArray from 'is-array';
// Copied from jQuery 2.2.1 (i think) 2016-03-05. And then simplified.

const queues = new Map(),
  hooks = new Map();

module.exports = {
  finish(elem) {
    const hooks = this._queueHooks(elem);

    // Empty the queue first
    this.queue(elem, []);

    if (hooks && hooks.stop) {
      hooks.stop.call(this, true);
    }
  },

  queue(elem, data) {
    let queue;

    if (elem) {
      queue = queues.get(elem);

      // Speed up dequeue by getting out quickly if this is just a lookup
      if (data) {
        if (!queue || isArray(data)) {
          // TODO better makeArray
          queue = isArray(data) ? data : [ data ];
          queues.set(elem, queue);
        } else {
          queue.push(data);
        }
      }

        // Ensure a hooks for this queue
      this._queueHooks(elem);

      if (queue[0] !== 'inprogress') {
        this.dequeue(elem);
      }

      return queue || [];
    }
  },

  dequeue(elem, type) {
    const queue = queues.get(elem) || [],
      hooks = this._queueHooks(elem),
      next = () => {
        this.dequeue(elem);
      };

    let fn = queue.shift(),
      startLength = queue.length;

    // If the fx queue is dequeued, always remove the progress sentinel
    if (fn === 'inprogress') {
      fn = queue.shift();
      startLength--;
    }

    if (fn) {
      // Add a progress sentinel to prevent the fx queue from being
      // automatically dequeued
      queue.unshift('inprogress');

      // Clear up the last queue stop function
      delete hooks.stop;

      fn.call(elem, next, hooks);
    }

    if (!startLength && hooks) {
      hooks.empty();
    }
  },

  // Not public - generate a queueHooks object, or return the current one
  _queueHooks(elem) {
    let hook = hooks.get(elem);

    if (!hook) {
      // NOTE: this has changed from jQuery's implementation. they used
      // empty: $.Callbacks( "once memory" ).add( function() {
      hook = {
        empty() {
          queues.delete(elem);
          hooks.delete(elem);
        }
      };
      hooks.set(elem, hook);
    }

    return hook;
  }
};
