import { isNil } from 'lodash';
import { updateAttrs } from './modules/attrs';
import { updateClass } from './modules/class';
import { updateListener } from './modules/eventlistener';
import { isVComplexNode, VComplexNode, VNode, VNodeData } from './vnode';

interface Instance {
  dom: Node;
  element: VNode;
  childInstances?: Instance[];
}

let rootInstance: Instance | null;

export function render(element: VNode, parentDOM: HTMLElement) {
  const prevInstance = rootInstance;
  const nextInstance = reconcile(parentDOM, prevInstance, element);
  rootInstance = nextInstance;
}

function reconcile(
  parentDOM: HTMLElement,
  instance: Instance | undefined | null,
  element: VNode | undefined | null
): Instance | null {
  if (isNil(instance)) {
    if (!isNil(element)) {
      const newInstance = instantiate(element);
      parentDOM.appendChild(newInstance.dom);
      return newInstance;
    }
    return null;
  } else if (isNil(element)) {
    parentDOM.removeChild(instance.dom);
    return null;
  } else if (
    isVComplexNode(instance.element) &&
    isVComplexNode(element) &&
    instance.element.type === element.type
  ) {
    updateDOM(instance.dom as HTMLElement, instance.element.data, element.data);
    instance.element = element;
    instance.childInstances = reconcileChildren(instance, element);
    return instance;
  } else {
    const newInstance = instantiate(element);
    parentDOM.replaceChild(newInstance.dom, instance.dom);
    return newInstance;
  }
}

function reconcileChildren(
  instance: Instance,
  element: VComplexNode
): Instance[] {
  const dom = instance.dom as HTMLElement;
  const childInstances = instance.childInstances || [];
  const nextChildren = element.children || [];
  const newChildInstances: Instance[] = [];
  const count = Math.max(childInstances.length, nextChildren.length);
  for (let i = 0; i < count; i++) {
    const childInstance = childInstances[i];
    const childElement = nextChildren[i];
    const newChildInstance = reconcile(dom, childInstance, childElement);
    if (newChildInstance !== null) {
      newChildInstances.push(newChildInstance);
    }
  }
  return newChildInstances;
}

function updateDOM(
  dom: HTMLElement,
  prevData: VNodeData = {},
  data: VNodeData = {}
) {
  updateListener(dom, prevData, data);
  updateClass(dom, prevData, data);
  updateAttrs(dom, prevData, data);
}

function instantiate(vNode: VNode): Instance {
  if (isVComplexNode(vNode)) {
    const { type, data, children = [] } = vNode;
    const dom = document.createElement(type);
    updateDOM(dom, {}, data);
    const childInstances = children.map(instantiate);
    childInstances.forEach(c => dom.appendChild(c.dom));
    return { dom, element: vNode, childInstances };
  } else {
    const node = document.createTextNode(vNode.text);
    return { dom: node, element: vNode };
  }
}
