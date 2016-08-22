// Copied from jQuery 2.2.1 (i think) 2016-03-05. And then simplified.

const queues = new Map(),
  hooks = new Map();

export function finish(elem) {
  const hooks = _queueHooks(elem);

  // Empty the queue first
  queue(elem, []);

  if (hooks && hooks.stop) {
    hooks.stop(true);
  }
}

export function queue(elem, data) {
  let queue;

  if (elem) {
    queue = queues.get(elem);

    // Speed up dequeue by getting out quickly if this is just a lookup
    if (data) {
      if (!queue || Array.isArray(data)) {
        // TODO better makeArray
        queue = Array.isArray(data) ? data : [ data ];
        queues.set(elem, queue);
      } else {
        queue.push(data);
      }
    }

      // Ensure a hooks for this queue
    _queueHooks(elem);

    if (queue[0] !== 'inprogress') {
      dequeue(elem);
    }

    return queue || [];
  }
}

export function dequeue(elem, type) {
  const queue = queues.get(elem) || [],
    hooks = _queueHooks(elem),
    next = () => {
      dequeue(elem);
    };

  let startLength = queue.length,
    fn = queue.shift();

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
}

// Not public - generate a queueHooks object, or return the current one
export function _queueHooks(elem) {
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
