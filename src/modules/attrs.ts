import { VNodeProps } from '../vnode';

function isText(dom: HTMLElement | Text): dom is Text {
  return dom.nodeType === document.TEXT_NODE;
}

export function updateAttrs(
  dom: HTMLElement | Text,
  prevProps: VNodeProps,
  nextProps: VNodeProps
) {
  if (isText(dom)) {
    if (nextProps.nodeValue !== prevProps.nodeValue) {
      dom.nodeValue = nextProps.nodeValue;
    }
    return;
  }

  if (!prevProps && !nextProps) return;
  if (prevProps === nextProps) return;

  const { className: oldKlass, children, ...oldAttrs } = prevProps;
  const { className: klass, children: newChildren, ...attrs } = nextProps;

  const oldOn: { [event: string]: EventListener } = {};
  const on: { [event: string]: EventListener } = {};

  for (const key in oldAttrs) {
    if (key.startsWith('on')) {
      oldOn[key.substring(2).toLowerCase()] = oldAttrs[key];
      delete oldAttrs[key];
    }
  }

  for (const key in attrs) {
    if (key.startsWith('on')) {
      on[key.substring(2).toLowerCase()] = attrs[key];
      delete attrs[key];
    }
  }

  for (const key in attrs) {
    const cur = attrs[key];
    const old = oldAttrs[key];

    if (cur !== old) {
      if (cur === true) {
        dom.setAttribute(key, '');
      } else if (cur === false) {
        dom.removeAttribute(key);
      } else {
        dom.setAttribute(key, cur);
      }
    }
  }

  for (const key in oldAttrs) {
    if (!(key in attrs)) {
      dom.removeAttribute(key);
    }
  }

  if (!klass) {
    dom.removeAttribute('class');
  } else if (oldKlass !== klass) {
    dom.className = klass;
  }

  for (const name in oldOn) {
    if (!on || on[name] !== oldOn[name]) {
      dom.removeEventListener(name, oldOn[name], false);
    }
  }

  for (const name in on) {
    if (!oldOn || on[name] !== oldOn[name]) {
      dom.addEventListener(name, on[name], false);
    }
  }
}
